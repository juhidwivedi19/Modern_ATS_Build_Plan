const express=require("express");

const router=express.Router()

const {
    createCandidateController,updateCandidateController
} = require("../controllers/Candidate.controller.js");


router.post(
    "/candidates",
    authMiddleware,
    createCandidateController
);

// Update candidate profile
router.put(
    "/:candidateId",
    authMiddleware,
    updateCandidateController
);

module.exports = router;