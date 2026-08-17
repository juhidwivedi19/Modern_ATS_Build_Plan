const prisma = require("../config/db.config.js");


// ======================================================
// 1. CREATE APPLICATION
// Candidate applies for a published job
// ======================================================

async function createApplicationController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        // 2. Get logged-in user's ID
        const userId = req.user.id;

        // 3. Get job ID from URL
        const jobId = Number(req.params.jobId);

        // 4. Validate job ID
        if (!Number.isInteger(jobId) || jobId <= 0) {
            return res.status(400).json({
                message: "Valid job ID is required",
                status: "failed"
            });
        }

        // 5. Get application data
        const {
            resumeId,
            coverLetter
        } = req.body;

        // 6. Validate resume ID
        const parsedResumeId = Number(resumeId);

        if (
            !Number.isInteger(parsedResumeId) ||
            parsedResumeId <= 0
        ) {
            return res.status(400).json({
                message: "Valid resume ID is required",
                status: "failed"
            });
        }

        // 7. Validate cover letter
        if (
            coverLetter !== undefined &&
            coverLetter !== null &&
            typeof coverLetter !== "string"
        ) {
            return res.status(400).json({
                message: "Cover letter must be a string",
                status: "failed"
            });
        }

        if (
            typeof coverLetter === "string" &&
            coverLetter.length > 5000
        ) {
            return res.status(400).json({
                message: "Cover letter cannot exceed 5000 characters",
                status: "failed"
            });
        }

        // FIND CANDIDATE

        const candidate = await prisma.candidate.findUnique({
            where: {
                userId: userId
            }
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found",
                status: "failed"
            });
        }

        // FIND JOB

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


        // Only published jobs can receive applications
        if (job.status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Applications are not open for this job",
                status: "failed"
            });
        }

        // FIND RESUME

        const resume = await prisma.resume.findUnique({
            where: {
                id: parsedResumeId
            }
        });

        if (!resume) {
            return res.status(404).json({
                message: "Resume not found",
                status: "failed"
            });
        }

        // CHECK RESUME OWNERSHIP

        if (resume.candidateId !== candidate.id) {
            return res.status(403).json({
                message: "You are not authorized to use this resume",
                status: "failed"
            });
        }

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

        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                resumeId: resume.id,
                coverLetter:
                    coverLetter && coverLetter.trim()
                        ? coverLetter.trim()
                        : null
            },
            include: {
                job: true,
                resume: true
            }
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            status: "success",
            data: application
        });


    } catch (error) {

        console.error(
            "Error creating application:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



// ======================================================
// 2. GET ALL APPLICATIONS OF LOGGED-IN CANDIDATE
// ======================================================

async function getCandidateApplicationsController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        // 2. Get logged-in user ID
        const userId = req.user.id;


        // 3. Find candidate
        const candidate = await prisma.candidate.findUnique({
            where: {
                userId: userId
            }
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found",
                status: "failed"
            });
        }


        // 4. Find all applications
        const applications =
            await prisma.application.findMany({
                where: {
                    candidateId: candidate.id
                },

                include: {
                    job: {
                        include: {
                            organization: true
                        }
                    },

                    resume: true
                },

                // Newest application first
                orderBy: {
                    appliedAt: "desc"
                }
            });


        // 5. Return applications
        return res.status(200).json({
            message: "Applications fetched successfully",
            status: "success",
            count: applications.length,
            data: applications
        });


    } catch (error) {

        console.error(
            "Error fetching candidate applications:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



// ======================================================
// 3. GET SINGLE APPLICATION
// Candidate can only see their own application
// ======================================================

async function getApplicationController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }


        // 2. Get application ID
        const applicationId =
            Number(req.params.applicationId);


        // 3. Validate application ID
        if (
            !Number.isInteger(applicationId) ||
            applicationId <= 0
        ) {
            return res.status(400).json({
                message: "Valid application ID is required",
                status: "failed"
            });
        }


        // 4. Get logged-in user ID
        const userId = req.user.id;


        // 5. Find candidate
        const candidate = await prisma.candidate.findUnique({
            where: {
                userId: userId
            }
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found",
                status: "failed"
            });
        }


        // 6. Find application
        const application =
            await prisma.application.findUnique({
                where: {
                    id: applicationId
                },

                include: {
                    job: {
                        include: {
                            organization: true
                        }
                    },

                    resume: true
                }
            });


        // 7. Application doesn't exist
        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                status: "failed"
            });
        }


        // 8. Check ownership
        if (
            application.candidateId !== candidate.id
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to view this application",
                status: "failed"
            });
        }


        // 9. Return application
        return res.status(200).json({
            message: "Application fetched successfully",
            status: "success",
            data: application
        });


    } catch (error) {

        console.error(
            "Error fetching application:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



// ======================================================
// 4. GET JOB APPLICATIONS
// Recruiter/company member can see applications
// ======================================================

async function getJobApplicationsController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }


        // 2. Get job ID
        const jobId = Number(req.params.jobId);


        // 3. Validate job ID
        if (
            !Number.isInteger(jobId) ||
            jobId <= 0
        ) {
            return res.status(400).json({
                message: "Valid job ID is required",
                status: "failed"
            });
        }


        // 4. Get logged-in user ID
        const userId = req.user.id;


        // 5. Find job
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

        const member =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: userId,
                        organizationId: job.organizationId
                    }
                }
            });


        if (!member) {
            return res.status(403).json({
                message:
                    "You are not authorized to view applications for this job",
                status: "failed"
            });
        }

        const applications =
            await prisma.application.findMany({

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

        return res.status(200).json({
            message: "Job applications fetched successfully",
            status: "success",
            count: applications.length,
            data: applications
        });


    } catch (error) {

        console.error(
            "Error fetching job applications:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}




//=============================================================
//5. Create applicationPipeline.controller.js
//=====================================================================
async function moveApplicationController(req, res) {
    try {

        // 1. Check authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }


        // 2. Get application ID
        const applicationId =
            Number(req.params.applicationId);


        // 3. Validate application ID
        if (
            !Number.isInteger(applicationId) ||
            applicationId <= 0
        ) {
            return res.status(400).json({
                message: "Valid application ID is required",
                status: "failed"
            });
        }


        // 4. Get new application status
        const { status } = req.body;


        // 5. Validate status
        if (!status) {
            return res.status(400).json({
                message: "Application status is required",
                status: "failed"
            });
        }


        // 6. Move application
        const application =
            await moveApplication(
                applicationId,
                status
            );


        // 7. Return updated application
        return res.status(200).json({
            message: "Application moved successfully",
            status: "success",
            data: application
        });


    } catch (error) {

        return res.status(400).json({
            message: error.message,
            status: "failed"
        });

    }
}

module.exports = {
    createApplicationController,
    getCandidateApplicationsController,
    getApplicationController,
    getJobApplicationsController,
    moveApplicationController
};