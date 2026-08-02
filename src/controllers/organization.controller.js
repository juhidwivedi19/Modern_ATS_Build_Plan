const prisma = require("../config/db.config.js");
const crypto = require ("crypto");

const   sendInvitationEmail = require("../services/email.service");

//1.CREATE ORGANIZATION CONTROLLER
async function createOrganizationController(req,res) {
     try{
    const {name} = req.body;

 
  const userId = req.user.id;


     if(!name){
        return res.status(400).json({
            message:"Organization name is required",
            status: "failed"
        });
     }

  const result = await prisma.$transaction(async (tx) => {

    const organization = await tx.organization.create({
        data: {
            name: name
        }
    });

    const organizationMember = await tx.organizationMember.create({
        data: {
            userId: userId,
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
        name: result.organization.name
    }
});
   

     }catch(error){
        return res.status(500).json({
            message: error.message,
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

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Invitation has expired",
                status: "failed"
            });
        }

        const userId = req.user.id;

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

        const existingMember = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: invitation.organizationId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                message: "You are already a member of this organization",
                status: "failed"
            });
        }

        const result = await prisma.$transaction(async (tx) => {

            const organizationMember =
                await tx.organizationMember.create({
                    data: {
                        userId: userId,
                        organizationId: invitation.organizationId,
                        role: invitation.role
                    }
                });

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
    deleteDepartmentController
}
