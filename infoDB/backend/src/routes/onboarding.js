const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboarding");

// Middlewares
const auth = require("../middlewares/auth");
const profileChecking = require("../middlewares/isProfileExists");
const { onboardingValidation } = require("../middlewares/onboardingValidation");
const { onboardingDataFormat } = require("../middlewares/onboardingFormat");

// Onboarding Page Data
router.get(
  "/fetch-data-onboarding",
  auth.jwtAuth,
  profileChecking.isProfileExists,
  onboardingController.onboardingPageData,
);

// Onboarding Process
router.post(
  "/onboarding",
  auth.jwtAuth,
  profileChecking.isProfileExists,
  onboardingValidation,
  onboardingDataFormat,
  onboardingController.onboardingProcess,
);

// Profile Edit
router.put(
  "/profile/edit",
  auth.jwtAuth,
  onboardingValidation,
  onboardingDataFormat,
  onboardingController.editProfile,
);

module.exports = router;
