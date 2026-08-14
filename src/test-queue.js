const resumeQueue = require("./queues/resume.queue");

async function testQueue() {
    await resumeQueue.add("test-job", {
        message: "Hello BullMQ",
    });

    console.log("Job added successfully");

    await resumeQueue.close();
}

testQueue();