const express = require('express');
const router = express.Router();
const {
    saveTrip,
    getUserTrips,
    getTripById,
    getPublicTrip,
    inviteCollaborator,
    getTripMembers,
    deleteTrip,
    getInvitations,
    acceptInvitation,
    removeCollaborator,
} = require('../controllers/tripController');

router.post('/save-trip', saveTrip);
router.get('/trips/:user_id', getUserTrips);
router.get('/trips/public/:shareToken', getPublicTrip);
router.get('/trips/detail/:trip_id', getTripById);
router.post('/trips/:trip_id/invite', inviteCollaborator);
router.get('/trips/:trip_id/members', getTripMembers);
router.get('/trips/invitations/:user_id', getInvitations);
router.post('/trips/accept-invite', acceptInvitation);
router.delete('/trips/:trip_id', deleteTrip);
router.delete('/trips/:trip_id/collaborators/:collaboratorId', removeCollaborator);

module.exports = router;
