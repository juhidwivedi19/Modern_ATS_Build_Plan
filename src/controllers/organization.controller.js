const prisma = require("../config/db.config.js");


async function createOrganizationController(req,res) {
     try{
    const {name} = req.body;

  
    //GET LOGGED IN USER
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



//GET MY ORGANIZATION

async function getMyOrganizationController(req,res){
     try{
        //get logged in user
        const userId=req.user.id;

        // // Now find all organizations
        // where this user is a member
       const organizations = await prisma.organizationMember.findMany({
         where: {
        userId: userId
         },
        include: {
        organization: true
    }
});

return res.status(201).json({
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




// GET ORGANIZATION DETAILS

async function getOrganizationDetailsController(req, res) {
    try {

        // Get logged-in user
        const userId = req.user.id;

        // Get organization ID from URL
        const organizationId = parseInt(req.params.organizationId);

        if (!organizationId) {
            return res.status(400).json({
                message: "Organization ID is required",
                status: "failed"
            });
        }

        // Check whether user belongs to this organization
        const organizationMember = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: organizationId
                }
            }
        });

        // User is not a member
        if (!organizationMember) {
            return res.status(403).json({
                message: "You are not a member of this organization",
                status: "failed"
            });
        }

        // Find organization
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId
            }
        });

        // Organization not found
        if (!organization) {
            return res.status(404).json({
                message: "Organization not found",
                status: "failed"
            });
        }

        // Send response
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

module.exports={
    createOrganizationController,
    getMyOrganizationController,
    getOrganizationDetailsController
}
