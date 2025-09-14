const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Connect to MongoDB (adjust MONGO_URI as needed)


const  MONGO_URI = "mongodb+srv://bluebirdadmin:bluebirdadmin@bluebirdtinderdatabase.3fp6q1j.mongodb.net/?retryWrites=true&w=majority&appName=bluebirdtinderdatabase"


if (!mongoose.connection.readyState) {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch(err => console.error('Mongo connect error:', err));
}

// User model
const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Helpers
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';
function createToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Routes
// POST /auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name = '', email, password ,role=" "} = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed ,role});

        const token = createToken(user);
        return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email ,role : user.role}, token });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = createToken(user);
        return res.json({ user: { id: user._id, name: user.name, email: user.email, role : user.role}, token });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;