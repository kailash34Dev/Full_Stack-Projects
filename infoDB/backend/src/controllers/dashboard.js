const User = require("../models/User");
const Profile = require("../models/Profile");

// Admin Dashboard
exports.fetchAdminDashboardData = async (req, res) => {
  try {
    let users = await Profile.find();
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    } else {
      // Updated users array excluding current user
      const currUserId = req.currUser.id;
      const updatedUsers = users.filter(
        (user) => user.user.toString() !== currUserId.toString(),
      );

      // Additional information for dashboard
      const totalUser = updatedUsers.length;
      const totalDeleteRequest = updatedUsers.filter(
        (user) => user.accountStatus === "marked for delete",
      ).length;
      const currUser = users.find(
        (user) => user.user.toString() === currUserId.toString(),
      );
      const currUserName = currUser ? currUser.name : null;

      users = updatedUsers;
      return res
        .status(200)
        .json({ users, totalUser, totalDeleteRequest, currUserName });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Profile Details or Personal Details for Admins
exports.getPersonalDetailsAdmin = async (req, res) => {
  try {
    const reqUserId = req.query.id;
    if (!reqUserId) {
      return res.status(400).json({ message: "Invalid request" });
    } else if (reqUserId) {
      if (reqUserId === "self") {
        const reqUser = await Profile.findOne({
          user: req.currUser.id,
        }).populate("user");
        const currUserName = reqUser ? reqUser.name : null;
        return res.status(200).json({ reqUser, currUserName });
      } else {
        const reqUser = await Profile.findOne({ _id: reqUserId }).populate(
          "user",
        );
        if (!reqUser) {
          return res.status(404).json({ message: "User not found" });
        } else {
          const currUserId = req.currUser.id;
          const currUser = await Profile.findOne({ user: currUserId }).populate(
            "user",
          );
          const currUserName = currUser ? currUser.name : null;
          return res.status(200).json({ reqUser, currUserName });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Dashboards
exports.getUserDashboardData = async (req, res) => {
  try {
    const reqUserId = req.currUser.id;
    if (!reqUserId) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const user = await Profile.findOne({ user: reqUserId }).populate("user");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Specific User Data
exports.deleteUserData = async (req, res) => {
  try {
    const reqUserId = req.query.id;

    if (req.currUser.role === "user") {
      const profile = await Profile.findOneAndUpdate(
        { user: req.currUser.id },
        { accountStatus: "marked for delete" },
        { returnDocument: "after", runValidators: true },
      );

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.status(200).json({ message: "Account marked for deletion" });
    }

    if (req.currUser.role === "admin") {
      let profile;

      if (reqUserId === "self" || !reqUserId) {
        profile = await Profile.findOne({ user: req.currUser.id });
      } else {
        profile = await Profile.findById(reqUserId);
      }

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const userId = profile.user;
      await Profile.findByIdAndDelete(profile._id);
      await User.findByIdAndDelete(userId);

      return res.status(200).json({ message: "Account deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
