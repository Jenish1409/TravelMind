const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  liked_places: {
    type: [String],
    default: [],
  },
  disliked_places: {
    type: [String],
    default: [],
  },
  preferred_activities: {
    type: [String],
    default: [],
  },
  visited_destinations: {
    type: [String],
    default: [],
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Preferences', preferencesSchema);
