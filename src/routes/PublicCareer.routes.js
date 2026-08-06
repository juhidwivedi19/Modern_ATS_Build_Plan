const express=require("express")
const PublicCareerController = require("../controllers/PublicCareer.controller.js")

const router = express.Router();

// Public Careers Page
router.get(
    "/careers/:slug",
    publicCareerController.getOrganizationCareersController
);

module.exports = router;