const prisma = require("../config/db.config.js");

const { uploadToS3,deleteFromS3 } = require("../services/s3.service.js");


// Controller for uploading candidate resume
// Controller for uploading candidate resume
async function uploadResume(req, res) {
    try {

        // Get logged-in user's ID from authentication middleware
        const userId = req.user.id;


        // Find candidate belonging to the logged-in user
        const candidate = await prisma.candidate.findUnique({
            where: {
                userId: userId
            }
        });


        // Candidate profile does not exist
        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found",
                status: "failed"
            });
        }


        // Check whether Multer received a file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required",
                status: "failed"
            });
        }


        // Create a unique file name
        const uniqueName =
            Date.now() + "-" + req.file.originalname;


        // Create S3 object key using the authenticated candidate's ID
        const key = `resumes/${candidate.id}/${uniqueName}`;


        // Upload resume to AWS S3
        const fileKey = await uploadToS3(
            req.file,
            key
        );


        // Save resume information in PostgreSQL
        const resume = await prisma.resume.create({
            data: {
                candidateId: candidate.id,
                fileName: req.file.originalname,
                fileKey: fileKey,
                fileType: req.file.mimetype,
                fileSize: req.file.size
            }
        });


        // Send success response
        return res.status(201).json({
            message: "Resume uploaded successfully",
            status: "success",
            data: resume
        });


    } catch (error) {

        console.error("Resume upload error:", error);

        return res.status(500).json({
            message: "Failed to upload resume",
            status: "failed"
        });
    }
}


//Candidate can get their resume
 async function getCandidateResume(req,res){
    try{
         // Get logged-in user's ID from authentication middleware
        const userId = req.user.Id;

        //validate candidate Id
        const candidate= await prisma.candidate.findUnique({
            where:{
               userId:userId
            }
        })
  //Check whether candidate exist
        if(!candidate){
            return res.status(400).json({
                message:"Candidate profile not found",
                status:"Failed"
            })
        }

          // Find all resumes belonging to this candidate
        const resumes = await prisma.resume.findMany({
            where: {
                candidateId: candidate.id
            },
            orderBy: {
                uploadedAt: "desc"
            }
        });
        
          return res.status(200).json({
            message:"Resume fetched successfully",
            status:"success"
          })


    }catch(error){
        console.log()

        return res.status(500).json({
            message:"Internal server error",
            status:"failed"
        })
    }

 }


 // Controller for deleting candidate resume
async function deleteResume(req, res) {
    try {

        // Get resume ID from URL
        const resumeId = parseInt(req.params.resumeId);

        // Validate resume ID
        if (isNaN(resumeId)) {
            return res.status(400).json({
                message: "Valid resume ID is required",
                status: "failed"
            });
        }

        // Get logged-in user's ID from authentication middleware
        const userId = req.user.id;

        // Find resume along with its candidate
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId
            },
            include: {
                candidate: true
            }
        });


        // Resume doesn't exist
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
                status: "failed"
            });
        }


        // Check whether this resume belongs to logged-in user
        if (resume.candidate.userId !== userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this resume",
                status: "failed"
            });
        }

        // Delete actual file from AWS S3
        await deleteFromS3(resume.fileKey);


        // Delete resume record from PostgreSQL
        await prisma.resume.delete({
            where: {
                id: resumeId
            }
        });


        return res.status(200).json({
            message: "Resume deleted successfully",
            status: "success"
        });


    } catch (error) {

        console.error("Delete resume error:", error);

        return res.status(500).json({
            message: "Failed to delete resume",
            status: "failed"
        });
    }
}


module.exports = {
    uploadResume,
    getCandidateResume,
    deleteResume
};