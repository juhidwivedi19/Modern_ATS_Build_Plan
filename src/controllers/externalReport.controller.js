const analyticsService = require("../services/analytics.service.js");

async function getExternalReportsController(req, res) {
    try {
        // Organization comes from API key
        const organizationId = req.apiKey.organizationId;

        const [
            applicationsPerJob,
            hiringFunnel,
            timeToHire,
            offerAcceptanceRate,
            recruiterPerformance,
            openPositions,
            candidateSources
        ] = await Promise.all([
            analyticsService.getApplicationsPerJob(organizationId),
            analyticsService.getHiringFunnel(organizationId),
            analyticsService.getTimeToHire(organizationId),
            analyticsService.getOfferAcceptanceRate(organizationId),
            analyticsService.getRecruiterPerformance(organizationId),
            analyticsService.getOpenPositions(organizationId),
            analyticsService.getCandidateSources(organizationId)
        ]);

        return res.status(200).json({
            message: "Reports fetched successfully",
            status: "success",
            data: {
                applicationsPerJob,
                hiringFunnel,
                timeToHire,
                offerAcceptanceRate,
                recruiterPerformance,
                openPositions,
                candidateSources
            }
        });

    } catch (error) {
        console.error(
            "External reports error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch reports",
            status: "failed"
        });
    }
}

module.exports = {
    getExternalReportsController
};