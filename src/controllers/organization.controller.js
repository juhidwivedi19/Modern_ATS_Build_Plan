const prisma = require("../config/db.config.js");
const crypto = require ("crypto");

const   sendInvitationEmail = require("../services/email.service");

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





async function getOrganizationDetailsController(req, res) {
    try {

      
        const userId = req.user.id;

        const organizationId = parseInt(req.params.organizationId);

        if (!organizationId) {
            return res.status(400).json({
                message: "Organization ID is required",
                status: "failed"
            });
        }

       
        const organizationMember = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

     
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

        return res.status(500).json({
            message: error.message,
            status: "failed"
        });

    }
}




//INVITE MEMBER CONTROLLER

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






// ACCEPT INVITATION CONTROLLER

// ACCEPT INVITATION CONTROLLER

async function acceptInvitationController(req, res) {
    try {
        // 1. Get invitation token from query parameter
        const { token } = req.query;

        // 2. Validate token
        if (!token) {
            return res.status(400).json({
                message: "Invitation token is required",
                status: "failed"
            });
        }

        // 3. Find invitation by token
        const invitation = await prisma.invitation.findUnique({
            where: {
                token: token
            }
        });

        // 4. Check if invitation exists
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

        // 6. Get logged-in user
        const userId = req.user.id;

        // 7. Find logged-in user
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        // 8. Check if user exists
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failed"
            });
        }

        // 9. Verify user's email matches invitation email
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

        if (existingMember) {
            return res.status(400).json({
                message: "You are already a member of this organization",
                status: "failed"
            });
        }

        // 11. Create organization member
        // 12. Delete invitation
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

        // 13. Return success response
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

module.exports={
    createOrganizationController,
    getMyOrganizationController,
    getOrganizationDetailsController,
    inviteMemberController,
    acceptInvitationController
}
