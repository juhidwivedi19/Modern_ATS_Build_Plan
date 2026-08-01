const prisma = require("../config/db.config.js");


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

module.exports={
    createOrganizationController,
    getMyOrganizationController,
    getOrganizationDetailsController
}
