const express = require('express');
const path = require('path');
const User = require('../models/User');
const signUpRouter = express.Router();
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// GET route to serve the signup form
signUpRouter.get('/signup', (req, res, next) => {
  logger.info('Signup form requested', { 
    url: req.url, 
    method: req.method 
  });
    res.sendFile(path.join(__dirname, '../', 'static', 'signup.html'));
});

// POST route to handle form submission
signUpRouter.post('/signup', async (req, res) => {
        const { name, email, password, role, location } = req.body;
        
  logger.info('User signup attempt started', { 
    name, 
    email: email?.toLowerCase(), 
    role, 
    location,
    hasPassword: !!password
  });

  try {
        // Basic validation
        if (!name || !email || !password || !role || !location) {
      logger.warning('Signup validation failed: Missing required fields', { 
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role,
        hasLocation: !!location
      });
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email format validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
      logger.warning('Signup validation failed: Invalid email format', { 
        email: email?.toLowerCase() 
      });
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Password length validation
        if (password.length < 6) {
      logger.warning('Signup validation failed: Password too short', { 
        email: email?.toLowerCase(),
        passwordLength: password.length
      });
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Role validation
        if (!['jobseeker', 'employer'].includes(role)) {
      logger.warning('Signup validation failed: Invalid role', { 
        email: email?.toLowerCase(),
        providedRole: role,
        validRoles: ['jobseeker', 'employer']
      });
            return res.status(400).json({ error: 'Invalid role selected' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
      logger.warning('Signup failed: Email already registered', { 
        email: email.toLowerCase(),
        existingUserId: existingUser._id
      });
            return res.status(400).json({ error: 'Email already registered' });
        }

    const salt = await bcrypt.genSalt(10);
    let securePassword = await bcrypt.hash(password, salt);

        // Create user data object
        const userData = {
            name: name.trim(),
            email: email.toLowerCase(),
      password: securePassword,
            role,
            location: location.trim()
        };

    logger.debug('Creating user with validated data', { 
      name: userData.name,
      email: userData.email,
      role: userData.role,
      location: userData.location
    });

        const user = await User.create(userData);
    
    logger.info('User created successfully', { 
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location
    });

        // Send success response
        res.status(201).json({ 
            message: 'User created successfully!!',
            success: true
        });
    } catch (error) {
    logger.error('Error during user signup', { 
      error: error.message,
      stack: error.stack,
      email: email?.toLowerCase(),
      name,
      role
    });
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
      logger.warning('Signup failed: Mongoose validation error', { 
        email: email?.toLowerCase(),
        validationErrors: messages
      });
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