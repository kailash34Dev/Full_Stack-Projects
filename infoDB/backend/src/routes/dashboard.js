const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");

// Middlewares
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

// Admin Dashboard
router.get(
  "/admin/dashboard",
  auth.jwtAuth,
  admin.verifyAdmin,
  dashboardController.fetchAdminDashboardData,
);

// User Profile Data & Personal Details for Admin
router.get(
  "/profile",
  auth.jwtAuth,
  admin.verifyAdmin,
  dashboardController.getPersonalDetailsAdmin,
);

// User Dashboard & Profile Information
router.get(
  "/user/dashboard",
  auth.jwtAuth,
  dashboardController.getUserDashboardData,
);

// Delete Specific User Data
router.delete(
  "/profile/delete",
  auth.jwtAuth,
  dashboardController.deleteUserData,
);

module.exports = router;
