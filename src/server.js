const http = require("http");
require("dotenv").config();

// require("./queues/email.queue.js");
require("./workers/email.worker.js");
require("./workers/interviewReminder.worker.js");
require("./workers/report.worker.js");
require("./schedulers/report.schedular.js");


require("./config/db.config");
require("./config/redis.config");

const app = require("./app");

const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});