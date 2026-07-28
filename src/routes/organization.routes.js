const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const organizationController = require("../controllers/organization.controller");

const router= express.router();



module.exports = router;