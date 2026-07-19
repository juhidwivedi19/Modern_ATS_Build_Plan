const http = require("http");
require("dotenv").config();

require("./config/db.config");

const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);



app.use(express.json());
app.use(cookieParser());


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});