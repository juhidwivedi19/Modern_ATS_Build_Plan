const { Queue } = require("bullmq");

const resumeQueue = new Queue("resume-processing", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

module.exports = resumeQueue;