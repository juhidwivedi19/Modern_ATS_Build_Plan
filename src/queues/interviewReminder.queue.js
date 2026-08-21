const { Queue } = require("bullmq");

const interviewReminderQueue = new Queue(
    "interview-reminders",
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);

module.exports = interviewReminderQueue;