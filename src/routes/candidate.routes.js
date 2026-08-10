const express=require("express");

const router=express.Router()

const {
    updateController
} = require("../controllers/Candidate.controller.js");

// Update candidate profile
router.patch("/candidates/:candidateId", updateController);

module.exports = router;