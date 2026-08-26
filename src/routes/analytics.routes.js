const express = require("express");

const {
    getApplicationsPerJobController,
    getHiringFunnelController,
    getTimeToHireController,
    getOfferAcceptanceRateController,
    getRecruiterPerformanceController,
    getOpenPositionsController,
    getCandidateSourcesController
} = require("../controllers/analytics.controller.js");

const {
    authMiddleware
} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get(
    "/applications-per-job",
    authMiddleware,
    getApplicationsPerJobController
);

router.get(
    "/hiring-funnel",
    authMiddleware,
    getHiringFunnelController
);

router.get(
    "/time-to-hire",
    authMiddleware,
    getTimeToHireController
);

router.get(
    "/offer-acceptance-rate",
    authMiddleware,
    getOfferAcceptanceRateController
);

router.get(
    "/recruiter-performance",
    authMiddleware,
    getRecruiterPerformanceController
);

router.get(
    "/open-positions",
    authMiddleware,
    getOpenPositionsController
);

router.get(
    "/candidate-sources",
    authMiddleware,
    getCandidateSourcesController
);

module.exports = router;