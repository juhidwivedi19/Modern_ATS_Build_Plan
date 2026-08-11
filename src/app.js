const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./routes/auth.routes");
const organizationRouter = require("./routes/organization.routes");
const resumeRouter = require("./routes/Resume.routes");
const applicationRouter = require("./routes/application.routes");

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/organization", organizationRouter);
app.use("/api", resumeRouter);
app.use("/api", applicationRouter);

module.exports = app;