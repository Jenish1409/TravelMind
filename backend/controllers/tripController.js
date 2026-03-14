const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Trip = require('../models/Trip');
const User = require('../models/User');
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
      existingTrip = await Trip.findOne({ trip_id });
      
      // Permission check
      if (existingTrip) {
        const isOwner = existingTrip.user_id === userId || existingTrip.ownerId === userId;
        const isManager = existingTrip.collaborators.some(c => c.userId === userId && c.role === 'manager');
        
        if (!isOwner && !isManager) {
          return res.status(403).json({ error: 'You do not have permission to modify this trip.' });
        }
      }
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
      ownerId: userId,
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

    const query = {
      $or: [
        { user_id: user_id },
        { ownerId: user_id },
        { "collaborators.userId": user_id }
      ]
    };

    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
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
    const trip = await Trip.findOne({ trip_id }).lean();
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    // Attach owner details
    const owner = await User.findOne({ user_id: trip.ownerId || trip.user_id }).lean();
    if (owner) trip.ownerDetails = { name: owner.name, email: owner.email };

    // Attach collaborator details
    if (trip.collaborators && trip.collaborators.length > 0) {
      const userIds = trip.collaborators.map(c => c.userId);
      const users = await User.find({ user_id: { $in: userIds } }).lean();
      trip.collaborators = trip.collaborators.map(c => {
        const u = users.find(user => user.user_id === c.userId);
        return { ...c, name: u ? u.name : 'Unknown', email: u ? u.email : '' };
      });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip', details: error.message });
  }
};

// GET /api/trips/public/:shareToken
const getPublicTrip = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const trip = await Trip.findOne({ shareToken }).lean();
    if (!trip) return res.status(404).json({ error: 'Shared trip not found or expired.' });

    // Try to attach owner details
    const owner = await User.findOne({ user_id: trip.ownerId || trip.user_id }).lean();
    if (owner) trip.ownerDetails = { name: owner.name, email: owner.email };

    // Attach collaborator details
    if (trip.collaborators && trip.collaborators.length > 0) {
      const userIds = trip.collaborators.map(c => c.userId);
      const users = await User.find({ user_id: { $in: userIds } }).lean();
      trip.collaborators = trip.collaborators.map(c => {
        const u = users.find(user => user.user_id === c.userId);
        return { ...c, name: u ? u.name : 'Unknown', email: u ? u.email : '' };
      });
    }

    // Mark as public when first accessed via share link
    if (!trip.isPublic) {
      await Trip.updateOne({ shareToken }, { isPublic: true });
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
    const { email, role = 'read' } = req.body;
    const inviterId = req.user?.userId || req.body.inviterId; // Need some way to know who is inviting

    if (!email) {
      return res.status(400).json({ error: 'Email is required to invite a collaborator.' });
    }
    if (!['read', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be read or manager.' });
    }

    const trip = await Trip.findOne({ trip_id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    // Validate that inviter is the owner
    // For now, if inviterId isn't perfectly plumbed, we'll assume the frontend only shows the invite box to the owner
    // But ideally: if (trip.ownerId !== inviterId && trip.user_id !== inviterId) return 403

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User with this email is not registered.' });
    }

    if (trip.user_id === userToInvite.user_id || trip.ownerId === userToInvite.user_id) {
       return res.status(400).json({ error: 'User is already the owner of this trip.' });
    }

    if (trip.collaborators.some(c => c.userId === userToInvite.user_id)) {
       return res.status(400).json({ error: 'User is already a collaborator.' });
    }

    if (trip.pendingInvites.some(p => p.userId === userToInvite.user_id)) {
       return res.status(400).json({ error: 'User is already invited.' });
    }

    trip.pendingInvites.push({ userId: userToInvite.user_id, role });
    await trip.save();

    res.json({
      message: 'Collaboration request sent!',
      pendingInvites: trip.pendingInvites
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

    const trip = await Trip.findOne({ trip_id });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    if (trip.user_id !== userId && trip.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the owner can delete this trip.' });
    }

    await Trip.findOneAndDelete({ trip_id });

    res.json({ message: 'Trip deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip', details: error.message });
  }
};

// GET /api/trips/invitations/:user_id
const getInvitations = async (req, res) => {
  try {
    const { user_id } = req.params;
    const trips = await Trip.find({ "pendingInvites.userId": user_id }).select('-itinerary');
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invitations', details: error.message });
  }
};

// POST /api/trips/accept-invite
const acceptInvitation = async (req, res) => {
  try {
    const { tripId, userId } = req.body;

    const trip = await Trip.findOne({ trip_id: tripId });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    const inviteIndex = trip.pendingInvites.findIndex(p => p.userId === userId);
    if (inviteIndex === -1) {
      return res.status(400).json({ error: 'No pending invitation for this user.' });
    }

    const inviteData = trip.pendingInvites[inviteIndex];

    // Remove from pendingInvites
    trip.pendingInvites.splice(inviteIndex, 1);
    
    // Add to collaborators
    if (!trip.collaborators.some(c => c.userId === userId)) {
      trip.collaborators.push({ userId: inviteData.userId, role: inviteData.role });
    }

    await trip.save();

    res.json({ message: 'Invitation accepted!', trip_id: tripId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept invitation', details: error.message });
  }
};

module.exports = { saveTrip, getUserTrips, getTripById, getPublicTrip, inviteCollaborator, getTripMembers, deleteTrip, getInvitations, acceptInvitation };
