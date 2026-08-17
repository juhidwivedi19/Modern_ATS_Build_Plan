require("dotenv").config();

const emailQueue = require("./src/queues/email.queue.js");

async function test() {
    await emailQueue.add("application-stage-email", {
        to: process.env.EMAIL_USER,
        candidateName: "Test Candidate",
        jobTitle: "Software Engineer",
        status: "TECHNICAL_INTERVIEW",
        message:
            "Congratulations! Your application has progressed to the technical interview stage."
    });

    console.log("Test email job added");

    process.exit(0);
}

test();