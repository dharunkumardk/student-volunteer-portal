const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const transporter = require("../config/email");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const path = require("path");

const router = express.Router();


// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    await user.save();

    await transporter.sendMail({
      from: '"Volunteer Portal" <YOUR_GMAIL@gmail.com>',
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `
    });

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Registration successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= ADMIN ROUTES =================

// GET ALL USERS
router.get("/all-users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const users = await User.find().select("-password");
    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE USER
router.delete("/delete-user/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= PROFILE =================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const Event = require("../models/Event");

    const user = await User.findById(req.user.id).select("-password");

    const joinedEvents = await Event.find({
      volunteers: req.user.id
    });

    const completedEvents = joinedEvents.filter(
      event => event.status === "completed"
    );

    res.json({
      ...user.toObject(),
      totalParticipatedEvents: joinedEvents.length,
      completedEventsCount: completedEvents.length,
      joinedEvents
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= UPLOAD AVATAR =================
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // The file is saved in the 'uploads/' directory by multer.
    // We store the relative path in the database.
    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= REMOVE AVATAR =================
router.put("/remove-avatar", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.avatar) {
      // Delete the file from the local file system
      const filePath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove from database
      user.avatar = "";
      await user.save();
    }

    res.json({ message: "Avatar removed successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= UPDATE NAME =================
router.put("/update-name", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    res.json({ message: "Name updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= COMPLETE PROFILE =================
router.put("/complete-profile", authMiddleware, upload.single("idProof"), async (req, res) => {
  try {
    const { phone, dob, bloodGroup } = req.body;
    
    if (!phone || !phone.match(/^\+?[0-9\s\-()]{7,15}$/)) {
      return res.status(400).json({ message: "Valid phone number is required" });
    }
    if (!dob) return res.status(400).json({ message: "Date of Birth is required" });
    if (!bloodGroup) return res.status(400).json({ message: "Blood group is required" });
    if (!req.file) return res.status(400).json({ message: "ID Proof document is required" });

    const idProofPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, dob, bloodGroup, idProof: idProofPath, profileCompleted: true },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile completed successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= UPDATE PROFILE DETAILS =================
router.put("/update-profile", authMiddleware, upload.single("idProof"), async (req, res) => {
  try {
    const { phone, dob, bloodGroup } = req.body;
    const updateData = {};
    
    if (phone) {
       if (!phone.match(/^\+?[0-9\s\-()]{7,15}$/)) {
         return res.status(400).json({ message: "Invalid phone number format" });
       }
       updateData.phone = phone;
    }
    if (dob) updateData.dob = dob;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (req.file) {
      updateData.idProof = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= LEADERBOARD =================
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("name totalHours")
      .sort({ totalHours: -1 });

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;