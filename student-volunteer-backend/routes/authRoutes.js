const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const crypto = require("crypto");
const transporter = require("../config/email.js");
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
    const ActivityLog = require("../models/ActivityLog");
    const Feedback = require("../models/Feedback");

    const user = await User.findById(req.user.id).select("-password");

    // 1. Fetch joined events & credibility calculations
    const joinedEvents = await Event.find({ volunteers: req.user.id });
    const completedEventsList = joinedEvents.filter(e => e.attendance.includes(req.user.id) && e.hoursDistributed);
    const missedEventsList = joinedEvents.filter(e => !e.attendance.includes(req.user.id) && e.hoursDistributed);
    
    let credibilityScore = 100;
    if (user.role === "student") {
      const totalPast = completedEventsList.length + missedEventsList.length;
      if (totalPast > 0) {
        credibilityScore = Math.round((completedEventsList.length / totalPast) * 100);
      }
    } else if (user.role === "organizer") {
       const orgEvents = await Event.find({ createdBy: req.user.id }).select("_id");
       const orgEventIds = orgEvents.map(e => e._id);
       const feedbacks = await Feedback.find({ event: { $in: orgEventIds } });
       if (feedbacks.length > 0) {
         const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
         const avg = sum / feedbacks.length;
         credibilityScore = Math.round((avg / 5) * 100);
       }
    }

    // 2. Activity Timeline
    const activities = await ActivityLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("event", "title");

    // 3. Monthly Stats for Impact Chart (last 6 months)
    const monthlyStats = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const recentLogs = await ActivityLog.find({
      user: req.user.id,
      createdAt: { $gte: sixMonthsAgo }
    });

    const monthsData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      monthsData[monthName] = { month: monthName, hours: 0, events: 0 };
    }

    recentLogs.forEach(log => {
       const m = log.createdAt.toLocaleString('en-US', { month: 'short' });
       if (monthsData[m]) {
         if (log.action === "earned_hours") {
           monthsData[m].hours += log.hours;
         }
         if (log.action === "completed_event" || log.action === "earned_hours") {
           monthsData[m].events += 1;
         }
       }
    });

    res.json({
      ...user.toObject(),
      totalParticipatedEvents: joinedEvents.length,
      completedEventsCount: completedEventsList.length,
      missedEventsCount: missedEventsList.length,
      credibilityScore,
      activities,
      monthlyStats: Object.values(monthsData),
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
    const { timeFilter = "all_time", category = "hours" } = req.query;
    const ActivityLog = require("../models/ActivityLog");
    
    if (timeFilter === "all_time" && category === "hours") {
      const users = await User.find({ role: "student" })
        .select("name totalHours avatar")
        .sort({ totalHours: -1 });
      return res.json(users);
    }

    const matchStage = { 
      action: category === "hours" ? "earned_hours" : { $in: ["earned_hours"] } 
    };

    if (timeFilter !== "all_time") {
      const dateLimit = new Date();
      if (timeFilter === "this_week") {
        dateLimit.setDate(dateLimit.getDate() - 7);
      } else if (timeFilter === "this_month") {
        dateLimit.setMonth(dateLimit.getMonth() - 1);
      }
      matchStage.createdAt = { $gte: dateLimit };
    }

    const aggregation = [
      { $match: matchStage },
      { $group: {
          _id: "$user",
          totalValue: category === "hours" ? { $sum: "$hours" } : { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userObj" } },
      { $unwind: "$userObj" },
      { $match: { "userObj.role": "student" } },
      { $project: {
          _id: "$userObj._id",
          name: "$userObj.name",
          avatar: "$userObj.avatar",
          totalHours: category === "hours" ? "$totalValue" : "$userObj.totalHours",
          totalEvents: category === "events" ? "$totalValue" : 0
        }
      }
    ];

    const results = await ActivityLog.aggregate(aggregation);
    res.json(results);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;