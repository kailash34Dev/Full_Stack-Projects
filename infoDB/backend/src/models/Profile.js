const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true,
  },
  whatsAPPNo: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  education: {
    type: String,
    required: true,
    trim: true,
  },
  occupation: {
    type: String,
    required: true,
    trim: true,
  },
  income: {
    type: String,
    required: true,
    trim: true,
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ["Single", "Married", "Divorced", "Widowed"],
  },
  bio: {
    type: String,
    required: true,
    maxlength: 500,
  },
  accountStatus: {
    type: String,
    required: true,
    default: "active",
    enum: ["active", "marked for delete"],
  },
});

// Virtuals to handle updated age
profileSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

profileSchema.set("toJSON", { virtuals: true });
profileSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Profile", profileSchema);
