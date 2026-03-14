const express = require('express');
const router = express.Router();
const { getUserPreferences, saveUserPreferences, registerUser } = require('../controllers/userController');

// GET /api/user-preferences?userId=xxx
router.get('/user-preferences', getUserPreferences);

// POST /api/user-preferences
router.post('/user-preferences', saveUserPreferences);

// POST /api/users/register
router.post('/users/register', registerUser);

module.exports = router;
