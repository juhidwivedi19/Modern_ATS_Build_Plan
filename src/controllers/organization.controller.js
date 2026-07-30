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

  

     const organization = await prisma.organization.create({
        data:{
            name:name
        }
     });



     await prisma.organizationMember.create({
        data:{
            userId: userId,
            organizationId: organization.id,
            role:"OWNER"
        }
     });

 

     return res.status(201).json({
        message: "Organization created successfully",
        status:"success",
        organization:{
            id: organization.id,
            name: organization.name
        }
     });

     }catch(error){
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
     }
}

module.exports={
    createOrganizationController
}
