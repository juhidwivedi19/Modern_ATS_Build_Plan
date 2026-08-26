const prisma = require("../config/db.config.js");

const {
    getApplicationsPerJob,
    getHiringFunnel,
    getTimeToHire,
    getOfferAcceptanceRate,
    getRecruiterPerformance,
    getOpenPositions,
    getCandidateSources
} = require("../services/analytics.service.js");


async function getApplicationsPerJobController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getApplicationsPerJob(
                member.organizationId
            );

        return res.status(200).json({
            message: "Applications per job fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching applications per job:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getHiringFunnelController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getHiringFunnel(
                member.organizationId
            );

        return res.status(200).json({
            message: "Hiring funnel fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching hiring funnel:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getTimeToHireController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getTimeToHire(
                member.organizationId
            );

        return res.status(200).json({
            message: "Time to hire fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching time to hire:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getOfferAcceptanceRateController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getOfferAcceptanceRate(
                member.organizationId
            );

        return res.status(200).json({
            message: "Offer acceptance rate fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching offer acceptance rate:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getRecruiterPerformanceController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getRecruiterPerformance(
                member.organizationId
            );

        return res.status(200).json({
            message: "Recruiter performance fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching recruiter performance:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getOpenPositionsController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getOpenPositions(
                member.organizationId
            );

        return res.status(200).json({
            message: "Open positions fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching open positions:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}


async function getCandidateSourcesController(req, res) {

    try {

        const member =
            await prisma.organizationMember.findFirst({
                where: {
                    userId: req.user.id
                },
                select: {
                    organizationId: true
                }
            });

        if (!member) {
            return res.status(404).json({
                message: "Organization membership not found",
                status: "failed"
            });
        }

        const data =
            await getCandidateSources(
                member.organizationId
            );

        return res.status(200).json({
            message: "Candidate sources fetched successfully",
            status: "success",
            data: data
        });

    } catch (error) {

        console.error(
            "Error fetching candidate sources:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
            status: "failed"
        });
    }
}



module.exports = {
    getApplicationsPerJobController,
    getHiringFunnelController,
    getTimeToHireController,
    getOfferAcceptanceRateController,
    getRecruiterPerformanceController,
    getOpenPositionsController,
    getCandidateSourcesController
};
