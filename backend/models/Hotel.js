const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
    priceRange: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury'],
        default: 'mid-range',
    },
    pricePerNight: { type: Number },
    rating: { type: Number, min: 1, max: 5, default: 3.5 },
    amenities: { type: [String], default: [] },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

hotelSchema.index({ city: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
