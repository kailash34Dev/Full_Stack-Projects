const User = require("../models/User");
const Profile = require("../models/Profile");

exports.onboardingPageData = async (req, res) => {
  try {
    const user = await User.findById(req.currUser.id);
    if (!user) {
      return res.status(400).json({ message: "Bad/Broken request" });
    }

    return res.status(200).json({ email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.onboardingProcess = async (req, res) => {
  try {
    const {
      email,
      name,
      dob,
      gender,
      phoneNo,
      whatsAPPNo,
      address,
      city,
      state,
      country,
      pinCode,
      education,
      occupation,
      income,
      maritalStatus,
      bio,
    } = req.body;

    const currUser = await User.findById(req.currUser.id);
    if (currUser.email !== email) {
      return res.status(400).json({ message: "Invalid request data" });
    } else {
      const user = currUser.id;

      const newProfile = new Profile({
        user,
        name,
        dob,
        gender,
        phoneNo,
        whatsAPPNo,
        location: {
          address,
          city,
          state,
          country,
          pinCode,
        },
        education,
        occupation,
        income,
        maritalStatus,
        bio,
        accountStatus: "active",
      });

      await newProfile.save();
      res.status(201).json({
        message: "Onboarding completed successfully",
        role: currUser.role,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const {
      name,
      dob,
      gender,
      phoneNo,
      whatsAPPNo,
      address,
      city,
      state,
      country,
      pinCode,
      education,
      occupation,
      income,
      maritalStatus,
      bio,
    } = req.body;

    let reqUserId = req.query.id;

    if (reqUserId === "self" || !reqUserId) {
      reqUserId = req.currUser.id;
    }

    const updateData = {
      name,
      dob,
      gender,
      phoneNo,
      whatsAPPNo,
      location: {
        address,
        city,
        state,
        country,
        pinCode,
      },
      education,
      occupation,
      income,
      maritalStatus,
      bio,
    };

    const updatedProfile = await Profile.findByIdAndUpdate(
      reqUserId,
      updateData,
      {
        runValidators: true,
        returnDocument: 'after',
      }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Data updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
