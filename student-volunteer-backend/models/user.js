const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
     role: {
      type: String,
      enum: ["student", "organizer", "admin"],
      default: "student",
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
  isVerified: {
  type: Boolean,
  default: false
},
phone: {
  type: String,
  default: ""
},
dob: {
  type: Date
},
bloodGroup: {
  type: String,
  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
  default: ""
},
idProof: {
  type: String, // Path to file
  default: ""
},
profileCompleted: {
  type: Boolean,
  default: false
},
otp: String,
otpExpires: Date,
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);