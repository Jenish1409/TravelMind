const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { userId: user.user_id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/register
const register = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password, travel_style = 'relaxed', preferences = [] } = req.body;

            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(409).json({ error: 'Email already registered.' });
            }

            const salt = await bcrypt.genSalt(12);
            const password_hash = await bcrypt.hash(password, salt);
            const user_id = uuidv4();

            const user = await User.create({
                user_id,
                name,
                email,
                password: password_hash,
                travel_style,
                preferences,
            });

            const token = generateToken(user);

            res.status(201).json({
                message: 'Registration successful!',
                token,
                user: { user_id: user.user_id, name: user.name, email: user.email, travel_style: user.travel_style },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Registration failed', details: error.message });
        }
    },
];

// POST /api/auth/login
const login = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            const token = generateToken(user);

            res.json({
                message: 'Login successful!',
                token,
                user: { user_id: user.user_id, name: user.name, email: user.email, travel_style: user.travel_style },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed', details: error.message });
        }
    },
];

// GET /api/auth/profile   (protected)
const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.user.userId }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
};

module.exports = { register, login, getProfile };
