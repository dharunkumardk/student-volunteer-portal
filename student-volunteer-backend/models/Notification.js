const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "event_created",
        "event_updated",
        "event_cancelled",
        "student_joined",
        "student_left",
        "attendance_marked",
        "system_alert",
        "new_feedback"
      ],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
