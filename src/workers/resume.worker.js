const { Worker } = require("bullmq");

const worker = new Worker(
    "resume-processing",
 async (job) => {
     const { resumeId, fileKey, fileType } = job.data;

    console.log("Processing resume:", resumeId);
    console.log("File key:", fileKey);
    console.log("File type:", fileType);

    return {
        success: true,
    };
},
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Resume worker started");