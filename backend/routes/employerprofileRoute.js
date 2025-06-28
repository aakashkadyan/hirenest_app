const express = require('express');
const EmployerProfile = require('../models/EmployerProfile');
const employerprofileRoute = express.Router();

// POST - create employer profile
employerprofileRoute.post('/', async (req, res) => {
  try {
    const { companyName, industry, website, description, location, companySize, user } = req.body;
    console.log("Received data:", req.body);

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
    res.status(201).json({ message: "Employer Profile created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// GET - fetch all employer profiles
employerprofileRoute.get('/', async (req, res) => {
  try {
    const employerProfiles = await EmployerProfile.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(employerProfiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employer profiles" });
  }
});

// GET - fetch employer profile by user ID
employerprofileRoute.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await EmployerProfile.findOne({ user: userId }).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// PUT - update employer profile
employerprofileRoute.put('/:id', async (req, res) => {
  try {
    const { companyName, industry, website, description, location, companySize } = req.body;

    const updatedProfile = await EmployerProfile.findByIdAndUpdate(
      req.params.id,
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
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    res.status(200).json({ message: "Employer Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE - delete employer profile
employerprofileRoute.delete('/:id', async (req, res) => {
  try {
    const deletedProfile = await EmployerProfile.findByIdAndDelete(req.params.id);

    if (!deletedProfile) {
      return res.status(404).json({ message: "Employer Profile not found" });
    }

    res.status(200).json({ message: "Employer Profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = employerprofileRoute;
