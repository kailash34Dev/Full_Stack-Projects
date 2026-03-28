const express = require("express");
const router = express.Router();

// Routes
const authRoutes = require("./auth");
const dashboardRoutes = require("./dashboard");
const onboardingRoutes = require("./onboarding");

router.use("/", authRoutes);
router.use("/", dashboardRoutes);
router.use("/", onboardingRoutes);

module.exports = router;
