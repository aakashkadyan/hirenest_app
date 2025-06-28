const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const loginRouter = express.Router();
const bcrypt = require('bcryptjs');
dotenv = require('dotenv');
dotenv.config();

// Skip Redis completely - we'll implement token blacklisting without Redis
console.log('Running without Redis - token blacklisting will not be available');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// GET route to serve the login form
loginRouter.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'static', 'login.html'));
});

// POST route to handle login
loginRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        console.log('Your Auth Token is : ', token);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Logout route - without Redis blacklisting
loginRouter.post('/logout', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });

    try {
        jwt.verify(token, JWT_SECRET); // Just verify the token is valid
        console.log('Token verified, but blacklisting is not available without Redis');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' });
    }
});

// Middleware to verify JWT token - without blacklist check
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Protected route example
loginRouter.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = { loginRouter, verifyToken };
