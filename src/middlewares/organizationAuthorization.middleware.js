const prisma = require("../config/db.config.js");


async function organizationAuthorizationMiddleware(req, res, next) {

try{

    const userId = req.user.id;

    const organizationId = parseInt(req.params.organizationId);
    
 
    if(!organizationId){
        return res.status(400).json({
            message:"Organization id is required",
            status:"failed"
        });
    }

    
    const organizationMember = await prisma.organizationmember.findUnique({
        where:{
             userId_organizationId:{
                userId: userId,
                organizationId: organizationId
             }
        }
    });


  if(!organizationMember){
    return res.status(403).json({
        message: "You are not a member of this organization ",
        status:"Failed"
    });
  }


  req.organizationMember = organizationMember;


  next();
  
} catch(error){
    return res.status(500).json({
        message:error.message,
        status:"failed"
    });
}
}


module.exports={
    organizationAuthorizationMiddleware
}
