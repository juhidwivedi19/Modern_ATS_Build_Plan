const prisma = require("../db/db.config.js")
const jwt=require("jsonwebtoken")


async function authMiddleware(req,res,next){

    try{
     // Get access token from cookie or Authorization header
       const token = 
       req.cookies.token ||
       req.headers.authorization?.split(" ")[1];
  
       if(!token){
        return res.status(401).json({
            message: "Unauthorized access ,token is missing",
            status:"failed"
        });
       }
    
       //verify jwt
       const decoded= jwt.verify(
        token,
        process.env.JWT_SECRET
       );

       //GET USERID FROM TOKEN
       const userId = decoded.userId;

       if(!userId){
        return res.status(401).json({
            message: "Invalid token payload",
            status: "failed"
        });
       }

       //now find user in postgresql using prisma
       const user= await prisma.user.findUnique({
          where: {
            id:userId
          }
       });

       //Now check if user exists
       if(!user) {
        return res.status(401).json({
            message: "User not found",
            status: "failed"
        });
       }

       req.user =user;

       next();
} catch(error){
    return res.status(401).json({
        message: "Unauthorized access, invalid or expired token",
        status :"failed"
    });
}

}
module.exports = {
    authMiddleware
}