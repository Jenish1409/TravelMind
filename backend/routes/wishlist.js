const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist, removeByItemId } = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes optionally protected (works with JWT or userId query fallback)
router.post('/add', addToWishlist);
router.get('/', getWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/item/:itemId', removeByItemId);

module.exports = router;
