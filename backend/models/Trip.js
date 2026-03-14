const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: [String],
  coordinates: {
    lat: Number,
    lng: Number,
  },
  rating: Number,
  image_hint: String,
  estimated_cost: String,
  duration: String,
  tips: String,
});

const daySchema = new mongoose.Schema({
  day: Number,
  theme: String,
  places: [placeSchema],
  description: String,
  tips: String,
  estimated_cost: String,
});

const budgetSplitGroupSchema = new mongoose.Schema({
  id: Number,
  name: String,
  members: Number,
}, { _id: false });

const tripSchema = new mongoose.Schema({
  trip_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
  },
  destination: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  interests: {
    type: [String],
    default: [],
  },
  budget: {
    type: Number,
  },
  budget_estimate: { type: String },
  best_time_to_visit: { type: String },
  itinerary: [daySchema],
  personalized: {
    type: Boolean,
    default: false,
  },
  // Sharing
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  // Collaboration
  collaborators: {
    type: [{
      userId: String,
      role: { type: String, enum: ['read', 'manager'], default: 'read' }
    }],
    default: [],
  },
  budgetSplitGroups: {
    type: [budgetSplitGroupSchema],
    default: [],
  },
  pendingInvites: {
    type: [{
      userId: String,
      role: { type: String, enum: ['read', 'manager'], default: 'read' }
    }],
    default: [],
  },
  collaboratorEmails: {
    type: [String], // legacy pending invites
    default: [],
  },
  startDate: { type: Date },
  endDate: { type: Date },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

tripSchema.index({ user_id: 1 });

module.exports = mongoose.model('Trip', tripSchema);
