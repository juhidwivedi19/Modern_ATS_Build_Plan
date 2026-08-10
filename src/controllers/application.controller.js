const prisma = require("../config/db.config.js")

const prisma = require("../config/db.config.js");

async function createApplicationController(req, res) {
    try {
        // 1. Get jobId from URL
        const { jobId } = req.params;

        // 2. Get candidate/application data
        const {
            name,
            email,
            phone,
            location,
            education,
            linkedin,
            portfolio,
            coverLetter
        } = req.body;

        // 3. Validate required fields
        if (!jobId || !name || !email || !phone) {
            return res.status(400).json({
                message: "Required fields are missing",
                status: "failed"
            });
        }

        // 4. Check whether job exists
        const job = await prisma.job.findUnique({
            where: {
                id: parseInt(jobId)
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                status: "failed"
            });
        }

        // 5. Only published jobs can receive applications
        if (job.status !== "PUBLISHED") {
            return res.status(400).json({
                message: "Applications are not open for this job",
                status: "failed"
            });
        }

        // 6. Find existing candidate
        let candidate = await prisma.candidate.findUnique({
            where: {
                email: email
            }
        });

        // 7. Create candidate if doesn't exist
        if (!candidate) {
            candidate = await prisma.candidate.create({
                data: {
                    name,
                    email,
                    phone,
                    location,
                    education,
                    linkedin,
                    portfolio
                }
            });
        }

        // 8. Check whether candidate already applied
        const existingApplication = await prisma.application.findUnique({
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

        // Resume will be handled here later
        // const resume = ...

        return res.status(200).json({
            message: "Candidate validated successfully",
            status: "success",
            candidate
        });

    } catch (error) {
        console.error("Error creating application:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}

module.exports = {
    createApplicationController
};