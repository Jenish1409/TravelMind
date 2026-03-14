const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Preferences = require('../models/Preferences');

/**
 * GET /api/user-preferences?userId=xxx
 * Fetch stored preferences for a user.
 */
const getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param is required.' });

    const prefs = await Preferences.findOne({ user_id: userId });
    const user = await User.findOne({ user_id: userId });

    if (!prefs) {
      return res.json({
        userId,
        isNewUser: true,
        preferences: null,
        message: 'No preferences found. First-time user.',
      });
    }

    res.json({
      userId,
      isNewUser: false,
      user: user ? { name: user.name, travel_style: user.travel_style } : null,
      preferences: prefs,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences', details: error.message });
  }
};

/**
 * POST /api/user-preferences
 * Create or update preferences for a user.
 */
const saveUserPreferences = async (req, res) => {
  try {
    const {
      userId,
      name = 'Traveler',
      email,
      preferred_activities = [],
      liked_places = [],
      disliked_places = [],
      travel_style = 'relaxed',
    } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    // Upsert user
    await User.findOneAndUpdate(
      { user_id: userId },
      { user_id: userId, name, email: email || `${userId}@travelmind.app`, preferences: preferred_activities, travel_style },
      { upsert: true, new: true }
    );

    // Upsert preferences
    const prefs = await Preferences.findOneAndUpdate(
      { user_id: userId },
      {
        user_id: userId,
        preferred_activities,
        liked_places,
        disliked_places,
        updated_at: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Preferences saved successfully!',
      userId,
      preferences: prefs,
    });
  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({ error: 'Failed to save preferences', details: error.message });
  }
};

/**
 * POST /api/users/register
 * Quick user registration (for demo purposes)
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, preferences = [], travel_style = 'relaxed' } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required.' });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ message: 'User already exists.', user: existing });
    }

    const user_id = uuidv4();
    const user = await User.create({ user_id, name, email, preferences, travel_style });

    res.status(201).json({ message: 'User registered!', user });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

module.exports = { getUserPreferences, saveUserPreferences, registerUser };
