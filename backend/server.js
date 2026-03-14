const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/itinerary'));
app.use('/api', require('./routes/trips'));
app.use('/api', require('./routes/users'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TravelMind API is running', version: '2.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TravelMind server running on port ${PORT}`);
});

module.exports = app;
