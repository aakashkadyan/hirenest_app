const express = require('express');
const applicationRoute = express.Router();
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { uploadToGoogleDrive, deleteFromGoogleDrive } = require('../utils/googleDrive');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// POST: Submit a job application with resume upload
applicationRoute.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { job, applicant, coverLetter } = req.body;
    const resumeFile = req.file;

    // Only require job and applicant
    if (!job || !applicant) {
      return res.status(400).json({ error: 'Job and applicant are required' });
    }

    // Upload resume to Google Drive if provided
    let driveResponse = null;
    if (resumeFile) {
      console.log('📄 Processing resume upload...');
      driveResponse = await uploadToGoogleDrive(resumeFile);
    }

    // Create a new application with Google Drive file info if available
    const newApplication = new Application({
      job,
      applicant,
      resume: driveResponse
        ? {
            fileId: driveResponse.fileId,
            webViewLink: driveResponse.webViewLink,
            fileName: resumeFile.originalname
          }
        : undefined,
      coverLetter,
    });

    // Save to MongoDB
    await newApplication.save();

    res.status(201).json({ 
      message: 'Application submitted successfully', 
      application: newApplication 
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// POST: Quick apply for jobs without full profile
applicationRoute.post('/quick-apply', upload.single('resume'), async (req, res) => {
  try {
    const { job, applicantName, applicantEmail, coverLetter } = req.body;
    const resumeFile = req.file;

    // Validate required fields
    if (!job || !applicantName || !applicantEmail) {
      return res.status(400).json({ error: 'Job, applicant name, and email are required' });
    }

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required for quick apply' });
    }

    console.log('📄 Processing quick apply resume upload...');
    
    // Upload resume to Google Drive (or local storage)
    const driveResponse = await uploadToGoogleDrive(resumeFile);

    // Create a simplified application record
    const newApplication = new Application({
      job,
      applicant: null, // No full profile
      applicantInfo: {
        name: applicantName,
        email: applicantEmail
      },
      resume: {
        fileId: driveResponse.fileId,
        webViewLink: driveResponse.webViewLink,
        fileName: resumeFile.originalname
      },
      coverLetter: coverLetter || `Quick application for the position.`,
      applicationMethod: 'quick-apply'
    });

    // Save to MongoDB
    await newApplication.save();

    console.log('✅ Quick application submitted successfully');
    res.status(201).json({ 
      message: 'Quick application submitted successfully', 
      application: newApplication 
    });
  } catch (error) {
    console.error('Error submitting quick application:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

applicationRoute.get('/:id', async (req, res) => {
    try {
      const jobId = req.params.id;
  
      // Find applications for the given job ID & populate applicant and resume details
      const applications = await Application.find({ job: jobId })
        .populate('applicant', 'name email') // Fetch applicant's name & email
        // .populate('resume', 'url') // Fetch resume URL if stored
  
      
      if (!applications || applications.length === 0) {
        return res.status(404).json({ message: 'No applications found for this job' });
      }
  
      res.status(200).json({ applications });
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });

  applicationRoute.get('/', async (req, res) => {
    try {
      const { postedBy } = req.query;
  
      if (!postedBy) {
        return res.status(400).json({ message: 'Missing postedBy parameter' });
      }
  
      const jobs = await Job.find({ postedBy });
      const jobIds = jobs.map(job => job._id);
  
      const applications = await Application.find({ job: { $in: jobIds } })
        .populate({
          path: 'applicant',
          select: 'bio skills experience education resume user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate({
          path: 'job',
          select: 'title description location company'
        });
  
      // Transform applications to include applicant info from both sources
      const transformedApplications = applications.map(app => {
        const appObj = app.toObject();
        
        // If it's a quick apply, use applicantInfo instead of populated applicant
        if (app.applicationMethod === 'quick-apply' && app.applicantInfo) {
          appObj.applicant = {
            user: {
              name: app.applicantInfo.name,
              email: app.applicantInfo.email
            },
            bio: 'Quick application - no full profile',
            skills: [],
            experience: [],
            education: []
          };
        }
        
        return appObj;
      });
  
      res.status(200).json({ applications: transformedApplications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
  
  
applicationRoute.patch('/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    // Validate status value
    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', application: updatedApplication });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// DELETE: Delete an application by ID
applicationRoute.delete('/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Find the application first to get the file ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Delete the file from Google Drive if it exists
    if (application.resume && application.resume.fileId) {
      await deleteFromGoogleDrive(application.resume.fileId);
    }

    // Delete the application from MongoDB
    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// SUGGESTIONS ROUTES

// GET: Suggest applicants based on applications for jobs posted by employer
applicationRoute.get('/suggestions/applicants', async (req, res) => {
  try {
    const query = req.query.q || '';
    const employerId = req.query.employerId; // You might need to pass this from frontend

    // Get all jobs posted by this employer
    const jobs = await Job.find({ postedBy: employerId });
    const jobIds = jobs.map(job => job._id);

    // Get applications for these jobs and populate applicant details
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: 'applicant',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    // Extract unique applicant names that match the query
    const applicantNames = applications
      .map(app => app.applicant?.user?.name)
      .filter(name => name && name.toLowerCase().includes(query.toLowerCase()))
      .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
      .slice(0, 10);

    // Return in the format expected by AutoSuggestInput
    const suggestions = applicantNames.map(name => ({ name }));
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching applicant suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch applicant suggestions', details: error.message });
  }
});

// GET: Suggest job titles based on jobs posted by employer
applicationRoute.get('/suggestions/jobs', async (req, res) => {
  try {
    const query = req.query.q || '';
    const employerId = req.query.employerId; // You might need to pass this from frontend

    const jobs = await Job.find({ 
      postedBy: employerId,
      title: { $regex: query, $options: 'i' } 
    })
      .limit(10)
      .select('title')
      .lean();

    // Return in the format expected by AutoSuggestInput
    const suggestions = jobs.map(job => ({ title: job.title }));
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching job title suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch job title suggestions', details: error.message });
  }
});

// GET: Suggest locations based on jobs posted by employer
applicationRoute.get('/suggestions/locations', async (req, res) => {
  try {
    const query = req.query.q || '';
    const employerId = req.query.employerId; // You might need to pass this from frontend

    const jobs = await Job.find({ 
      postedBy: employerId,
      location: { $regex: query, $options: 'i' } 
    })
      .limit(20)
      .select('location')
      .lean();

    // Get unique locations
    const uniqueLocations = [...new Set(jobs.map(job => job.location))];
    
    // Return in the format expected by AutoSuggestInput
    const suggestions = uniqueLocations.map(location => ({ location }));
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch location suggestions', details: error.message });
  }
});

module.exports = applicationRoute;