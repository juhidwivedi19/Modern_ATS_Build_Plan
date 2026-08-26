const redis = require("../config/redis.config.js");


// Get cached analytics data
async function getAnalyticsCache(key) {

    const cachedData =
        await redis.get(key);

    if (!cachedData) {
        return null;
    }

    return JSON.parse(cachedData);
}


// Store analytics data in Redis
async function setAnalyticsCache(
    key,
    data,
    expiry = 300
) {

    await redis.set(
        key,
        JSON.stringify(data),
        "EX",
        expiry
    );
}


async function invalidateAnalyticsCache(organizationId) {

    const keys = [
        `analytics:applications-per-job:${organizationId}`,
        `analytics:hiring-funnel:${organizationId}`,
        `analytics:time-to-hire:${organizationId}`,
        `analytics:offer-acceptance-rate:${organizationId}`,
        `analytics:recruiter-performance:${organizationId}`,
        `analytics:open-positions:${organizationId}`,
        `analytics:candidate-sources:${organizationId}`
    ];

    await redis.del(...keys);
}

module.exports = {
    getAnalyticsCache,
    setAnalyticsCache,
    invalidateAnalyticsCache
};