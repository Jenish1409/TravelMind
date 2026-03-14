/**
 * Seed script — populates Hotels, Activities, Events in MongoDB
 * Run: node data/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGODB_URI;

const hotels = [
    // GOA
    { name: 'Taj Exotica Resort & Spa', location: 'Benaulim, South Goa', city: 'goa', priceRange: 'luxury', pricePerNight: 18000, rating: 4.8, amenities: ['Pool', 'Spa', 'Beach Access', 'WiFi', 'Restaurant'], coordinates: { lat: 15.2668, lng: 73.9354 }, description: 'Iconic luxury resort on the pristine Benaulim beach.' },
    { name: 'The Leela Goa', location: 'Cavelossim, South Goa', city: 'goa', priceRange: 'luxury', pricePerNight: 15000, rating: 4.7, amenities: ['Pool', 'Spa', 'Golf', 'WiFi', 'Beach'], coordinates: { lat: 15.1617, lng: 73.9503 }, description: 'Lagoon-style luxury resort with stunning beach views.' },
    { name: 'Alila Diwa Goa', location: 'Majorda, South Goa', city: 'goa', priceRange: 'luxury', pricePerNight: 12000, rating: 4.6, amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'], coordinates: { lat: 15.2887, lng: 73.9462 }, description: 'Contemporary luxury with paddy field views and a beautiful pool.' },
    { name: 'Cidade de Goa', location: 'Panaji, North Goa', city: 'goa', priceRange: 'mid-range', pricePerNight: 6000, rating: 4.3, amenities: ['Pool', 'Beach', 'WiFi', 'Restaurant', 'Bar'], coordinates: { lat: 15.4566, lng: 73.8013 }, description: 'Heritage hotel with Portuguese architecture near Dona Paula.' },
    { name: 'Zostel Goa', location: 'Anjuna, North Goa', city: 'goa', priceRange: 'budget', pricePerNight: 800, rating: 4.1, amenities: ['WiFi', 'Common Kitchen', 'Lounge', 'Social Events'], coordinates: { lat: 15.5777, lng: 73.7441 }, description: 'Popular backpacker hostel in the heart of Anjuna.' },
    // JAIPUR
    { name: 'Rambagh Palace', location: 'Bhawani Singh Rd, Jaipur', city: 'jaipur', priceRange: 'luxury', pricePerNight: 25000, rating: 4.9, amenities: ['Pool', 'Spa', 'Gardens', 'WiFi', 'Fine Dining'], coordinates: { lat: 26.8921, lng: 75.8013 }, description: 'A former royal palace turned luxury hotel, the jewel of Jaipur.' },
    { name: 'Jai Mahal Palace', location: 'Jacob Road, Civil Lines, Jaipur', city: 'jaipur', priceRange: 'luxury', pricePerNight: 18000, rating: 4.7, amenities: ['Pool', 'Spa', 'Heritage Walks', 'WiFi'], coordinates: { lat: 26.9253, lng: 75.8091 }, description: 'A majestic 18th-century palace hotel with Mughal gardens.' },
    { name: 'Hotel Arya Niwas', location: 'Sansar Chandra Road, Jaipur', city: 'jaipur', priceRange: 'budget', pricePerNight: 1800, rating: 4.1, amenities: ['WiFi', 'Restaurant', 'Rooftop Terrace', 'Travel Desk'], coordinates: { lat: 26.9215, lng: 75.8112 }, description: 'Budget gem with rooftop views and great food, very close to city centre.' },
    // MANALI
    { name: 'Solang Valley Resort', location: 'Solang Valley, Manali', city: 'manali', priceRange: 'mid-range', pricePerNight: 5500, rating: 4.4, amenities: ['Bonfire', 'Mountain Views', 'WiFi', 'Adventure Sports'], coordinates: { lat: 32.3137, lng: 77.1531 }, description: 'Cozy resort at the foothills of snow-capped mountains.' },
    { name: 'Span Resort & Spa', location: 'Kullu Manali Highway, Manali', city: 'manali', priceRange: 'luxury', pricePerNight: 10000, rating: 4.6, amenities: ['River View', 'Spa', 'WiFi', 'Restaurant', 'Helipad'], coordinates: { lat: 32.1800, lng: 77.1200 }, description: 'Riverside luxury with stunning Beas river views.' },
    // KERALA
    { name: 'Kumarakom Lake Resort', location: 'Kumarakom, Kerala', city: 'kerala', priceRange: 'luxury', pricePerNight: 22000, rating: 4.8, amenities: ['Infinity Pool', 'Spa', 'Houseboat', 'Ayurveda', 'WiFi'], coordinates: { lat: 9.6143, lng: 76.4282 }, description: 'Heritage lake resort with stunning backwater views and Ayurvedic treatments.' },
    { name: 'Fragrant Nature Retreat', location: 'Munnar, Kerala', city: 'kerala', priceRange: 'mid-range', pricePerNight: 7000, rating: 4.5, amenities: ['Pool', 'Tea Garden', 'WiFi', 'Restaurant'], coordinates: { lat: 10.0889, lng: 77.0595 }, description: 'Nestled in tea gardens with panoramic valley views.' },
    // DELHI
    { name: 'The Imperial New Delhi', location: 'Janpath, New Delhi', city: 'delhi', priceRange: 'luxury', pricePerNight: 20000, rating: 4.8, amenities: ['Pool', 'Spa', 'Art Gallery', 'Fine Dining', 'WiFi'], coordinates: { lat: 28.6202, lng: 77.2206 }, description: 'Legendary 5-star hotel blending colonial grandeur with modern luxury.' },
    { name: 'Zostel Delhi', location: 'Paharganj, Delhi', city: 'delhi', priceRange: 'budget', pricePerNight: 700, rating: 4.0, amenities: ['WiFi', 'Lounge', 'Travel Info', 'Lockers'], coordinates: { lat: 28.6441, lng: 77.2120 }, description: 'Budget hostel in the traveller hub of Paharganj.' },
    // MUMBAI
    { name: 'The Taj Mahal Palace', location: 'Apollo Bunder, Colaba, Mumbai', city: 'mumbai', priceRange: 'luxury', pricePerNight: 30000, rating: 4.9, amenities: ['Pool', 'Spa', 'Sea View', 'Fine Dining', 'WiFi'], coordinates: { lat: 18.9218, lng: 72.8330 }, description: 'Iconic 5-star landmark overlooking the Gateway of India.' },
    { name: 'Abode Mumbai', location: 'Lansdowne House, Colaba', city: 'mumbai', priceRange: 'mid-range', pricePerNight: 4500, rating: 4.3, amenities: ['WiFi', 'Breakfast', 'Kitchenette', 'City View'], coordinates: { lat: 18.9226, lng: 72.8316 }, description: 'Stylish boutique hotel in the heart of Colaba.' },
];

const activities = [
    // GOA
    { name: 'Dudhsagar Waterfall Trek', location: 'Dudhsagar, Goa', city: 'goa', category: ['adventure', 'nature'], duration: 'Full Day', price: 1500, rating: 4.7, coordinates: { lat: 15.3144, lng: 74.3117 }, description: 'Trek through dense jungle to reach the majestic four-tiered waterfall.', tips: 'Best visited June-December after monsoon.' },
    { name: 'Baga Beach Watersports', location: 'Baga Beach, North Goa', city: 'goa', category: ['beaches', 'watersports', 'adventure'], duration: '3 hours', price: 1200, rating: 4.4, coordinates: { lat: 15.5560, lng: 73.7522 }, description: 'Parasailing, jet skiing, banana boat rides and more at Baga.' },
    { name: 'Old Goa Heritage Walk', location: 'Old Goa', city: 'goa', category: ['heritage', 'culture'], duration: '3 hours', price: 500, rating: 4.5, coordinates: { lat: 15.5009, lng: 73.9121 }, description: 'Explore the Basilica of Bom Jesus and Se Cathedral with a guide.' },
    { name: 'Saturday Night Market, Arpora', location: 'Arpora, North Goa', city: 'goa', category: ['shopping', 'nightlife', 'food'], duration: '4 hours', price: 200, rating: 4.3, coordinates: { lat: 15.5601, lng: 73.7571 }, description: 'Famous flea market with global street food, handicrafts and live music.' },
    { name: 'Yoga & Meditation at Arambol', location: 'Arambol Beach, Goa', city: 'goa', category: ['wellness', 'relaxation'], duration: '2 hours', price: 800, rating: 4.6, coordinates: { lat: 15.6864, lng: 73.7039 }, description: 'Sunrise yoga sessions at the peaceful northernmost beach of Goa.' },
    // JAIPUR
    { name: 'Amber Fort Tour', location: 'Amer, Jaipur', city: 'jaipur', category: ['heritage', 'culture'], duration: '3 hours', price: 600, rating: 4.8, coordinates: { lat: 26.9855, lng: 75.8513 }, description: 'Magnificent hilltop fort with intricate Rajput and Mughal architecture.', tips: 'Avoid noon Sunday; elephant rides available morning.' },
    { name: 'Hawa Mahal & City Palace', location: 'Old City, Jaipur', city: 'jaipur', category: ['heritage', 'culture'], duration: '4 hours', price: 400, rating: 4.7, coordinates: { lat: 26.9239, lng: 75.8267 }, description: 'Iconic honeycomb façade and royal palace complex in the walled city.' },
    { name: 'Block Printing Workshop', location: 'Bagru, Jaipur', city: 'jaipur', category: ['culture', 'shopping'], duration: '3 hours', price: 1000, rating: 4.5, coordinates: { lat: 26.8086, lng: 75.5999 }, description: 'Hands-on traditional Rajasthani block printing experience.' },
    // MANALI
    { name: 'Rohtang Pass Snow Adventure', location: 'Rohtang Pass, Manali', city: 'manali', category: ['adventure', 'nature'], duration: 'Full Day', price: 3000, rating: 4.6, coordinates: { lat: 32.3712, lng: 77.2434 }, description: 'Snow activities on one of the highest motorable mountain passes.', tips: 'Book permit online; closed in winter.' },
    { name: 'Solang Valley Paragliding', location: 'Solang Valley, Manali', city: 'manali', category: ['adventure'], duration: '2 hours', price: 2500, rating: 4.7, coordinates: { lat: 32.3137, lng: 77.1531 }, description: 'Tandem paragliding over the stunning Kullu valley.' },
    // KERALA
    { name: 'Alleppey Houseboat Cruise', location: 'Alappuzha, Kerala', city: 'kerala', category: ['relaxation', 'nature'], duration: '1-2 Days', price: 8000, rating: 4.9, coordinates: { lat: 9.4981, lng: 76.3388 }, description: 'Overnight houseboat stay through the serene Kerala backwaters.', tips: 'Book early for peak season (Oct-Feb).' },
    { name: 'Munnar Tea Plantation Tour', location: 'Munnar, Kerala', city: 'kerala', category: ['nature', 'culture'], duration: '3 hours', price: 600, rating: 4.6, coordinates: { lat: 10.0889, lng: 77.0595 }, description: 'Walk through lush green tea estates and learn about tea processing.' },
    // DELHI
    { name: 'Old Delhi Heritage Walk & Food Tour', location: 'Chandni Chowk, Delhi', city: 'delhi', category: ['heritage', 'food', 'culture'], duration: '4 hours', price: 1500, rating: 4.8, coordinates: { lat: 28.6506, lng: 77.2334 }, description: 'Walk through Mughal-era lanes with food stops at legendary eateries.', tips: 'Go on an empty stomach!' },
    { name: 'Qutub Minar & Mehrauli', location: 'Mehrauli, Delhi', city: 'delhi', category: ['heritage', 'culture'], duration: '2 hours', price: 300, rating: 4.5, coordinates: { lat: 28.5244, lng: 77.1855 }, description: 'UNESCO World Heritage Site — 12th-century Islamic minaret and complex.' },
    // MUMBAI
    { name: 'Gateway of India & Elephanta Caves', location: 'Colaba, Mumbai', city: 'mumbai', category: ['heritage', 'culture'], duration: '5 hours', price: 700, rating: 4.6, coordinates: { lat: 18.9219, lng: 72.8347 }, description: 'Ferry to the UNESCO-listed Elephanta Caves from the iconic Gateway.' },
    { name: 'Dharavi Slum Walking Tour', location: 'Dharavi, Mumbai', city: 'mumbai', category: ['culture', 'food'], duration: '3 hours', price: 800, rating: 4.7, coordinates: { lat: 19.0413, lng: 72.8528 }, description: 'Eye-opening guided tour through Asia\'s largest urban settlement.' },
];

const events = [
    { name: 'Sunburn Music Festival', location: 'Vagator Beach, Goa', city: 'goa', category: 'music', startDate: new Date('2026-12-27'), endDate: new Date('2026-12-29'), price: 3500, coordinates: { lat: 15.5957, lng: 73.7437 }, description: 'Asia\'s biggest EDM festival with international DJs.', isRecurring: true },
    { name: 'Goa Carnival', location: 'Panaji, Goa', city: 'goa', category: 'festival', startDate: new Date('2027-02-20'), endDate: new Date('2027-02-23'), price: 0, coordinates: { lat: 15.4989, lng: 73.8278 }, description: '450-year-old Portuguese tradition with parades, music and floats.', isRecurring: true },
    { name: 'Jaipur Literature Festival', location: 'Diggi Palace, Jaipur', city: 'jaipur', category: 'culture', startDate: new Date('2027-01-29'), endDate: new Date('2027-02-02'), price: 0, coordinates: { lat: 26.9124, lng: 75.7873 }, description: 'World\'s largest free literary festival attended by global authors.', isRecurring: true },
    { name: 'Desert Festival', location: 'Sam Sand Dunes, Jaisalmer', city: 'jaipur', category: 'festival', startDate: new Date('2027-02-10'), endDate: new Date('2027-02-12'), price: 500, coordinates: { lat: 26.9157, lng: 70.8671 }, description: 'Camel races, folk performances and turban-tying contests.', isRecurring: true },
    { name: 'Onam Festival', location: 'Thiruvananthapuram, Kerala', city: 'kerala', category: 'festival', startDate: new Date('2026-08-26'), endDate: new Date('2026-09-04'), price: 0, coordinates: { lat: 8.5241, lng: 76.9366 }, description: 'Kerala\'s most celebrated harvest festival with snake boat races.', isRecurring: true },
    { name: 'Delhi International Arts Festival', location: 'IGNCA, New Delhi', city: 'delhi', category: 'art', startDate: new Date('2026-11-14'), endDate: new Date('2026-11-23'), price: 200, coordinates: { lat: 28.6127, lng: 77.2177 }, description: 'Multi-genre arts festival with classical music, dance and visual arts.', isRecurring: true },
    { name: 'Mumbai Film Festival (MAMI)', location: 'PVR Cinemas, Mumbai', city: 'mumbai', category: 'culture', startDate: new Date('2026-10-21'), endDate: new Date('2026-10-30'), price: 400, coordinates: { lat: 19.0760, lng: 72.8777 }, description: 'International cinema showcase with premieres and filmmaker Q&As.', isRecurring: true },
    { name: 'Manali Winter Carnival', location: 'Mall Road, Manali', city: 'manali', category: 'festival', startDate: new Date('2027-01-02'), endDate: new Date('2027-01-07'), price: 0, coordinates: { lat: 32.2432, lng: 77.1892 }, description: 'Skiing contests, ice-skating, snow queen pageant and folk performances.', isRecurring: true },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        await Hotel.deleteMany({});
        await Activity.deleteMany({});
        await Event.deleteMany({});

        await Hotel.insertMany(hotels);
        await Activity.insertMany(activities);
        await Event.insertMany(events);

        console.log(`✅ Seeded ${hotels.length} hotels, ${activities.length} activities, ${events.length} events.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
