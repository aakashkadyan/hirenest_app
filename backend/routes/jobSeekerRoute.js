const express = require('express');
const JobSeekerRoute = express.Router();
const JobSeeker = require('../models/Jobseeker');
const multer = require('multer');
const path = require('path');
const { uploadToS3 } = require('../utils/awsS3');
const logger = require('../utils/logger');

// Use multer memory storage for S3 uploads - PDF only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files for resumes
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      logger.warn('Resume upload rejected: Only PDF files allowed', { 
        fileName: file.originalname, 
        mimeType: file.mimetype 
      });
      cb(new Error('Only PDF files are allowed for resumes'));
    }
  },
});

// 2. POST - Create Job Seeker Profile
JobSeekerRoute.post('/', upload.single('resume'), async (req, res) => {
    const {
      user,
      bio,
      skills,
      experience,
      education,
      jobPreferences
    } = req.body;

  // Initialize resumeLink at the very top, before any try-catch blocks
  let resumeLink = null;

  logger.info('Job seeker profile creation started', { 
    userId: user, 
    hasResume: !!req.file 
  });

  try {
    
    // Parse JSON fields safely
    let parsedSkills, parsedExperience, parsedEducation, parsedJobPreferences;
    try {
      parsedSkills = JSON.parse(skills);
      parsedExperience = JSON.parse(experience);
      parsedEducation = JSON.parse(education);
      parsedJobPreferences = JSON.parse(jobPreferences);
      
      logger.debug('JSON fields parsed successfully', { 
        userId: user,
        skillsCount: parsedSkills?.length,
        experienceCount: parsedExperience?.length,
        educationCount: parsedEducation?.length
      });
    } catch (err) {
      logger.warn('Invalid JSON in profile fields', { 
        userId: user,
        error: err.message 
      });
      return res.status(400).json({ message: 'Invalid JSON in one of the fields.' });
    }

    // Upload resume to AWS S3
    if (req.file) {
      try {
        logger.info('Uploading resume to AWS S3', { 
          userId: user,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });
        const s3Result = await uploadToS3(req.file);
        resumeLink = s3Result.webViewLink;
        logger.info('Resume uploaded successfully to AWS S3', { 
          userId: user,
          fileName: req.file.originalname,
          fileId: s3Result.fileId
        });
      } catch (err) {
        logger.error('Failed to upload resume to AWS S3', { 
          userId: user,
          error: err.message,
          stack: err.stack,
          fileName: req.file.originalname
        });
        // Don't fail the entire request, just log the error and continue without resume
        logger.warn('Continuing profile creation without resume upload due to AWS S3 error', { 
          userId: user 
        });
      }
    }

    const existingProfile = await JobSeeker.findOne({ user });
    logger.debug('Checking for existing profile', { 
      userId: user, 
      existingProfile: !!existingProfile,
      existingProfileId: existingProfile?._id
    });
    if (existingProfile) {
      logger.warn('Profile creation failed: Profile already exists', { 
        userId: user,
        existingProfileId: existingProfile._id
      });
      return res.status(400).json({ message: 'Profile already exists' });
    }

    logger.debug('Creating new job seeker profile with data', {
      userId: user,
      bio: bio,
      skillsCount: parsedSkills?.length,
      experienceCount: parsedExperience?.length,
      educationCount: parsedEducation?.length,
      hasResume: !!resumeLink,
      resumeLink: resumeLink,
      jobPreferences: parsedJobPreferences
    });

    const newProfile = new JobSeeker({
      user,
      bio,
      skills: parsedSkills,
      experience: parsedExperience,
      education: parsedEducation,
      resume: resumeLink || undefined,
      jobPreferences: parsedJobPreferences
    });

    logger.debug('JobSeeker model instance created, attempting to save...', {
      userId: user,
      profileId: newProfile._id
    });

    await newProfile.save();

    logger.info('Job seeker profile created successfully', { 
      userId: user,
      profileId: newProfile._id,
      hasResume: !!resumeLink,
      skillsCount: parsedSkills?.length,
      experienceCount: parsedExperience?.length
    });

    res.status(201).json({ message: 'Your Profile is Created at this Job Board!!' });
  } catch (error) {
    // Direct console logging to see full error details
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Full error object:', error);
    console.error('==========================');
    
    logger.error('Error creating job seeker profile', { 
      error: error.message,
      stack: error.stack,
      userId: user,
      hasResume: !!resumeLink,
      resumeLink: resumeLink,
      errorName: error.name,
      errorCode: error.code,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. GET - Fetch Job Seeker Profile by User ID
JobSeekerRoute.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  logger.info('Fetching job seeker profile', { userId });

  try {
    const profile = await JobSeeker.findOne({ user: userId }).populate('user', 'name email location');

    if (!profile) {
      logger.info('Job seeker profile not found', { userId });
      return res.status(404).json({ message: 'Job Seeker profile not found' });
    }

    logger.info('Job seeker profile retrieved successfully', { 
      userId,
      profileId: profile._id,
      hasResume: !!profile.resume,
      skillsCount: profile.skills?.length
    });

    res.status(200).json(profile);
  } catch (error) {
    logger.error('Error fetching job seeker profile', { 
      error: error.message,
      stack: error.stack,
      userId
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. PUT - Update Job Seeker Profile
JobSeekerRoute.put('/:userId', upload.single('resume'), async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;

  logger.info('Job seeker profile update started', { 
    userId, 
    hasNewResume: !!req.file,
    updateFields: Object.keys(updateData)
  });

  try {
    // Parse stringified JSON fields
    ['skills', 'experience', 'education', 'jobPreferences'].forEach(field => {
      if (typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
          logger.debug(`Parsed ${field} field successfully`, { 
            userId, 
            itemCount: updateData[field]?.length 
          });
        } catch (err) {
          logger.error(`Failed to parse ${field} field`, { 
            userId, 
            field, 
            error: err.message 
          });
          return res.status(400).json({ message: `Invalid JSON in field: ${field}` });
        }
      }
    });

    // Handle resume file upload to AWS S3
    if (req.file) {
      try {
        logger.info('Updating resume on AWS S3', { 
          userId,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });
        const s3Result = await uploadToS3(req.file);
        updateData.resume = s3Result.webViewLink;
        logger.info('Resume updated successfully on AWS S3', { 
          userId,
          fileName: req.file.originalname,
          fileId: s3Result.fileId
        });
      } catch (err) {
        logger.error('Failed to upload resume to AWS S3 during update', { 
          userId,
          error: err.message,
          fileName: req.file.originalname
        });
        // Don't fail the entire update, just log the error and continue without updating resume
        logger.warn('Continuing profile update without resume upload due to AWS S3 error', { 
          userId 
        });
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
      logger.warn('Job seeker profile not found for update', { userId });
      return res.status(404).json({ message: 'Job Seeker profile not found' });
    }

    logger.info('Job seeker profile updated successfully', { 
      userId,
      profileId: updatedProfile._id,
      updatedFields: Object.keys(updateData),
      hasResume: !!updatedProfile.resume
    });

    res.status(200).json({ message: 'Profile updated successfully', updatedProfile });
  } catch (error) {
    logger.error('Error updating job seeker profile', { 
      error: error.message,
      stack: error.stack,
      userId,
      updateFields: Object.keys(updateData)
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = JobSeekerRoute;
