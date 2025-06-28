const express = require('express');
const JobSeekerRoute = express.Router();
const JobSeeker = require('../models/Jobseeker');
const multer = require('multer');
const path = require('path');
const { uploadToGoogleDrive } = require('../utils/googleDrive');

// Use multer memory storage for Google Drive uploads
const upload = multer({ storage: multer.memoryStorage() });

// 2. POST - Create Job Seeker Profile
JobSeekerRoute.post('/', upload.single('resume'), async (req, res) => {
  try {
    const {
      user,
      bio,
      skills,
      experience,
      education,
      jobPreferences
    } = req.body;

    // Parse JSON fields safely
    let parsedSkills, parsedExperience, parsedEducation, parsedJobPreferences;
    try {
      parsedSkills = JSON.parse(skills);
      parsedExperience = JSON.parse(experience);
      parsedEducation = JSON.parse(education);
      parsedJobPreferences = JSON.parse(jobPreferences);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JSON in one of the fields.' });
    }

    // Upload resume to Google Drive
    let resumeLink = null;
    if (req.file) {
      try {
        const driveResult = await uploadToGoogleDrive(req.file);
        resumeLink = driveResult.webViewLink;
        console.log('Resume uploaded successfully to Google Drive');
      } catch (err) {
        console.error('Failed to upload resume to Google Drive:', err.message);
        // Don't fail the entire request, just log the error and continue without resume
        console.warn('Continuing profile creation without resume upload due to Google Drive error');
      }
    }

    const existingProfile = await JobSeeker.findOne({ user });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const newProfile = new JobSeeker({
      user,
      bio,
      skills: parsedSkills,
      experience: parsedExperience,
      education: parsedEducation,
      resume: resumeLink || undefined,
      jobPreferences: parsedJobPreferences
    });

    await newProfile.save();

    res.status(201).json({ message: 'Your Profile is Created at this Job Board!!' });
  } catch (error) {
    console.error('Error in POST /jobseekers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. GET - Fetch Job Seeker Profile by User ID
JobSeekerRoute.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await JobSeeker.findOne({ user: userId }).populate('user', 'name email location');

    if (!profile) {
      return res.status(404).json({ message: 'Job Seeker profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. PUT - Update Job Seeker Profile
JobSeekerRoute.put('/:userId', upload.single('resume'), async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Parse stringified JSON fields
    ['skills', 'experience', 'education', 'jobPreferences'].forEach(field => {
      if (typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (err) {
          console.error(`Failed to parse ${field}:`, err.message);
          return res.status(400).json({ message: `Invalid JSON in field: ${field}` });
        }
      }
    });

    // Handle resume file upload to Google Drive
    if (req.file) {
      try {
        const driveResult = await uploadToGoogleDrive(req.file);
        updateData.resume = driveResult.webViewLink;
        console.log('Resume updated successfully on Google Drive');
      } catch (err) {
        console.error('Failed to upload resume to Google Drive:', err.message);
        // Don't fail the entire update, just log the error and continue without updating resume
        console.warn('Continuing profile update without resume upload due to Google Drive error');
        // Remove resume from updateData to avoid overwriting existing resume with null
        delete updateData.resume;
      }
    }

    const updatedProfile = await JobSeeker.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'name email location');

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Job Seeker profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = JobSeekerRoute;
