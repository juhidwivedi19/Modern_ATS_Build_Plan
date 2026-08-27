const { Worker } = require("bullmq");

const analyticsService =
    require("../services/analytics.service.js");

const {
    saveCSV
} = require("../utils/csv.util.js");


// =============================================================
// Report Worker
// =============================================================

const reportWorker = new Worker(
    "report-queue",

    async function (job) {

        const {
            organizationId,
            reportType
        } = job.data;


        console.log(
            `Generating ${reportType} report for organization ${organizationId}`
        );


        // Get analytics data
        const [
            applicationsPerJob,
            hiringFunnel,
            timeToHire,
            offerAcceptanceRate,
            recruiterPerformance,
            openPositions,
            candidateSources
        ] = await Promise.all([

            analyticsService.getApplicationsPerJob(
                organizationId
            ),

            analyticsService.getHiringFunnel(
                organizationId
            ),

            analyticsService.getTimeToHire(
                organizationId
            ),

            analyticsService.getOfferAcceptanceRate(
                organizationId
            ),

            analyticsService.getRecruiterPerformance(
                organizationId
            ),

            analyticsService.getOpenPositions(
                organizationId
            ),

            analyticsService.getCandidateSources(
                organizationId
            )
        ]);


        // =====================================================
        // Create CSV rows
        // =====================================================

        const reportRows = [];


        // Applications per job
        applicationsPerJob.forEach(function (item) {

            reportRows.push({
                reportType: reportType,
                section: "Applications Per Job",
                jobId: item.jobId || "",
                title: item.title || "",
                value: item.applications || ""
            });

        });


        // Hiring funnel
        if (Array.isArray(hiringFunnel)) {

            hiringFunnel.forEach(function (item) {

                reportRows.push({
                    reportType: reportType,
                    section: "Hiring Funnel",
                    jobId: "",
                    title: item.status || "",
                    value: item.count || ""
                });

            });

        }


        // Candidate sources
        if (Array.isArray(candidateSources)) {

            candidateSources.forEach(function (item) {

                reportRows.push({
                    reportType: reportType,
                    section: "Candidate Sources",
                    jobId: "",
                    title: item.source || "",
                    value: item._count?._all || ""
                });

            });

        }


        // Open positions
        if (Array.isArray(openPositions)) {

            openPositions.forEach(function (item) {

                reportRows.push({
                    reportType: reportType,
                    section: "Open Positions",
                    jobId: item.id || "",
                    title: item.title || "",
                    value: item._count?.applications || 0
                });

            });

        }


        // =====================================================
        // Generate CSV
        // =====================================================

        const timestamp =
            Date.now();

        const fileName =
            `${reportType.toLowerCase()}-hiring-report-${organizationId}-${timestamp}.csv`;


        const filePath =
            saveCSV(
                reportRows,
                fileName
            );


        console.log(
            `${reportType} CSV generated: ${filePath}`
        );


        // Return worker result
        return {
            organizationId,
            reportType,
            filePath,
            generatedAt: new Date()
        };
    },

    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
);


// =============================================================
// Worker Events
// =============================================================

reportWorker.on(
    "completed",
    function (job) {

        console.log(
            `Report job ${job.id} completed`
        );

    }
);


reportWorker.on(
    "failed",
    function (job, error) {

        console.error(
            `Report job ${job?.id} failed:`,
            error
        );

    }
);


console.log(
    "Report worker started"
);


module.exports = reportWorker;