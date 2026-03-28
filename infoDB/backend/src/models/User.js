const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

module.exports = mongoose.model("User", userSchema);
