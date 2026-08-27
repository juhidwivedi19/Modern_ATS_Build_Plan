const { Queue } = require("bullmq");

// =============================================================
// Report Queue
// =============================================================

const reportQueue = new Queue("report-queue", {
    connection: {
        host: "127.0.0.1",
        port: 6379
    }
});

module.exports = reportQueue;