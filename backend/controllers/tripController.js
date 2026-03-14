const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Trip = require('../models/Trip');
const { updateUserPreferences } = require('../services/recommendationService');

// POST /api/save-trip
const saveTrip = async (req, res) => {
  try {
    const {
      userId,
      trip_id,
      destination,
      days,
      interests = [],
      budget,
      itinerary,
      personalized = false,
      budget_estimate,
      best_time_to_visit,
      startDate,
      endDate,
    } = req.body;

    if (!userId || !destination || !itinerary) {
      return res.status(400).json({ error: 'userId, destination, and itinerary are required.' });
    }

    let existingTrip = null;
    if (trip_id) {
      existingTrip = await Trip.findOne({ trip_id, user_id: userId });
    }

    if (existingTrip) {
      // Update existing trip
      existingTrip.destination = destination;
      existingTrip.days = days;
      existingTrip.interests = interests;
      existingTrip.budget = budget;
      existingTrip.itinerary = itinerary;
      existingTrip.personalized = personalized;
      existingTrip.budget_estimate = budget_estimate;
      existingTrip.best_time_to_visit = best_time_to_visit;
      if (startDate) existingTrip.startDate = new Date(startDate);
      if (endDate) existingTrip.endDate = new Date(endDate);

      await existingTrip.save();
      await updateUserPreferences(userId, interests, destination);

      return res.status(200).json({
        message: 'Trip updated successfully!',
        trip_id: existingTrip.trip_id,
        shareToken: existingTrip.shareToken,
        destination,
      });
    }

    const newTripId = uuidv4();
    const shareToken = crypto.randomBytes(16).toString('hex');

    const newTrip = new Trip({
      trip_id: newTripId,
      user_id: userId,
      destination,
      days,
      interests,
      budget,
      budget_estimate,
      best_time_to_visit,
      itinerary,
      personalized,
      shareToken,
      isPublic: false,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    await newTrip.save();
    await updateUserPreferences(userId, interests, destination);

    res.status(201).json({
      message: 'Trip saved successfully!',
      trip_id: newTripId,
      shareToken,
      destination,
    });
  } catch (error) {
    console.error('Save trip error:', error);
    res.status(500).json({ error: 'Failed to save trip', details: error.message });
  }
};

// GET /api/trips/:user_id
const getUserTrips = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Trip.countDocuments({ user_id });
    const trips = await Trip.find({ user_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .select('-itinerary'); // omit heavy itinerary for list view

    res.json({ user_id, trip_count: total, page, trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips', details: error.message });
  }
};

// GET /api/trips/detail/:trip_id
const getTripById = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const trip = await Trip.findOne({ trip_id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip', details: error.message });
  }
};

// GET /api/trips/public/:shareToken
const getPublicTrip = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const trip = await Trip.findOne({ shareToken });
    if (!trip) return res.status(404).json({ error: 'Shared trip not found or expired.' });

    // Mark as public when first accessed via share link
    if (!trip.isPublic) {
      trip.isPublic = true;
      await trip.save();
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared trip', details: error.message });
  }
};

// POST /api/trips/:trip_id/invite
const inviteCollaborator = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const { collaboratorEmail, collaboratorUserId } = req.body;

    if (!collaboratorEmail && !collaboratorUserId) {
      return res.status(400).json({ error: 'collaboratorEmail or collaboratorUserId is required.' });
    }

    const trip = await Trip.findOne({ trip_id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    let updated = false;
    if (collaboratorUserId && !trip.collaborators.includes(collaboratorUserId)) {
      trip.collaborators.push(collaboratorUserId);
      updated = true;
    }
    if (collaboratorEmail && !trip.collaboratorEmails.includes(collaboratorEmail)) {
      trip.collaboratorEmails.push(collaboratorEmail);
      updated = true;
    }

    if (updated) await trip.save();

    res.json({
      message: 'Collaborator invited!',
      collaborators: trip.collaborators,
      collaboratorEmails: trip.collaboratorEmails,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to invite collaborator', details: error.message });
  }
};

// GET /api/trips/:trip_id/members
const getTripMembers = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const trip = await Trip.findOne({ trip_id }).select('collaborators collaboratorEmails user_id');
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    res.json({
      owner: trip.user_id,
      collaborators: trip.collaborators,
      pendingInvites: trip.collaboratorEmails,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members', details: error.message });
  }
};

// DELETE /api/trips/:trip_id
const deleteTrip = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const userId = req.user?.userId || req.query.userId;

    const trip = await Trip.findOneAndDelete({ trip_id, user_id: userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found or unauthorized.' });

    res.json({ message: 'Trip deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip', details: error.message });
  }
};

module.exports = { saveTrip, getUserTrips, getTripById, getPublicTrip, inviteCollaborator, getTripMembers, deleteTrip };
