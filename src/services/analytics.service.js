const prisma =require("../config/db.config.js");

const {
    getAnalyticsCache,
    setAnalyticsCache
} = require("../utils/analyticsCache.js");

//============================
//getAplicationsPerJob
//===========================
async function getApplicationsPerJob(organizationId) {

    const cacheKey =
        `analytics:applications-per-job:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const data =
        await prisma.job.findMany({
            where: {
                organizationId: organizationId
            },
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                applications: {
                    _count: "desc"
                }
            }
        });

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}
//=================================
//Add Hiring Funnel
//=================================
async function getHiringFunnel(organizationId) {

    const cacheKey =
        `analytics:hiring-funnel:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const data =
        await prisma.application.groupBy({
            by: ["status"],
            where: {
                job: {
                    organizationId: organizationId
                }
            },
            _count: {
                _all: true
            }
        });

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}


//==================================
//Time to Hire
//==================================
async function getTimeToHire(organizationId) {

    const cacheKey =
        `analytics:time-to-hire:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const hiredApplications =
        await prisma.application.findMany({
            where: {
                job: {
                    organizationId: organizationId
                },
                status: "HIRED",
                activityLogs: {
                    some: {
                        newStatus: "HIRED"
                    }
                }
            },
            select: {
                id: true,
                appliedAt: true,
                job: {
                    select: {
                        title: true
                    }
                },
                activityLogs: {
                    where: {
                        newStatus: "HIRED"
                    },
                    orderBy: {
                        createdAt: "asc"
                    },
                    take: 1,
                    select: {
                        createdAt: true
                    }
                }
            }
        });

    const results =
        hiredApplications.map(application => {

            const hiredAt =
                application.activityLogs[0].createdAt;

            const timeToHire =
                hiredAt.getTime() -
                application.appliedAt.getTime();

            const daysToHire =
                timeToHire /
                (1000 * 60 * 60 * 24);

            return {
                applicationId:
                    application.id,

                jobTitle:
                    application.job.title,

                daysToHire:
                    Number(daysToHire.toFixed(2))
            };
        });

    await setAnalyticsCache(
        cacheKey,
        results
    );

    return results;
}

//===============================
//OfferAcceptanceRate
//===============================
async function getOfferAcceptanceRate(organizationId) {

    const cacheKey =
        `analytics:offer-acceptance-rate:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const acceptedOffers =
        await prisma.application.count({
            where: {
                job: {
                    organizationId: organizationId
                },
                status: "HIRED"
            }
        });

    const offerCount =
        await prisma.application.count({
            where: {
                job: {
                    organizationId: organizationId
                },
                status: {
                    in: [
                        "OFFER",
                        "HIRED"
                    ]
                }
            }
        });

    const acceptanceRate =
        offerCount === 0
            ? 0
            : (acceptedOffers / offerCount) * 100;

    const data = {
        totalOffers: offerCount,
        acceptedOffers: acceptedOffers,
        acceptanceRate:
            Number(acceptanceRate.toFixed(2))
    };

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}

//====================================
//Recruiter Performance
//===================================
async function getRecruiterPerformance(organizationId) {

    const cacheKey =
        `analytics:recruiter-performance:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const activityLogs =
        await prisma.activityLog.findMany({
            where: {
                application: {
                    job: {
                        organizationId: organizationId
                    }
                }
            },
            select: {
                performedById: true,
                newStatus: true,
                performedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

    const performance = {};

    for (const log of activityLogs) {

        const recruiterId =
            log.performedById;

        if (!performance[recruiterId]) {

            performance[recruiterId] = {
                recruiterId: recruiterId,
                recruiterName: log.performedBy.name,
                recruiterEmail: log.performedBy.email,
                applicationsMoved: 0,
                candidatesHired: 0
            };
        }

        performance[recruiterId]
            .applicationsMoved++;

        if (log.newStatus === "HIRED") {

            performance[recruiterId]
                .candidatesHired++;
        }
    }

    const data =
        Object.values(performance);

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}

//==================
async function getOpenPositions(organizationId) {

    const cacheKey =
        `analytics:open-positions:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const data =
        await prisma.job.findMany({
            where: {
                organizationId: organizationId,
                status: "PUBLISHED"
            },
            select: {
                id: true,
                title: true,
                location: true,
                employmentType: true,
                createdAt: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}

//====================================
//Source Of Candidates
//===================================
async function getCandidateSources(organizationId) {

    const cacheKey =
        `analytics:candidate-sources:${organizationId}`;

    const cachedData =
        await getAnalyticsCache(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const data =
        await prisma.application.groupBy({
            by: ["source"],
            where: {
                job: {
                    organizationId: organizationId
                }
            },
            _count: {
                _all: true
            },
            orderBy: {
                _count: {
                    source: "desc"
                }
            }
        });

    await setAnalyticsCache(
        cacheKey,
        data
    );

    return data;
}


module.exports = {
    getApplicationsPerJob,
    getHiringFunnel,
    getTimeToHire,
    getOfferAcceptanceRate,
    getRecruiterPerformance,
    getOpenPositions,
    getCandidateSources
};  