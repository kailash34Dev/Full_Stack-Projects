const User = require("../models/User");
const bcrypt = require("bcrypt");
const tokenGenerator = require("../utils/tokenGeneration");

exports.loginUser = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid password" });
      } else {
        const tokenDuration = remember ? "10d" : "1d";
        const token = tokenGenerator.tokenGenerator(user, tokenDuration);
        res.status(200).json({
          message: "Login successful",
          role: user.role,
          token: token,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signUpUser = async (req, res) => {
  try {
    const { email, role, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        role,
        password: hashedPassword,
      });

      await newUser.save();
      const token = tokenGenerator.tokenGenerator(newUser, "1d");
      res.status(201).json({
        message: "User created successfully",
        token: token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.isUserLoggedIn = async (req, res) => {
  try {
    const user = await User.findById(req.currUser.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User found", role: user.role });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
