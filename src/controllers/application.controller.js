const prisma = require("../config/db.config.js");

async function createApplicationController(req, res) {
    try {

        // 1. Get jobId from URL
      const jobId = Number(req.params.jobId);

   if (!Number.isInteger(jobId) || jobId <= 0) {
       return res.status(400).json({
         message: "Valid job ID is required",
         status: "failed"
    });
}

    if (!req.user || !req.user.id) {
        return res.status(401).json({
        message: "Authentication required",
        status: "failed"
      });
         }
        // 2. Get logged-in user's ID
        const userId = req.user.id;

        // 3. Get application data
        const {
            resumeId,
            coverLetter
        } = req.body;



        // 5. Validate resume ID
        const parsedResumeId = parseInt(resumeId);

        if (isNaN(parsedResumeId)) {
            return res.status(400).json({
                message: "Valid resume ID is required",
                status: "failed"
            });
        }


        // 6. Find candidate belonging to logged-in user
        const candidate = await prisma.candidate.findUnique({
            where: {
                userId: userId
            }
        });


        // Candidate profile doesn't exist
        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found",
                status: "failed"
            });
        }


        // 7. Check whether job exists
        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });


        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                status: "failed"
            });
        }


        // 8. Only published jobs can receive applications
        if (job.status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Applications are not open for this job",
                status: "failed"
            });
        }


        // 9. Find the selected resume
        const resume = await prisma.resume.findUnique({
            where: {
                id: parsedResumeId
            }
        });


        // Resume doesn't exist
        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
                status: "failed"
            });
        }


        // 10. Check resume ownership
        if (resume.candidateId !== candidate.id) {
            return res.status(403).json({
                message: "You are not authorized to use this resume",
                status: "failed"
            });
        }


        // 11. Check whether candidate already applied
        const existingApplication =
            await prisma.application.findUnique({
                where: {
                    candidateId_jobId: {
                        candidateId: candidate.id,
                        jobId: job.id
                    }
                }
            });


        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job",
                status: "failed"
            });
        }


        // 12. Create application
        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                resumeId: resume.id,
                coverLetter: coverLetter || null
            }
        });


        // 13. Send success response
        return res.status(201).json({
            message: "Application submitted successfully",
            status: "success",
            data: application
        });


    } catch (error) {

        console.error("Error creating application:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


//Get candidate application controller
async function getCandidateApplicationsController(req,res){
  try{
    //get logged in user id
  const userId = req.user.id;

   // Find Candidate using userId
  const candidate = await prisma.candidate.findUnique({
    where:{
        userId:userId
    }
  });

  //if candidate doesnt exist
  if(!candidate){
    return res.status(404).json({
        message:"Candidate not found",
        status:"failed"
    });
  }

  //Find all application belonging to this candidate
   const application = await prisma.application.findMany({
    where:{
        candidateId:candidate.id
    },
    //Get related Job and RESUME INFORMATION
    include:{
        job:true,
        resume:true
    },

    //Show newest application first
    orderBy:{
        appliedAt: "desc"
    }
   });

   return res.status(200).json({
    message:"Application fetched successfully",
    status:"success",
    data:applications
   });

  }catch(error){
    console.error("Error fetching candidate application",error)

    return res.status(500).json({
        message:"Internal server error",
        status:"failed"
    });
  }
}


//Get a Single Application
async function getApplicationController(req,res){
    try{
        //Get application Id from URL
     const applicationId = parseInt(req.params.applicationId);

     //get loggedin user  Id
     const userId = req.user.id;

     //validate application id
     if(isNaN(applicationId)){
        return res.status(400).json({
            message:"Valid application id is required",
            status:"failed"
        });
     }

     //Find candidate using logged in user's id
     const candidate= await prisma.candidate.findUnique({
        where:{
            userId: userId
        }
     });

     //Candidate doesnt exist
     if(!candidate){
        return res.status(404).json({
            message:"Candidate not found",
            status: "failed"
        });
     }

     //find application
     const application = await prisma.application.findUnique({
        where:{
            id:applicationId
        },
        include:{
            job:true,
            resume:true
        }
     });

     //Application doesn't exist
     if(!application){
        return res.status(404).json({
                message: "Application not found",
                status: "failed"
            });
     }

       // Check whether application belongs to logged-in candidate
        if (application.candidateId !== candidate.id) {
            return res.status(403).json({
                message: "You are not authorized to view this application",
                status: "failed"
            });
        }


        // Return application
        return res.status(200).json({
            message: "Application fetched successfully",
            status: "success",
            data: application
        });
    }catch(error){
        console.error("",error)

        return res.status(500).json({
            message:"Internal server error",
            status:"failed"
        })
    }
}



//Get Job Application Controller
//WHere recruiter can see your application name email resume...all you filled
async function getJobApplicationsController(req, res) {
    try {

        // 1. Get job ID from URL
        const jobId = parseInt(req.params.jobId);

        // 2. Get logged-in user's ID
        const userId = req.user.id;


        // 3. Validate job ID
        if (isNaN(jobId)) {
            return res.status(400).json({
                message: "Valid job ID is required",
                status: "failed"
            });
        }


        // 4. Find the job
        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });


        // 5. Check whether job exists
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                status: "failed"
            });
        }


        // 6. Check whether logged-in user belongs
        // to the organization that owns this job
        const member = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: job.organizationId
                }
            }
        });


        // 7. User is not a member of this organization
        if (!member) {
            return res.status(403).json({
                message: "You are not authorized to view applications for this job",
                status: "failed"
            });
        }


        // 8. Find all applications for this job
        const applications = await prisma.application.findMany({
            where: {
                jobId: jobId
            },
            include: {
                candidate: true,
                resume: true
            },
            orderBy: {
                appliedAt: "desc"
            }
        });


        // 9. Return applications
        return res.status(200).json({
            message: "Job applications fetched successfully",
            status: "success",
            data: applications
        });


    } catch (error) {

        console.error("Error fetching job applications:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


module.exports = {
    createApplicationController,
    getCandidateApplicationsController,
    getApplicationController,
    getJobApplicationsController
};