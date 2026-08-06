const prisma = require("../config/db.config.js");
const crypto = require ("crypto");

const   sendInvitationEmail = require("../services/email.service");

//1.CREATE ORGANIZATION CONTROLLER
// Create Organization Controller
async function createOrganizationController(req, res) {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        // Validate organization name
        if (!name) {
            return res.status(400).json({
                message: "Organization name is required",
                status: "failed"
            });
        }

        // Generate base slug
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        // Generate unique slug
        let uniqueSlug = slug;
        let counter = 1;

        while (
            await prisma.organization.findUnique({
                where: {
                    slug: uniqueSlug
                }
            })
        ) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {

            // Create organization
            const organization = await tx.organization.create({
                data: {
                    name,
                    slug: uniqueSlug
                }
            });

            // Add creator as OWNER
            const organizationMember = await tx.organizationMember.create({
                data: {
                    userId,
                    organizationId: organization.id,
                    role: "OWNER"
                }
            });

            return {
                organization,
                organizationMember
            };
        });

        return res.status(201).json({
            message: "Organization created successfully",
            status: "success",
            organization: {
                id: result.organization.id,
                name: result.organization.name,
                slug: result.organization.slug
            }
        });

    } catch (error) {
        console.error("Error creating organization:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



//2.GET MY ORGANIZATION CONTROLLER
async function getMyOrganizationController(req,res){
     try{
      
        const userId=req.user.id;

   
       const organizations = await prisma.organizationMember.findMany({
         where: {
        userId: userId
         },
        include: {
        organization: true
    }
});

return res.status(200).json({
    message:"Organization fetched successfully",
    status:"Success",
    Organizations: organizations
})

     }catch(error){
        return res.status(500).json({
              message: error.message,
              status: "failed"

        });
     }

}




//3.GET ORGANIZATION DETAILS CONTROLLER
async function getOrganizationDetailsController(req, res) {
    try {

           console.log("organizationMember:", prisma.organizationMember);
           console.log("organization:", prisma.organization);

        const userId = req.user.id;
        const organizationId = parseInt(req.params.organizationId);

        console.log("STEP 1");

        const organizationMember = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

        console.log("STEP 2", organizationMember);

        if (!organizationMember) {
            return res.status(403).json({
                message: "You are not a member of this organization",
                status: "failed"
            });
        }

        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId
            }
        });

        console.log("STEP 3", organization);

        if (!organization) {
            return res.status(404).json({
                message: "Organization not found",
                status: "failed"
            });
        }

        return res.status(200).json({
            message: "Organization details fetched successfully",
            status: "success",
            organization: {
                id: organization.id,
                name: organization.name,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt
            },
            role: organizationMember.role
        });

    } catch (error) {
        console.error("ACTUAL ERROR:", error);

        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}




// 4.INVITE MEMBER CONTROLLER

async function inviteMemberController(req,res){
    try{
     
      const organizationId = parseInt(req.params.organizationId);

      const{email,role} = req.body;

     
        if(!email || !role){
             return res.status(400).json({
                message: "Email and role are required",
                status: "failed"
            });
        }

     
         const user = await prisma.user.findUnique({
        where: {
        email: email
         }
       });
     
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failed"
            });
        }            

         const existingMember = await prisma.organizationMember.findUnique({
    where: {
        userId_organizationId: {
            userId: user.id,
            organizationId: organizationId
        }
    }
});
        
          if (existingMember) {
              return res.status(400).json({
             message: "User is already a member of this organization",
             status: "failed"
    });
     }

    
          
        const token = crypto.randomBytes(32).toString("hex");

       
           const expiryDate = new Date();
           expiryDate.setDate(expiryDate.getDate() + 1); 

      
       const invitation = await prisma.invitation.create({
         data: {
        email: email,
        organizationId: organizationId,
        role: role,
        token: token,
        expiresAt: expiryDate
    }
      });

     
         
        const invitationLink =`http://localhost:4000/api/organizations/accept-invitation?token=${token}`;
                 await sendInvitationEmail(
                     email,
                     role,
                    invitationLink
         );


        
         return res.status(201).json({
           message: "Invitation sent successfully",
           status: "success"
});
    } catch(error){
        return res.status(500).json({
            message: "An error occurred while sending the invitation",
            status: "failed"
        })
    }
}



// 5.ACCEPT INVITATION CONTROLLER

async function acceptInvitationController(req, res) {
    try {
  
        const { token } = req.query;


        if (!token) {
            return res.status(400).json({
                message: "Invitation token is required",
                status: "failed"
            });
        }
         //  Find invitation by token
        const invitation = await prisma.invitation.findUnique({
            where: {
                token: token
            }
        });
       
        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found",
                status: "failed"
            });
        }
      
        // 5. Check if invitation has expired
        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Invitation has expired",
                status: "failed"
            });
        }
        
        // 6. Get logged-in user's ID
        const userId = req.user.id;
      
        //find user by id
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failed"
            });
        }

        if (user.email !== invitation.email) {
            return res.status(403).json({
                message: "This invitation was sent to a different email address",
                status: "failed"
            });
        }
         
        // 10. Check if user is already a member

        const existingMember = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: invitation.organizationId
                }
            }
        });

       // 11. Prevent duplicate organization membership
        if (existingMember) {
            return res.status(400).json({
                message: "You are already a member of this organization",
                status: "failed"
            });
        }
        // 12. Add user to organization and delete invitation
        const result = await prisma.$transaction(async (tx) => {
         // 13. Create organization member
            const organizationMember =
                await tx.organizationMember.create({
                    data: {
                        userId: userId,
                        organizationId: invitation.organizationId,
                        role: invitation.role
                    }
                });

       // 14. Delete invitation after accepting
            await tx.invitation.delete({
                where: {
                    id: invitation.id
                }
            });

            return organizationMember;
        });

        return res.status(200).json({
            message: "Invitation accepted successfully",
            status: "success",
            organizationMember: {
                id: result.id,
                userId: result.userId,
                organizationId: result.organizationId,
                role: result.role
            }
        });

    } catch (error) {
        console.error("Error accepting invitation:", error);

        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}


//6.CREATE DEPARTMENT CONTROLLER
  
async function createDepartmentController(req, res) {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const { name } = req.body;

        // Validate organization ID and department name
        if (!organizationId || !name) {
            return res.status(400).json({
                message: "Organization ID and Department Name are required",
                status: "failed"
            });
        }

        // Check if department already exists
        const existingDepartment = await prisma.department.findUnique({
            where: {
                name_organizationId: {
                    name: name,
                    organizationId: organizationId
                }
            }
        });

        if (existingDepartment) {
            return res.status(400).json({
                message: "A department with this name already exists in the organization",
                status: "failed"
            });
        }

        // Create department
        const department = await prisma.department.create({
            data: {
                organizationId: organizationId,
                name: name
            }
        });

        return res.status(201).json({
            message: "Department created successfully",
            status: "success",
            department: department
        });

    } catch (error) {
        console.error("Error creating department:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


//7.GET DEPARTMENT CONTROLLER
   async function getDepartmentsController(req,res){
    try{
     const organizationId = parseInt(req.params.organizationId);

     //validate organization id
        if(!organizationId){
   return res.status(400).json({
      message:"Organization ID is required",
      status:"Failed"
   });
    }

    //Get all the department of the organization
    const departments = await prisma.department.findMany({
        where:{
            organizationId:organizationId
        },
        orderBy:{
            name: "asc"
        }
    });
    return res.status(200).json({
        message:"Departments fetched successfully",
        status:"Success",
        departments: departments
    });

   }catch(error){
    return res.status(500).json({
        message:error.message,
        status:"Failed"
    });
   }
}


//7.SINGLE DEPARTMENT CONTROLLER
async function getDepartmentController(req, res) {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const departmentId = parseInt(req.params.departmentId);

        // Validate IDs
        if (!organizationId || !departmentId) {
            return res.status(400).json({
                message: "Organization ID and Department ID are required",
                status: "failed"
            });
        }

        // Find department belonging to the organization
        const department = await prisma.department.findFirst({
            where: {
                id: departmentId,
                organizationId: organizationId
            }
        });

        // Department not found
        if (!department) {
            return res.status(404).json({
                message: "Department not found",
                status: "failed"
            });
        }

        return res.status(200).json({
            message: "Department fetched successfully",
            status: "success",
            department: department
        });

    } catch (error) {
        console.error("Error fetching department:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


//8.Update Department CONTROLLER
 async function updateDepartmentController(req,res){
    try{
     const organizationId = parseInt(req.params.organizationId);
        const departmentId = parseInt(req.params.departmentId);

        const {name} = req.body;

         //Validate IDs and name
        if(!organizationId || !departmentId || !name){
            return res.status(400).json({
                message:"Organization ID, Department ID and name are required",
                status:"failed"
            });
        }

        //Check if department exists
        const department = await prisma.department.findFirst({
            where:{
                id:departmentId,
                organizationId:organizationId
            }
        });

        //IF department doesnt exist
        if(!department){
            return res.status(404).json({
                message:"Department not found",
                status:"failed"
            });
        }

        //Update department
        const updatedDepartment = await prisma.department.update({
            where:{
                id:departmentId,
                organizationId:organizationId
            },
            data:{
                name:name
            }
        });

        return res.status(200).json({
            message:"Department updated successfully",
            status:"success",
            department: updatedDepartment
        });
    } catch (error) {
        return res.status(500).json({
            message:"Internal server error",
            status:"failed"
        });
    }
}


//9.Delete Department Controller
  async function deleteDepartmentController(req,res){
    try{
      
        const organizationId = parseInt(req.params.organizationId);
        const departmentId = parseInt(req.params.departmentId);

        //Validation Ids
        if(!organizationId || !departmentId)
        {
          return res.status(400).json({
          message:"Organization ID and Department ID are required",
          status:"failed"
          });
         }

   //check if department exists
        const department = await prisma.department.findFirst({
            where:{
                id:departmentId,
                organizationId:organizationId
            }
        });

        //If department doesnt exist
        if(!department){
            return res.status(404).json({
                message:"Department Not Found",
                status:"failed"
            });
        }

        //Delete Department
        const DeleteDepartment= await prisma.department.delete({
            where:{
                id: departmentId,
                organizationId:organizationId
            }
        });


        return res.status(200).json({
            message:"Department Deleted Successfully",
            status:"success",
            department: DeleteDepartment
        });
    } catch(error){
          console.error("Error deleting department:", error);
          
        return res.status(500).json({
            message:"Internal server error",
            status:"failed"
        });
    }
  }

  // 10  COMPLETE RBAC ROLE BASED ACCESS CONTROL IMPLEMENTATION FOR ORGANIZATION MEMBERSHIP MANAGEMENT
      //1 Get Organization Members Controller
async function getOrganizationMembersController(req, res) {
    try {
        const organizationId = parseInt(req.params.organizationId);

        // Validate organization ID
        if (!organizationId) {
            return res.status(400).json({
                message: "Organization ID is required",
                status: "failed"
            });
        }

        // Find all members of the organization
        const members = await prisma.organizationMember.findMany({
            where: {
                organizationId: organizationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Check if organization has no members
        if (members.length === 0) {
            return res.status(404).json({
                message: "No members found in this organization",
                status: "failed"
            });
        }

        return res.status(200).json({
            message: "Organization members fetched successfully",
            status: "success",
            members: members
        });

    } catch (error) {
        console.error("Error fetching organization members:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


//2 Update Member Role Controller
async function updateMemberRoleController(req, res) {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const userId = parseInt(req.params.userId);

        const { role } = req.body;

        // Validate IDs and role
        if (!organizationId || !userId || !role) {
            return res.status(400).json({
                message: "Organization ID, User ID and role are required",
                status: "failed"
            });
        }

        // Valid roles
        const validRoles = [
            "OWNER",
            "ADMIN",
            "RECRUITER",
            "INTERVIEWER",
            "MEMBER"
        ];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
                status: "failed"
            });
        }

        // Get the member whose role is being changed
        const member = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

        if (!member) {
            return res.status(404).json({
                message: "Member not found in this organization",
                status: "failed"
            });
        }

        // Get the currently logged-in user's membership
        const currentUserId = req.user.id;

        const currentUserMember =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: currentUserId,
                        organizationId: organizationId
                    }
                }
            });

        if (!currentUserMember) {
            return res.status(403).json({
                message: "You are not a member of this organization",
                status: "failed"
            });
        }

        // ADMIN cannot change OWNER's role
        if (
            currentUserMember.role === "ADMIN" &&
            member.role === "OWNER"
        ) {
            return res.status(403).json({
                message: "ADMIN cannot change the OWNER's role",
                status: "failed"
            });
        }

        // ADMIN cannot promote anyone to OWNER
        if (
            currentUserMember.role === "ADMIN" &&
            role === "OWNER"
        ) {
            return res.status(403).json({
                message: "Only OWNER can assign the OWNER role",
                status: "failed"
            });
        }

        // Update role
        const updatedMember = await prisma.organizationMember.update({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            },
            data: {
                role: role
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Member role updated successfully",
            status: "success",
            member: updatedMember
        });

    } catch (error) {
        console.error("Error updating member role:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



// 3: Remove Organization Member Controller
async function removeOrganizationMemberController(req, res) {
    try {
        const organizationId = parseInt(req.params.organizationId);
        const userId = parseInt(req.params.userId);

        // Validate IDs
        if (!organizationId || !userId) {
            return res.status(400).json({
                message: "Organization ID and User ID are required",
                status: "failed"
            });
        }

        // Find the member in the organization
        const member = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

        // Check if member exists
        if (!member) {
            return res.status(404).json({
                message: "Member not found in this organization",
                status: "failed"
            });
        }

        // Prevent removing the OWNER
        if (member.role === "OWNER") {
            return res.status(403).json({
                message: "Organization OWNER cannot be removed",
                status: "failed"
            });
        }

        // Delete the member from organization
        const deletedMember = await prisma.organizationMember.delete({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

        return res.status(200).json({
            message: "Member removed successfully",
            status: "success",
            member: deletedMember
        });

    } catch (error) {
        console.error("Error removing organization member:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



      
        
module.exports={
    createOrganizationController,
    getMyOrganizationController,
    getOrganizationDetailsController,
    inviteMemberController,
    acceptInvitationController,
    createDepartmentController,
    getDepartmentsController,
    getDepartmentController,
    updateDepartmentController,
    deleteDepartmentController,
    getOrganizationMembersController,
    updateMemberRoleController,
    removeOrganizationMemberController
}
