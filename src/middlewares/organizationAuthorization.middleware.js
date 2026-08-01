const prisma = require("../config/db.config.js");


async function organizationAuthorizationMiddleware(req, res, next) {

try{
    //GET LOGGED IN USER
    const userId = req.user.id;

    //GET ORGANIZATION ID FROM URL
    const organizationId = parseInt(req.params.organizationId);
    
    ////check organization id
    if(!organizationId){
        return res.status(400).json({
            message:"Organization id is required",
            status:"failed"
        });
    }

    //Find user's membership in this organization
    const organizationMember = await prisma.organizationmember.findUnique({
        where:{
             userId_organizationId:{
                userId: userId,
                organizationId: organizationId
             }
        }
    });

//User is not a member
  if(!organizationMember){
    return res.status(403).json({
        message: "You are not a member of this organization ",
        status:"Failed"
    });
  }


  //Store membership information
  req.organizationMember = organizationMember;

  //continue to controller
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