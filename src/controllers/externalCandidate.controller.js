const prisma = require("../config/db.config.js");

async function submitExternalCandidateController(req, res) {
    try {
        // Organization comes ONLY from the authenticated API key
        const organizationId = req.apiKey.organizationId;

        const {
            jobId,
            candidateId,
            resumeId,
            coverLetter,
            source
        } = req.body;

        // Validate required fields
        if (!jobId || !candidateId || !resumeId) {
            return res.status(400).json({
                message: "jobId, candidateId and resumeId are required",
                status: "failed"
            });
        }

        const parsedJobId = Number(jobId);
        const parsedCandidateId = Number(candidateId);
        const parsedResumeId = Number(resumeId);

        if (
            !Number.isInteger(parsedJobId) ||
            parsedJobId <= 0 ||
            !Number.isInteger(parsedCandidateId) ||
            parsedCandidateId <= 0 ||
            !Number.isInteger(parsedResumeId) ||
            parsedResumeId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid jobId, candidateId or resumeId",
                status: "failed"
            });
        }

        // ------------------------------------------------
        // 1. Find job belonging to API-key organization
        // ------------------------------------------------

        const job = await prisma.job.findFirst({
            where: {
                id: parsedJobId,
                organizationId: organizationId
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found in this organization",
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

        // ------------------------------------------------
        // 2. Find candidate
        // ------------------------------------------------

        const candidate = await prisma.candidate.findUnique({
            where: {
                id: parsedCandidateId
            }
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found",
                status: "failed"
            });
        }

        // ------------------------------------------------
        // 3. Find resume
        // ------------------------------------------------

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

        // Resume must belong to this candidate
        if (resume.candidateId !== candidate.id) {
            return res.status(403).json({
                message: "Resume does not belong to this candidate",
                status: "failed"
            });
        }

        // ------------------------------------------------
        // 4. Check duplicate application
        // ------------------------------------------------

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
                message: "Candidate has already applied for this job",
                status: "failed"
            });
        }

        // ------------------------------------------------
        // 5. Validate source
        // ------------------------------------------------

        const allowedSources = [
            "DIRECT",
            "LINKEDIN",
            "REFERRAL",
            "JOB_BOARD",
            "COMPANY_WEBSITE",
            "OTHER"
        ];

        const applicationSource = source || "OTHER";

        if (!allowedSources.includes(applicationSource)) {
            return res.status(400).json({
                message: "Invalid application source",
                status: "failed"
            });
        }

        // ------------------------------------------------
        // 6. Create application
        // ------------------------------------------------

        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                resumeId: resume.id,
                coverLetter:
                    coverLetter && coverLetter.trim()
                        ? coverLetter.trim()
                        : null,
                source: applicationSource
            },
            include: {
                job: true,
                candidate: true,
                resume: true
            }
        });

        // ------------------------------------------------
        // 7. Return response
        // ------------------------------------------------

        return res.status(201).json({
            message: "Candidate submitted successfully",
            status: "success",
            data: application
        });

    } catch (error) {
        console.error(
            "Error submitting external candidate:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}

module.exports = {
    submitExternalCandidateController
};