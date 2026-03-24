const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Event = require("./models/Event");
const ActivityLog = require("./models/ActivityLog");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB for Seeding");

  // Randomize emails to avoid unique constraint errors
  const rand = Math.floor(Math.random() * 10000);

  // Create an Organizer
  const orgPassword = await bcrypt.hash("password123", 10);
  const organizer = await User.create({
    name: "Community Builders " + rand,
    email: `org_${rand}@example.com`,
    password: orgPassword,
    role: "organizer",
    profileCompleted: true,
    isVerified: true
  });

  // Create Students
  const stuPassword = await bcrypt.hash("password123", 10);
  const student = await User.create({
    name: "Demo Student " + rand,
    email: `student_${rand}@example.com`,
    password: stuPassword,
    role: "student",
    totalHours: 15,
    profileCompleted: true,
    isVerified: true
  });

  const student2 = await User.create({
    name: "Elite Volunteer " + rand,
    email: `elite_${rand}@example.com`,
    password: stuPassword,
    role: "student",
    totalHours: 40,
    profileCompleted: true,
    isVerified: true
  });

  // Create Events
  const event1 = await Event.create({
    title: "Beach Cleanup Drive " + rand,
    description: "Help us clean the local beach this weekend.",
    location: "Sunrise Beach",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    time: "08:00",
    capacity: 50,
    hours: 5,
    createdBy: organizer._id,
    volunteers: [student._id, student2._id],
    attendance: [student._id, student2._id],
    hoursDistributed: true
  });

  const event2 = await Event.create({
    title: "City Library Organization " + rand,
    description: "Sorting books and helping the local library.",
    location: "Downtown Central Library",
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    time: "10:00",
    capacity: 20,
    hours: 10,
    createdBy: organizer._id,
    volunteers: [student._id, student2._id],
    attendance: [student._id, student2._id],
    hoursDistributed: true
  });

  const event3 = await Event.create({
    title: "Marathon Hydration Station " + rand,
    description: "Handing out water at the annual marathon.",
    location: "City Square",
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    time: "06:00",
    capacity: 100,
    hours: 8,
    createdBy: organizer._id,
    volunteers: [student2._id],
    attendance: [student2._id],
    hoursDistributed: true
  });

  const event4 = await Event.create({
    title: "Animal Shelter Assistance " + rand,
    description: "Walking dogs and cleaning kennels.",
    location: "Happy Tails Shelter",
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    time: "09:00",
    capacity: 15,
    hours: 17,
    createdBy: organizer._id,
    volunteers: [student2._id],
    attendance: [student2._id],
    hoursDistributed: true
  });

  // Create Activity Logs for Student 1 (15 total hours)
  await ActivityLog.create([
    {
      user: student._id,
      action: "earned_hours",
      event: event1._id,
      hours: 5,
      description: `Earned 5 hours from "${event1.title}"`,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      user: student._id,
      action: "earned_hours",
      event: event2._id,
      hours: 10,
      description: `Earned 10 hours from "${event2.title}"`,
      createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Activity logs for Student 2 (Elite - 40 total hours) [5 + 10 + 8 + 17 = 40]
  await ActivityLog.create([
    {
      user: student2._id,
      action: "earned_hours",
      event: event1._id,
      hours: 5,
      description: `Earned 5 hours from "${event1.title}"`,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      user: student2._id,
      action: "earned_hours",
      event: event2._id,
      hours: 10,
      description: `Earned 10 hours from "${event2.title}"`,
      createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000)
    },
    {
      user: student2._id,
      action: "earned_hours",
      event: event3._id,
      hours: 8,
      description: `Earned 8 hours from "${event3.title}"`,
      createdAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000)
    },
    {
      user: student2._id,
      action: "earned_hours",
      event: event4._id,
      hours: 17,
      description: `Earned 17 hours from "${event4.title}"`,
      createdAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log(`\n\n✅ Seeding complete! Elite volunteer legitimately earned 40 hours.\n\nLOGIN CREDENTIALS:\nStudent: student_${rand}@example.com | password: password123\nTop Volunteer: elite_${rand}@example.com | password: password123\nOrganizer: org_${rand}@example.com | password: password123\n`);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
