const express = require('express');
const router = express.Router();
const { generateItinerary } = require('../controllers/itineraryController');

// POST /api/generate-itinerary
router.post('/generate-itinerary', generateItinerary);

module.exports = router;
