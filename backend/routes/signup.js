const express = require('express');
const path = require('path');
const User = require('../models/User');
const signUpRouter = express.Router();
const bcrypt = require('bcryptjs');



// GET route to serve the signup form
signUpRouter.get('/signup', (req, res, next) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, '../', 'static', 'signup.html'));
});

// POST route to handle form submission
signUpRouter.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body);

        const { name, email, password, role, location } = req.body;
        
        // Basic validation
        if (!name || !email || !password || !role || !location) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email format validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Role validation
        if (!['jobseeker', 'employer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role selected' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10)
        let securePassword = await bcrypt.hash(password, salt)


        // Create user data object
        const userData = {
            name: name.trim(),
            email: email.toLowerCase(),
            password :securePassword,
            role,
            location: location.trim()
        };

        console.log('Creating user with data:', userData);

        const user = await User.create(userData);
        console.log('User created successfully!');

        // Send success response
        res.status(201).json({ 
            message: 'User created successfully!!',
            success: true
        });
    } catch (error) {
        console.error('Error details:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        // Handle other errors
        res.status(500).json({ 
            error: 'An error occurred during signup',
            details: error.message
        });
    }
});

module.exports = signUpRouter;