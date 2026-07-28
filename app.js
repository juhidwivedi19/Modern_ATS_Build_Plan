
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./src/routes/auth.routes");
const organizationRouter= require("./src/routes/organization.routes");

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/organization",organizationRouter)


module.exports = app;