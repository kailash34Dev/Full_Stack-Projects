const validator = require("../utils/authValidator");

exports.validateSignup = (req, res, next) => {
  const { email, role, password } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required" });
  } else if (!validator.validateEmail(email)) {
    return res.status(400).json({
      message: "Invalid email",
    });
  }

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  } else if (!validator.validateRole(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (!password?.trim()) {
    return res.status(400).json({ message: "Password is required" });
  } else if (!validator.validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }

  next();
};
