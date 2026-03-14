const { v4: uuidv4 } = require('uuid');
const WishlistItem = require('../models/Wishlist');

// POST /api/wishlist/add
const addToWishlist = async (req, res) => {
    try {
        const { itemId, itemType, name, location, description, coordinates, price, rating } = req.body;
        const userId = req.user?.userId || req.body.userId;

        if (!userId || !itemId || !itemType || !name) {
            return res.status(400).json({ error: 'userId, itemId, itemType, and name are required.' });
        }

        const item = await WishlistItem.findOneAndUpdate(
            { userId, itemId, itemType },
            { userId, itemId, itemType, name, location, description, coordinates, price, rating, savedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: 'Saved to wishlist!', item });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Already in wishlist.' });
        }
        res.status(500).json({ error: 'Failed to save to wishlist', details: error.message });
    }
};

// GET /api/wishlist?userId=xxx
const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        if (!userId) return res.status(400).json({ error: 'userId is required.' });

        const items = await WishlistItem.find({ userId }).sort({ savedAt: -1 });
        res.json({ count: items.length, wishlist: items });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist', details: error.message });
    }
};

// DELETE /api/wishlist/:id
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        const { id } = req.params;

        const item = await WishlistItem.findOneAndDelete({ _id: id, userId });
        if (!item) return res.status(404).json({ error: 'Wishlist item not found.' });

        res.json({ message: 'Removed from wishlist.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from wishlist', details: error.message });
    }
};

// DELETE /api/wishlist/item/:itemId  — remove by itemId + type
const removeByItemId = async (req, res) => {
    try {
        const userId = req.user?.userId || req.query.userId;
        const { itemId } = req.params;
        const { itemType } = req.query;

        const filter = { userId, itemId };
        if (itemType) filter.itemType = itemType;

        const item = await WishlistItem.findOneAndDelete(filter);
        if (!item) return res.status(404).json({ error: 'Wishlist item not found.' });

        res.json({ message: 'Removed from wishlist.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from wishlist', details: error.message });
    }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, removeByItemId };
