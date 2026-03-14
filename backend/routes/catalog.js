const express = require('express');
const router = express.Router();
const { getHotels, getActivities, getEvents, searchCatalog } = require('../controllers/catalogController');

router.get('/hotels', getHotels);
router.get('/activities', getActivities);
router.get('/events', getEvents);
router.get('/search', searchCatalog);

module.exports = router;
