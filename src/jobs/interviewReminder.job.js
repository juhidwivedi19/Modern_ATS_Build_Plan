const interviewReminderQueue = require("../queues/interviewReminder.queue.js")

async function scheduleInterviewReminders({
    interviewId,
    scheduledAt,
}) {
    const interviewTime = new Date(scheduledAt).getTime();
    const now = Date.now();

    const twentyFourHourDelay =
        interviewTime - now - 24 * 60 * 60 * 1000;

    const oneHourDelay =
        interviewTime - now - 60 * 60 * 1000;

    if (twentyFourHourDelay > 0) {
        await interviewReminderQueue.add(
            "interview-reminder",
            {
                interviewId,
                reminderTime: "24_HOURS",
            },
            {
                delay: twentyFourHourDelay,
                jobId: `interview-${interviewId}-24h`,
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    }

    if (oneHourDelay > 0) {
        await interviewReminderQueue.add(
            "interview-reminder",
            {
                interviewId,
                reminderTime: "1_HOUR",
            },
            {
                delay: oneHourDelay,
                jobId: `interview-${interviewId}-1h`,
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    }
}

async function cancelInterviewReminders(interviewId) {
    try {
        await interviewReminderQueue.remove(
            `interview-${interviewId}-24h`
        );

        await interviewReminderQueue.remove(
            `interview-${interviewId}-1h`
        );
    } catch (error) {
        console.error(
            "Failed to remove interview reminder jobs:",
            error.message
        );

        throw error;
    }
}

async function rescheduleInterviewReminders({
    interviewId,
    scheduledAt,
}) {
    // Remove old reminder jobs
    await cancelInterviewReminders(interviewId);

    // Create new reminder jobs
    await scheduleInterviewReminders({
        interviewId,
        scheduledAt,
    });
}

module.exports = {
    scheduleInterviewReminders,
    cancelInterviewReminders,
    rescheduleInterviewReminders 
}; 