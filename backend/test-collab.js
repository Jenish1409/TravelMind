const axios = require('axios');
const API = 'http://localhost:5000/api';

async function run() {
  try {
    // 1. Create two users
    let res = await axios.post(`${API}/users/register`, { name: 'Alice', email: 'alice@test.com' });
    const userA = res.data.user;
    
    res = await axios.post(`${API}/users/register`, { name: 'Bob', email: 'bob@test.com' });
    const userB = res.data.user;

    console.log('Users created:', userA.user_id, userB.user_id);

    // 2. Create a trip with User A
    res = await axios.post(`${API}/save-trip`, {
      userId: userA.user_id,
      destination: 'Paris',
      days: 3,
      itinerary: [{ day: 1, places: [{ name: 'Eiffel Tower', estimated_cost: '$50' }] }],
    });
    const tripId = res.data.trip_id;
    console.log('Trip created:', tripId);

    // 3. User A invites User B via email
    res = await axios.post(`${API}/trips/${tripId}/invite`, { email: 'bob@test.com' });
    console.log('Invited Bob:', res.data);

    // 4. User B checks invitations
    res = await axios.get(`${API}/trips/invitations/${userB.user_id}`);
    console.log('Bob Invitations:', res.data.trips.map(t => t.trip_id));

    // 5. User B accepts invitation
    res = await axios.post(`${API}/trips/accept-invite`, { tripId, userId: userB.user_id });
    console.log('Bob Accept:', res.data);

    // 6. User B checks trips
    res = await axios.get(`${API}/trips/${userB.user_id}`);
    console.log('Bob Trips:', res.data.trips.map(t => t.trip_id));

    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}
run();
