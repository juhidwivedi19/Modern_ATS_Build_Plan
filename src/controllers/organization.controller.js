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
      // 1. Get organizationId from req.params
      const organizationId = parseInt(req.params.organizationId);

        // 2. Get email and role from req.body
      const{email,role} = req.body;

        // 3. Validate input
        if(!email || !role){
             return res.status(400).json({
                message: "Email and role are required",
                status: "failed"
            });
        }

        // 4. Check if user already belongs to organization

          // First find the user using the email:
         const user = await prisma.user.findUnique({
        where: {
        email: email
         }
       });
         // If the user doesn't exist:
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failed"
            });
        }
            // Now check if the user is already a member of the organization:
         const existingMember = await prisma.organizationMember.findUnique({
    where: {
        userId_organizationId: {
            userId: user.id,
            organizationId: organizationId
        }
    }
});
          //if aslready a member, return an error
          if (existingMember) {
              return res.status(400).json({
             message: "User is already a member of this organization",
             status: "failed"
    });
     }

        // 5. Generate invitation token  using crypto and token in upper start
          
        const token = crypto.randomBytes(32).toString("hex");

        // 6. Set expiry
           const expiryDate = new Date();
           expiryDate.setDate(expiryDate.getDate() + 1); // Set expiry to 1 day from now

        // 7. Create invitation
       const invitation = await prisma.invitation.create({
         data: {
        email: email,
        organizationId: organizationId,
        role: role,
        token: token,
        expiresAt: expiryDate
    }
      });

        // 8. Send invitation email
         
        const invitationLink =`http://localhost:4000/api/organizations/accept-invitation?token=${token}`;
                 await sendInvitationEmail(
                     email,
                     role,
                    invitationLink
         );


        // 9. Return response
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

module.exports={
    createOrganizationController,
    getMyOrganizationController,
    getOrganizationDetailsController,
    inviteMemberController

}
