const cron = require("node-cron");

const prisma = require("../config/db.config.js");

const reportQueue =
    require("../queues/report.queue.js");


// =============================================================
// Generate reports for all organizations
// =============================================================

async function queueReports(reportType) {

    try {

        const organizations =
            await prisma.organization.findMany({
                select: {
                    id: true
                }
            });


        for (const organization of organizations) {

            await reportQueue.add(
                `${reportType}-hiring-report`,
                {
                    organizationId: organization.id,
                    reportType: reportType
                },
                {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 2000
                    },
                    removeOnComplete: {
                        count: 100
                    },
                    removeOnFail: {
                        count: 500
                    }
                }
            );

        }


        console.log(
            `${reportType} reports queued for ${organizations.length} organizations`
        );

    } catch (error) {

        console.error(
            `Error queueing ${reportType} reports:`,
            error
        );

    }
}


// =============================================================
// Weekly Report
// Every Monday at 8:00 AM
// =============================================================

cron.schedule("0 8 * * 1", function () {

    queueReports("WEEKLY");

});


// =============================================================
// Monthly Report
// 1st day of every month at 8:00 AM
// =============================================================

cron.schedule("0 8 1 * *", function () {

    queueReports("MONTHLY");

});


console.log(
    "Report scheduler started"
);


module.exports = {
    queueReports
};
