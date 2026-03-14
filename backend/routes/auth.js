const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile  (protected)
router.get('/profile', verifyToken, getProfile);

// POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
