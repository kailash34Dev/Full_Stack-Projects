const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// Middlewares
const { validateSignup } = require("../middlewares/signUpValidation");
const { signupDataFormat } = require("../middlewares/signUpFormat");
const { validateLogin } = require("../middlewares/loginValidation");
const { loginDataFormat } = require("../middlewares/loginFormat");
const { jwtAuth } = require("../middlewares/auth");

// Login
router.post("/login", validateLogin, loginDataFormat, authController.loginUser);

// Sign up
router.post(
  "/signup",
  validateSignup,
  signupDataFormat,
  authController.signUpUser,
);

// Loged In Cheking
router.get("/is-user-logedin", jwtAuth, authController.isUserLoggedIn);

module.exports = router;
