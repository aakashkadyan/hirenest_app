const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const loginRouter = express.Router();
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
dotenv = require('dotenv');
dotenv.config();

// Skip Redis completely - we'll implement token blacklisting without Redis
logger.info('Login router initialized - Running without Redis (token blacklisting not available)');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// GET route to serve the login form
loginRouter.get('/login', (req, res) => {
    logger.info('Login form requested');
    res.sendFile(path.join(__dirname, '../', 'static', 'login.html'));
});

// POST route to handle login
loginRouter.post('/login', async (req, res) => {
        const { email, password } = req.body;

    logger.info('Login attempt started', { 
        email: email?.toLowerCase(),
        hasPassword: !!password
    });

    try {
        if (!email || !password) {
            logger.warning('Login validation failed: Missing credentials', { 
                hasEmail: !!email, 
                hasPassword: !!password 
            });
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            logger.warning('Login failed: User not found', { email: email.toLowerCase() });
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warning('Login failed: Invalid password', { 
                email: email.toLowerCase(),
                userId: user._id
            });
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '10m' }
        );

        logger.info('Login successful', { 
            userId: user._id,
            email: user.email,
            role: user.role,
            tokenExpiry: '10m'
        });

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
        
        logger.debug('Auth token generated', { 
            userId: user._id,
            tokenLength: token.length
        });
    } catch (error) {
        logger.error('Login error', { 
            error: error.message,
            stack: error.stack,
            email: email?.toLowerCase()
        });
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Logout route - without Redis blacklisting
loginRouter.post('/logout', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    logger.info('Logout attempt started', { hasToken: !!token });
    
    if (!token) {
        logger.warning('Logout failed: No token provided');
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Just verify the token is valid
        
        logger.info('Logout successful', { 
            userId: decoded.userId,
            email: decoded.email,
            note: 'Token blacklisting not available without Redis'
        });
        
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.warning('Logout failed: Invalid token', { 
            error: error.message 
        });
        return res.status(400).json({ message: 'Invalid token' });
    }
});

// Middleware to verify JWT token - without blacklist check
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    logger.debug('Token verification started', { hasToken: !!token });
    
    if (!token) {
        logger.warning('Token verification failed: No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        logger.debug('Token verification successful', { 
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        });
        
        next();
    } catch (error) {
        logger.warning('Token verification failed: Invalid or expired token', { 
            error: error.message 
        });
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Protected route example
loginRouter.get('/protected', verifyToken, (req, res) => {
    logger.info('Protected route accessed', { 
        userId: req.user.userId,
        email: req.user.email
    });
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = { loginRouter, verifyToken };
