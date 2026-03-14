const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
    category: {
        type: [String],
        enum: ['beaches', 'nightlife', 'heritage', 'adventure', 'nature', 'food', 'cafes', 'shopping', 'culture', 'wellness', 'wildlife', 'relaxation', 'watersports'],
        default: [],
    },
    duration: { type: String }, // e.g., "2 hours", "Half day"
    price: { type: Number, default: 0 }, // in INR
    rating: { type: Number, min: 1, max: 5, default: 4.0 },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    description: { type: String },
    tips: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});

activitySchema.index({ city: 1, category: 1 });

module.exports = mongoose.model('Activity', activitySchema);
