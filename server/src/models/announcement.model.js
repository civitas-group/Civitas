// Mongoose schema that represents an Announcement.

const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true
  },
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
