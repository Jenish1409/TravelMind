const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    itemId: { type: String, required: true },
    itemType: {
        type: String,
        enum: ['hotel', 'activity', 'event', 'place'],
        required: true,
    },
    name: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
    price: { type: String },
    rating: { type: Number },
    savedAt: { type: Date, default: Date.now },
});

// Prevent duplicate saves
wishlistItemSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
