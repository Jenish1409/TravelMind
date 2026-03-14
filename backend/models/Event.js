const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
    category: {
        type: String,
        enum: ['festival', 'music', 'food', 'culture', 'sports', 'art', 'adventure', 'nightlife'],
        default: 'culture',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    price: { type: Number, default: 0 },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    description: { type: String },
    sourceUrl: { type: String },
    imageUrl: { type: String },
    isRecurring: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

eventSchema.index({ city: 1, startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
