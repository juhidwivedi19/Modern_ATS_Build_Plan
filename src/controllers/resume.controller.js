const prisma = require("../config/db.config.js");

const {
    uploadToS3,
    deleteFromS3,
    getSignedUrl
} = require("../services/s3.service.js");

const {
    createActivityLog
} = require("../services/activityLog.service.js");
//Add queue import
const resumeQueue = require("../queues/resume.queue.js");

//1..........
// Controller for uploading candidate resume
// Controller for uploading candidate resume
async function uploadResume(req, res) {
    try {
        if (!req.user || !req.user.id) {
          return res.status(401).json({
        message: "Authentication required",
        status: "failed"
          });
      }

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

await createActivityLog({
    performedById: userId,
    action: "RESUME_UPLOADED"
});
        //Added BULLMQ JOB
       await resumeQueue.add(
    "process-resume",
    {
        resumeId: resume.id,
        fileKey: resume.fileKey,
        fileType: resume.fileType
    },
    {
        //bullmq retries +backoff
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        },
        //REMOVE ON CMPLT ,REMOVE ON FAIL
        //JOB CLEANUP AND RETENTION
         removeOnComplete: {
            count: 100
        },

        removeOnFail: {
            count: 500
        }
    }
);

        // Send success response
        return res.status(201).json({
            message: "Resume uploaded successfully",
            status: "success",
            data: {
                resumeId: resume.id,
                fileName: resume.fileName,
                processingStatus: resume.processingStatus
            }
        });


    } catch (error) {

        console.error("Resume upload error:", error);

        return res.status(500).json({
            message: "Failed to upload resume",
            status: "failed"
        });
    }
}


//2...........
//STEP:-Candidate can get their resume
 async function getCandidateResume(req,res){
    try{

        //Check Authentication
        if(!req.user ||!req.user.id){
            return res.status(401).json({
                message:"Authentication required",
                status:"failed"
            })
        }

         // Get logged-in user's ID from authentication middleware
        const userId = req.user.id;

        //validate candidate Id
        const candidate= await prisma.candidate.findUnique({
            where:{
               userId:userId
            }
        })
  //Check whether candidate exist
        if(!candidate){
            return res.status(404).json({
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
            status:"success",
             data: resumes
          })


    }catch(error){
        console.log()

        return res.status(500).json({
            message:"Internal server error",
            status:"failed"
        })
    }

 }


//3.............
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


//4...........
// Controller for generating a secure resume download URL
async function getResumeDownloadUrl(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        // 2. Get resume ID from URL
        const resumeId = Number(req.params.resumeId);

        // 3. Validate resume ID
        if (!Number.isInteger(resumeId) || resumeId <= 0) {
            return res.status(400).json({
                message: "Valid resume ID is required",
                status: "failed"
            });
        }

        // 4. Get logged-in user's ID
        const userId = req.user.id;

        // 5. Find resume along with candidate
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId
            },
            include: {
                candidate: true
            }
        });

        // 6. Resume doesn't exist
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
                status: "failed"
            });
        }

        // 7. Check whether resume belongs to logged-in user
        if (resume.candidate.userId !== userId) {
            return res.status(403).json({
                message: "You are not authorized to access this resume",
                status: "failed"
            });
        }

        // 8. Check whether S3 file key exists
        if (!resume.fileKey) {
            return res.status(404).json({
                message: "Resume file not found in storage",
                status: "failed"
            });
        }

        // 9. Generate temporary signed URL
        const signedUrl = await getSignedUrl(resume.fileKey);

        // 10. Return signed URL
        return res.status(200).json({
            message: "Resume download URL generated successfully",
            status: "success",
            data: {
                resumeId: resume.id,
                fileName: resume.fileName,
                downloadUrl: signedUrl,
                expiresIn: 300
            }
        });

    } catch (error) {

        console.error(
            "Resume download URL error:",
            error
        );

        return res.status(500).json({
            message: "Failed to generate resume download URL",
            status: "failed"
        });
    }
}


//5............
//GET RESUME PROCESSING STATUS
async function getResumeProcessingStatus(req, res) {
    try {
        // Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        // Get resume ID
        const resumeId = Number(req.params.resumeId);

        if (!Number.isInteger(resumeId) || resumeId <= 0) {
            return res.status(400).json({
                message: "Valid resume ID is required",
                status: "failed"
            });
        }

        // Find resume with candidate
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId
            },
            include: {
                candidate: true
            }
        });

        // Resume not found
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
                status: "failed"
            });
        }

        // Check ownership
        if (resume.candidate.userId !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to access this resume",
                status: "failed"
            });
        }

        return res.status(200).json({
            message: "Resume processing status fetched successfully",
            status: "success",
            data: {
                resumeId: resume.id,
                fileName: resume.fileName,
                processingStatus: resume.processingStatus
            }
        });

    } catch (error) {
        console.error(
            "Resume processing status error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch resume processing status",
            status: "failed"
        });
    }
}


//6...............
// SEARCH RESUMES
async function searchResumes(req, res) {
    try {
        // Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        // Get search query
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                message: "Search query is required",
                status: "failed"
            });
        }

        // Search resumes using PostgreSQL full-text search
        const resumes = await prisma.$queryRaw`
            SELECT
                r.id,
                r."candidateId",
                r."fileName",
                r."fileType",
                r."fileSize",
                r."processingStatus",
                r."uploadedAt",
                r.name,
                r.email,
                r.phone,
                r.skills,
                r.education,
                r.experience,
                r.projects
            FROM "Resume" r
            WHERE
                r."processingStatus" = 'COMPLETED'
                AND to_tsvector(
                    'english',
                    COALESCE(r."searchText", '')
                ) @@ plainto_tsquery(
                    'english',
                    ${query}
                )
            ORDER BY r."uploadedAt" DESC
        `;

        return res.status(200).json({
            message: "Resumes searched successfully",
            status: "success",
            data: resumes
        });

    } catch (error) {
        console.error("Resume search error:", error);

        return res.status(500).json({
            message: "Failed to search resumes",
            status: "failed"
        });
    }
}




module.exports = {
    uploadResume,
    getCandidateResume,
    deleteResume,
    getResumeDownloadUrl,
    getResumeProcessingStatus,
    searchResumes
};