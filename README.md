# 🌍 TravelMind – AI Powered Personalized Travel Recommendation and Itinerary Planner

> Hackathon-ready full-stack travel planner combining Groq AI, MongoDB, React, and Leaflet maps.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Groq API key → [console.groq.com](https://console.groq.com)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@travelmind-cluster.vtokiku.mongodb.net/test3?appName=travelmind-cluster
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
npm run dev
```
Backend runs at → `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → `http://localhost:5173`

---

## 📁 Folder Structure

```
TravelMind/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── itineraryController.js
│   │   ├── tripController.js
│   │   └── userController.js
│   ├── data/
│   │   └── places.js            # Static tourist places dataset (anti-hallucination)
│   ├── models/
│   │   ├── User.js
│   │   ├── Trip.js
│   │   └── Preferences.js
│   ├── routes/
│   │   ├── itinerary.js
│   │   ├── trips.js
│   │   └── users.js
│   ├── services/
│   │   ├── aiService.js         # Groq AI integration
│   │   └── recommendationService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── TripPlanner.jsx
│   │   │   ├── Itinerary.jsx
│   │   │   └── MapView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/generate-itinerary` | Generate AI itinerary |
| POST | `/api/save-trip` | Save trip to MongoDB |
| GET | `/api/trips/:user_id` | Get user's past trips |
| GET | `/api/user-preferences?userId=` | Fetch user preferences |
| POST | `/api/user-preferences` | Save/update preferences |
| POST | `/api/users/register` | Register user |

---

## 📡 Example API Requests

### Generate Itinerary (Form mode)
```bash
curl -X POST http://localhost:5000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo_user",
    "destination": "Goa",
    "days": 3,
    "interests": ["beaches", "nightlife"],
    "budget": 15000
  }'
```

### Generate via Natural Language Prompt
```bash
curl -X POST http://localhost:5000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo_user",
    "prompt": "Plan a 3 day Goa trip with beaches and nightlife under 15000"
  }'
```

### Save a Trip
```bash
curl -X POST http://localhost:5000/api/save-trip \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo_user",
    "destination": "Goa",
    "days": 3,
    "interests": ["beaches", "nightlife"],
    "itinerary": [...]
  }'
```

### Get User Trips
```bash
curl http://localhost:5000/api/trips/demo_user
```

---

## 🤖 AI Model

- **Provider**: Groq  
- **Model**: `llama-3.3-70b-versatile`  
- **System Prompt**: Restricts AI to only recommend places from the static dataset, returns structured JSON.
- **Fallback**: If AI fails, the static dataset generates the itinerary directly.

---

## 🎯 Personalization Demo

| Scenario | Behavior |
|----------|----------|
| First trip (`demo_user`) | Generic itinerary for destination |
| Second trip (same `userId`) | Personalized – preferences learned from Trip 1 are applied |
| Different `userId` | Fresh (first-time user) itinerary |

---

## 🗺️ Supported Destinations

Goa · Jaipur · Manali · Delhi · Mumbai · Agra · Kerala · Rajasthan

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| AI | Groq API, llama-3.3-70b-versatile |
| Maps | Leaflet.js, React-Leaflet, OpenStreetMap |
| HTTP Client | Axios |
