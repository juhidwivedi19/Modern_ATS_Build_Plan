const prisma = require("../config/db.config.js");

// Get Organization Careers Controller
async function getOrganizationCareerController(req, res) {
    try {
        const { slug } = req.params;

        // Validate slug
        if (!slug) {
            return res.status(400).json({
                message: "Organization slug is required",
                status: "failed"
            });
        }

        // Read query parameters
        const {
            location,
            employmentType,
            department,
            experience
        } = req.query;

        // Find organization
        const organization = await prisma.organization.findUnique({
            where: {
                slug: slug
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                location: true,
                website: true,
                industry: true,
                companySize: true,
                logo: true
            }
        });

        // Check organization
        if (!organization) {
            return res.status(404).json({
                message: "Organization not found",
                status: "failed"
            });
        }

        // Job Filter
        const jobFilter = {
            organizationId: organization.id,
            status: "PUBLISHED"
        };

        // Location filter
        if (location) {
            jobFilter.location = location;
        }

        // Employment Type filter
        if (employmentType) {
            jobFilter.employmentType = employmentType;
        }

        // Experience filter
        if (experience) {
            jobFilter.experience = parseInt(experience);
        }

        // Department filter
        if (department) {
            const departmentData = await prisma.department.findFirst({
                where: {
                    name: department,
                    organizationId: organization.id
                }
            });

            if (departmentData) {
                jobFilter.departmentId = departmentData.id;
            }
        }

        // Fetch published jobs
        const jobs = await prisma.job.findMany({
            where: jobFilter,
            include: {
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            message: "Careers page fetched successfully",
            status: "success",
            organization,
            jobs
        });

    } catch (error) {
        console.error("Error fetching careers page:", error);

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}

module.exports = {
    getOrganizationCareerController
};