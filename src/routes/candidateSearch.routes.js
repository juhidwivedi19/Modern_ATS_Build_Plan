const express = require("express");

const router = express.Router();

const {
  searchCandidatesController,
} = require("../controllers/candidateSearch.controller.js");

const { authMiddleware } = require("../middlewares/auth.middleware.js");

router.get(
  "/search",
  authMiddleware,
  searchCandidatesController
);

module.exports = router;