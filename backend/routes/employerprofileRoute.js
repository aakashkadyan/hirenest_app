const express = require('express');
const EmployerProfile = require('../models/EmployerProfile');
const employerprofileRoute = express.Router();
const logger = require('../utils/logger');

// POST - create employer profile
employerprofileRoute.post('/', async (req, res) => {
    const { companyName, industry, website, description, location, companySize, user } = req.body;
  
  logger.info('Employer profile creation started', { 
    companyName, 
    industry, 
    location, 
    companySize, 
    userId: user,
    hasWebsite: !!website,
    hasDescription: !!description
  });

  try {
    const employerProfile = new EmployerProfile({
      companyName,
      industry,
      website,
      description,
      location,
      companySize,
      user
    });

    await employerProfile.save();
    
    logger.info('Employer profile created successfully', { 
      profileId: employerProfile._id,
      companyName,
      industry,
      userId: user
    });
    
    res.status(201).json({ message: "Employer Profile created successfully!" });
  } catch (error) {
    logger.error('Error creating employer profile', { 
      error: error.message,
      stack: error.stack,
      companyName,
      userId: user
    });
    res.status(400).json({ message: error.message });
  }
});

// GET - fetch all employer profiles
employerprofileRoute.get('/', async (req, res) => {
  logger.info('Fetching all employer profiles');

  try {
    const employerProfiles = await EmployerProfile.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    logger.info('Employer profiles fetched successfully', { 
      profilesCount: employerProfiles.length 
    });

    res.status(200).json(employerProfiles);
  } catch (error) {
    logger.error('Error fetching employer profiles', { 
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Failed to fetch employer profiles" });
  }
});

// GET - fetch employer profile by user ID
employerprofileRoute.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  logger.info('Fetching employer profile by user ID', { userId });

  try {
    const profile = await EmployerProfile.findOne({ user: userId }).populate('user', 'name email');

    if (!profile) {
      logger.info('Employer profile not found', { userId });
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    logger.info('Employer profile fetched successfully', { 
      userId,
      profileId: profile._id,
      companyName: profile.companyName,
      industry: profile.industry
    });

    res.status(200).json(profile);
  } catch (error) {
    logger.error('Error fetching employer profile', { 
      error: error.message,
      stack: error.stack,
      userId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT - update employer profile
employerprofileRoute.put('/:id', async (req, res) => {
  const profileId = req.params.id;
    const { companyName, industry, website, description, location, companySize } = req.body;

  logger.info('Employer profile update started', { 
    profileId,
    companyName,
    industry,
    location,
    updateFields: Object.keys(req.body)
  });

  try {
    const updatedProfile = await EmployerProfile.findByIdAndUpdate(
      profileId,
      {
        companyName,
        industry,
        website,
        description,
        location,
        companySize,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      logger.warning('Employer profile not found for update', { profileId });
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    logger.info('Employer profile updated successfully', { 
      profileId,
      oldCompanyName: updatedProfile.companyName,
      newCompanyName: companyName,
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({ message: "Employer Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    logger.error('Error updating employer profile', { 
      error: error.message,
      stack: error.stack,
      profileId,
      updateFields: Object.keys(req.body)
    });
    res.status(400).json({ message: error.message });
  }
});

// DELETE - delete employer profile
employerprofileRoute.delete('/:id', async (req, res) => {
  const profileId = req.params.id;
  
  logger.info('Employer profile deletion started', { profileId });

  try {
    const deletedProfile = await EmployerProfile.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      logger.warning('Employer profile not found for deletion', { profileId });
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    logger.info('Employer profile deleted successfully', { 
      profileId,
      companyName: deletedProfile.companyName,
      userId: deletedProfile.user
    });

    res.status(200).json({ message: "Employer Profile deleted successfully" });
  } catch (error) {
    logger.error('Error deleting employer profile', { 
      error: error.message,
      stack: error.stack,
      profileId
    });
    res.status(400).json({ message: error.message });
  }
});

module.exports = employerprofileRoute;
