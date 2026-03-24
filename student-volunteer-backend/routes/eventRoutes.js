const express = require("express");
const Event = require("../models/Event.js");
const User = require("../models/user.js");
const Notification = require("../models/Notification.js");
const ActivityLog = require("../models/ActivityLog.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// CREATE EVENT (Organizer only)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Only organizers can create events" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.profileCompleted || !currentUser.phone || !currentUser.dob) {
      return res.status(403).json({ message: "Please complete your profile to create an event." });
    }

    const { title, description, location, date, time, capacity, hours } = req.body;

    const newEvent = new Event({
      title,
      description,
      location,
      date,
      time: time || "09:00",
      capacity,
      hours,
      createdBy: req.user.id
    });

    await newEvent.save();

    // 🔔 Notify all students that a new event is available
    const students = await User.find({ role: "student" }).select("_id");
    const notifications = students.map(student => ({
      recipient: student._id,
      type: "event_created",
      message: `A new event "${title}" has been created! Check it out.`,
      relatedEvent: newEvent._id
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "Event created successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getDynamicStatus = (evt) => {
  if (!evt.date) return "upcoming";
  
  const d = new Date(evt.date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  const timeStr = evt.time || "09:00";
  let startMs;
  if (timeStr.includes(':')) {
    startMs = new Date(`${dateStr}T${timeStr}:00`).getTime();
  } else {
    startMs = new Date(dateStr).getTime();
  }
  
  const evtHours = Number(evt.hours) || 2;
  const endMs = startMs + (evtHours * 3600000);
  const now = Date.now();
  
  if (now < startMs) return "upcoming";
  if (now >= startMs && now <= endMs) return "ongoing";
  return "completed";
};

const attachDynamicStatus = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.computedStatus = getDynamicStatus(doc);
  return obj;
};

// GET ALL EVENTS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.json(events.map(attachDynamicStatus));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ANALYTICS
router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    const User = require("../models/user");

    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    // Fetch only the needed fields for dynamic status calculation and volunteer counts
    const events = await Event.find({}, { date: 1, time: 1, hours: 1, volunteers: 1 }).lean();

    let completedEvents = 0;
    let upcomingEvents = 0;
    let ongoingEvents = 0;
    let totalVolunteers = 0;

    events.forEach(event => {
       const status = getDynamicStatus(event);
       if (status === "completed") completedEvents++;
       else if (status === "upcoming") upcomingEvents++;
       else if (status === "ongoing") ongoingEvents++;
       
       totalVolunteers += (event.volunteers ? event.volunteers.length : 0);
    });

    // Optimize total hours by aggregating in MongoDB instead of loading all users
    const hoursAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalHours" } } }
    ]);
    const totalHours = hoursAgg.length > 0 ? hoursAgg[0].total : 0;

    res.json({
      totalUsers,
      totalEvents,
      completedEvents,
      upcomingEvents,
      totalVolunteers,
      totalHours,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE EVENT
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    // We add populates incrementally if needed, but for now just the creator
    const event = await Event.findById(req.params.eventId).populate("createdBy", "name email avatar");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(attachDynamicStatus(event));
  } catch (error) {
    if (error.kind === "ObjectId") return res.status(404).json({ message: "Event not found" });
    res.status(500).json({ error: error.message });
  }
});

// JOIN EVENT (Student only)
router.post("/join/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can join events" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(403).json({ message: "Please complete your profile to join an event." });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already joined
    if (event.volunteers.includes(req.user.id)) {
      return res.status(400).json({ message: "Already joined this event" });
    }
    if (event.volunteers.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    // === SMART CONFLICT DETECTION ===
    const getEventTimes = (evt) => {
      const dateStr = new Date(evt.date).toISOString().split('T')[0];
      const timeStr = evt.time || "09:00";
      const [evtHours, evtMinutes] = timeStr.split(':').map(Number);
      const startMs = new Date(dateStr).getTime() + (evtHours * 3600000) + (evtMinutes * 60000);
      const endMs = startMs + (evt.hours * 3600000);
      return { startMs, endMs };
    };

    const newTimes = getEventTimes(event);
    const userEvents = await Event.find({ volunteers: req.user.id });

    for (const existingEvent of userEvents) {
      const existingTimes = getEventTimes(existingEvent);
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (newTimes.startMs < existingTimes.endMs && newTimes.endMs > existingTimes.startMs) {
        return res.status(409).json({
          message: `Time conflict detected! You are already registered for '${existingEvent.title}' which overlaps with this schedule.`
        });
      }
    }
    // ================================

    event.volunteers.push(req.user.id);
    await event.save();

    // 📝 Log Activity
    await ActivityLog.create({
      user: req.user.id,
      action: "joined",
      event: event._id,
      description: `Joined event "${event.title}"`
    });

    // 🔔 Notify the Organizer who created the event
    await Notification.create({
      recipient: event.createdBy,
      type: "student_joined",
      message: `${req.user.name || "A student"} has joined your event "${event.title}".`,
      relatedEvent: event._id
    });

    res.json({ message: "Successfully joined event" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEAVE EVENT
router.post("/leave/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can leave events" });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.volunteers = event.volunteers.filter(
      (id) => id.toString() !== req.user.id
    );

    await event.save();

    // 🔔 Notify the Organizer who created the event
    await Notification.create({
      recipient: event.createdBy,
      type: "student_left",
      message: `${req.user.name || "A student"} has left your event "${event.title}".`,
      relatedEvent: event._id
    });

    res.json({ message: "Successfully left event" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE EVENT (Organizer only)
router.delete("/delete/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete events" });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure organizer deletes only their own event
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    // 🔔 Notify all joined volunteers before deleting
    const notifications = event.volunteers.map(studentId => ({
      recipient: studentId,
      type: "event_cancelled",
      message: `The event "${event.title}" has been cancelled by the organizer.`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// UPDATE EVENT (Organizer only)
router.put("/update/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only organizers and admins can edit events" });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
  req.user.role !== "admin" &&
  event.createdBy.toString() !== req.user.id
) {
      return res.status(403).json({ message: "Not authorized to edit this event" });
    }

    const { title, description, location, date, time, capacity, hours } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (capacity !== undefined) event.capacity = capacity;
    if (hours !== undefined) event.hours = hours;

    await event.save();

    // 🔔 Notify all joined volunteers about the update
    const notifications = event.volunteers.map(studentId => ({
      recipient: studentId,
      type: "event_updated",
      message: `The event "${event.title}" has been updated by the organizer.`,
      relatedEvent: event._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: "Event updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// COMPLETE EVENT (Add hours only to attendees)
router.put("/complete/:eventId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only organizers and admins can complete events" });
    }

    const User = require("../models/user");

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Organizer can only complete their own event
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to complete this event" });
    }

    // Prevent double completion
    if (event.hoursDistributed) {
      return res.status(400).json({ message: "Hours already distributed for this event" });
    }
    
    // Status MUST be completed via time naturally before organizer can distribute hours
    if (getDynamicStatus(event) !== "completed") {
      return res.status(400).json({ message: "Event is not yet completed. You cannot distribute hours yet." });
    }

    // 🚀 Add hours ONLY to students who scanned QR (attendance)
    for (let studentId of event.attendance) {
      await User.findByIdAndUpdate(studentId, {
        $inc: { totalHours: event.hours }
      });

      await ActivityLog.create({
        user: studentId,
        action: "earned_hours",
        event: event._id,
        hours: event.hours,
        description: `Earned ${event.hours} hours from "${event.title}"`
      });
    }

    await ActivityLog.create({
      user: req.user.id,
      action: "completed_event",
      event: event._id,
      description: `Successfully completed event "${event.title}"`
    });

    event.hoursDistributed = true;
    await event.save();

    // 🔔 Notify all attendees that attendance was marked and hours given
    const notifications = event.attendance.map(studentId => ({
      recipient: studentId,
      type: "attendance_marked",
      message: `Attendance marked for "${event.title}". You received ${event.hours} hours!`,
      relatedEvent: event._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      message: "Event completed. Hours added to attendees only."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= FEEDBACK AND RATINGS =================
// GET FEEDBACK FOR AN EVENT
router.get("/:eventId/feedback", authMiddleware, async (req, res) => {
  try {
    const Feedback = require("../models/Feedback");
    const feedbacks = await Feedback.find({ event: req.params.eventId })
                                    .populate("user", "name avatar")
                                    .sort({ createdAt: -1 });
    
    let averageRating = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / feedbacks.length).toFixed(1);
    }
    
    // Check if the current user has already left feedback
    let userFeedbackExists = false;
    if (req.user) {
        userFeedbackExists = feedbacks.some(f => f.user._id.toString() === req.user.id);
    }

    res.json({ feedbacks, averageRating, userFeedbackExists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SUBMIT FEEDBACK
router.post("/:eventId/feedback", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can leave feedback." });
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a valid rating between 1 and 5." });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (getDynamicStatus(event) !== "completed") {
      return res.status(400).json({ message: "Feedback can only be submitted for completed events." });
    }

    if (!event.attendance.includes(req.user.id)) {
      return res.status(403).json({ message: "Only verified attendees can submit feedback." });
    }

    const Feedback = require("../models/Feedback");
    const existingFeedback = await Feedback.findOne({ user: req.user.id, event: event._id });
    
    if (existingFeedback) {
      return res.status(409).json({ message: "You have already submitted feedback for this event." });
    }

    const newFeedback = new Feedback({
      user: req.user.id,
      event: event._id,
      rating: Number(rating),
      comment
    });

    await newFeedback.save();
    
    await Notification.create({
      recipient: event.createdBy,
      type: "new_feedback",
      message: `Someone left a ${rating}-star review on your event "${event.title}".`,
      relatedEvent: event._id
    });

    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;