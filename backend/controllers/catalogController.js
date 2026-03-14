const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

// GET /api/catalog/hotels?city=goa&priceRange=budget&limit=20
const getHotels = async (req, res) => {
    try {
        const { city, priceRange, limit = 20 } = req.query;
        const filter = {};
        if (city) filter.city = city.toLowerCase();
        if (priceRange) filter.priceRange = priceRange;

        const hotels = await Hotel.find(filter).limit(Number(limit)).sort({ rating: -1 });
        res.json({ count: hotels.length, hotels });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hotels', details: error.message });
    }
};

// GET /api/catalog/activities?city=goa&category=beaches
const getActivities = async (req, res) => {
    try {
        const { city, category, limit = 20 } = req.query;
        const filter = {};
        if (city) filter.city = city.toLowerCase();
        if (category) filter.category = { $in: [category] };

        const activities = await Activity.find(filter).limit(Number(limit)).sort({ rating: -1 });
        res.json({ count: activities.length, activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
    }
};

// GET /api/catalog/events?city=goa&category=festival
const getEvents = async (req, res) => {
    try {
        const { city, category, limit = 20 } = req.query;
        const filter = {};
        if (city) filter.city = city.toLowerCase();
        if (category) filter.category = category;

        const events = await Event.find(filter).limit(Number(limit)).sort({ startDate: 1 });
        res.json({ count: events.length, events });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }
};

// GET /api/catalog/search?city=goa&q=beach
const searchCatalog = async (req, res) => {
    try {
        const { city, q, limit = 10 } = req.query;
        if (!q) return res.status(400).json({ error: 'Query param q is required.' });

        const regex = new RegExp(q, 'i');
        const cityFilter = city ? { city: city.toLowerCase() } : {};

        const [hotels, activities, events] = await Promise.all([
            Hotel.find({ ...cityFilter, $or: [{ name: regex }, { description: regex }] }).limit(Number(limit)),
            Activity.find({ ...cityFilter, $or: [{ name: regex }, { description: regex }] }).limit(Number(limit)),
            Event.find({ ...cityFilter, $or: [{ name: regex }, { description: regex }] }).limit(Number(limit)),
        ]);

        res.json({ hotels, activities, events });
    } catch (error) {
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
};

module.exports = { getHotels, getActivities, getEvents, searchCatalog };
