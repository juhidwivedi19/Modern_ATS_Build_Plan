const express = require("express");

const {
    createApiKeyController,
} = require("../controllers/apiKey.controller.js");

const {authMiddleware} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createApiKeyController
);

module.exports = router;