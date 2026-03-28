const Profile = require("../models/Profile");
const User = require("../models/User");

exports.isProfileExists = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.currUser.id });
    if (profile) {
      const user = await User.findById(req.currUser.id);

      return res.status(403).json({
        message:
          "Profile already exists. Onboarding has already been completed.",
        role: user.role,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
