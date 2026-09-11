const express = require("express");

const router = express.Router();

const {
    searchCandidatesController,
} = require("../controllers/candidateSearch.controller.js");

const {
    createCandidateController,
    updateCandidateController,
} = require("../controllers/Candidate.controller.js");

const { authMiddleware } = require("../middlewares/auth.middleware.js");

// Search candidates
router.get(
    "/search",
    authMiddleware,
    searchCandidatesController
);

// Create candidate
router.post(
    "/",
    authMiddleware,
    createCandidateController
);

// Update candidate
router.put(
    "/:candidateId",
    authMiddleware,
    updateCandidateController
);

module.exports = router;