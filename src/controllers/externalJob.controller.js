const prisma = require("../config/db.config.js");

async function createExternalJobController(req, res) {
    try {
        // Organization comes from the authenticated API key
        const organizationId = req.apiKey.organizationId;

        const {
            title,
            description,
            salary,
            employmentType,
            requiredSkills,
            experience,
            location,
            departmentId
        } = req.body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !requiredSkills ||
            !experience ||
            !location ||
            !departmentId
        ) {
            return res.status(400).json({
                message: "Missing required fields",
                status: "failed"
            });
        }

        // Check department belongs to API key's organization
        const department = await prisma.department.findFirst({
            where: {
                id: parseInt(departmentId),
                organizationId: organizationId
            }
        });

        if (!department) {
            return res.status(404).json({
                message: "Department not found in this organization",
                status: "failed"
            });
        }

        // Create job
        const job = await prisma.job.create({
            data: {
                title,
                description,
                location,
                salary: salary ? parseFloat(salary) : null,
                employmentType,
                requiredSkills: requiredSkills || null,
                experience: experience
                    ? parseInt(experience)
                    : null,
                organizationId,
                departmentId: parseInt(departmentId)
            },
            include: {
                department: true,
                organization: true
            }
        });

        return res.status(201).json({
            message: "Job created successfully",
            status: "success",
            job
        });

    } catch (error) {
        console.error("Error creating external job:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}

module.exports = {
    createExternalJobController
};