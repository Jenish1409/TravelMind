const Preferences = require('../models/Preferences');
const Trip = require('../models/Trip');

/**
 * Fetch user preferences from MongoDB
 */
async function getUserPreferences(userId) {
  try {
    const prefs = await Preferences.findOne({ user_id: userId });
    return prefs;
  } catch (error) {
    console.error('Error fetching preferences:', error.message);
    return null;
  }
}

/**
 * Analyze past trips to learn user preferences
 * Returns enriched preference object from travel history
 */
async function learnFromTripHistory(userId) {
  try {
    const trips = await Trip.find({ user_id: userId }).sort({ created_at: -1 }).limit(5);
    if (!trips || trips.length === 0) return null;

    const activityCount = {};
    const visitedDestinations = [];

    trips.forEach(trip => {
      visitedDestinations.push(trip.destination);
      const interests = trip.interests || [];
      interests.forEach(interest => {
        activityCount[interest] = (activityCount[interest] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    return {
      learned_activities: topActivities,
      visited_destinations: [...new Set(visitedDestinations)],
      trip_count: trips.length,
    };
  } catch (error) {
    console.error('Error learning from history:', error.message);
    return null;
  }
}

/**
 * Build a personalized recommendation context for an itinerary request.
 * Merges stored preferences + learned patterns from trip history.
 */
async function buildPersonalizationContext(userId, requestedInterests) {
  const storedPrefs = await getUserPreferences(userId);
  const learnedPatterns = await learnFromTripHistory(userId);

  // No history = first-time user
  if (!storedPrefs && !learnedPatterns) {
    return {
      isPersonalized: false,
      preferences: null,
      context: 'first_time_user',
    };
  }

  const mergedActivities = new Set(requestedInterests);

  if (storedPrefs?.preferred_activities) {
    storedPrefs.preferred_activities.forEach(a => mergedActivities.add(a));
  }

  if (learnedPatterns?.learned_activities) {
    learnedPatterns.learned_activities.forEach(a => mergedActivities.add(a));
  }

  return {
    isPersonalized: true,
    preferences: {
      preferred_activities: [...mergedActivities],
      liked_places: storedPrefs?.liked_places || [],
      disliked_places: storedPrefs?.disliked_places || [],
    },
    learnedPatterns,
    context: 'returning_user',
    message: `Personalized based on ${learnedPatterns?.trip_count || 0} past trip(s). ` +
      `You tend to enjoy: ${[...mergedActivities].slice(0, 3).join(', ')}.`,
  };
}

/**
 * Update user preferences after a trip
 */
async function updateUserPreferences(userId, interests, destination) {
  try {
    const existing = await Preferences.findOne({ user_id: userId });

    if (existing) {
      // Merge new activities with existing ones (avoid duplicates)
      const merged = new Set([...existing.preferred_activities, ...interests]);
      const visitedSet = new Set([...existing.visited_destinations || [], destination]);

      await Preferences.updateOne(
        { user_id: userId },
        {
          $set: {
            preferred_activities: [...merged],
            visited_destinations: [...visitedSet],
            updated_at: new Date(),
          },
        }
      );
    } else {
      // First trip — create preferences document
      await Preferences.create({
        user_id: userId,
        preferred_activities: interests,
        liked_places: [],
        disliked_places: [],
        visited_destinations: [destination],
        updated_at: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    return false;
  }
}

module.exports = {
  getUserPreferences,
  learnFromTripHistory,
  buildPersonalizationContext,
  updateUserPreferences,
};
