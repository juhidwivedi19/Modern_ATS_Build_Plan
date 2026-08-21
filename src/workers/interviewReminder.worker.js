const { Worker } = require("bullmq");

const prisma = require("../config/db.config.js");

const {
    sendInterviewReminderEmail,
} = require("../services/email.service.js");

const worker = new Worker(
    "interview-reminders",

    async (job) => {
        const {
            interviewId,
            reminderTime,
        } = job.data;

        console.log(
            `Processing ${reminderTime} reminder for interview ${interviewId}`
        );

        const interview = await prisma.interview.findUnique({
            where: {
                id: interviewId,
            },
            include: {
                application: {
                    include: {
                        candidate: true,
                        job: true,
                    },
                },
            },
        });

        if (!interview) {
            throw new Error("Interview not found");
        }

        // Don't send reminder for cancelled/completed interviews
        if (interview.status !== "SCHEDULED") {
            console.log(
                `Interview ${interviewId} is ${interview.status}. Reminder skipped.`
            );

            return {
                success: false,
                skipped: true,
            };
        }

        const candidate =
            interview.application.candidate;

        const jobTitle =
            interview.application.job.title;

      let reminderMessage;

if (reminderTime === "24_HOURS") {
    reminderMessage = "24 hours before the interview";
} else if (reminderTime === "1_HOUR") {
    reminderMessage = "1 hour before the interview";
} else {
    throw new Error(
        `Invalid reminder time: ${reminderTime}`
    );
}

        await sendInterviewReminderEmail(
            candidate.email,
            candidate.name,
            jobTitle,
            interview.type,
            interview.scheduledAt.toLocaleString(),
            interview.meetingLink,
            reminderMessage
        );

        console.log(
            `${reminderTime} reminder sent for interview ${interviewId}`
        );

        return {
            success: true,
        };
    },

    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);

worker.on("completed", (job) => {
    console.log(
        `Interview reminder job ${job.id} completed`
    );
});

worker.on("failed", (job, error) => {
    console.error(
        `Interview reminder job ${job?.id} failed:`,
        error.message
    );
});

console.log("Interview reminder worker started");

module.exports = worker;