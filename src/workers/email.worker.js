const { Worker } = require("bullmq");
const {sendApplicationStageEmail} = require("../services/email.service.js");


// =============================================================
// Email Worker
// =============================================================

const emailWorker = new Worker(
    "email-queue",

    async (job) => {

        console.log("Email job received");

        console.log("Job data:", job.data);


        // Email sending will be added here
        // after we connect Nodemailer.


        return {
            success: true
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

emailWorker.on("completed", (job) => {

    console.log(
        `Email job ${job.id} completed`
    );

});


emailWorker.on("failed", (job, error) => {

    console.error(
        `Email job ${job?.id} failed:`,
        error.message
    );

});


module.exports = emailWorker;