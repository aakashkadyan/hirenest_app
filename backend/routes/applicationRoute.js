const express = require('express');
const applicationRoute = express.Router();
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { uploadToS3, deleteFromS3 } = require('../utils/awsS3');
const logger = require('../utils/logger');

// Configure multer for memory storage - PDF only
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

// POST: Submit a job application with resume upload
applicationRoute.post('/', upload.single('resume'), async (req, res) => {
    const { job, applicant, coverLetter } = req.body;
    const resumeFile = req.file;

  logger.info('Application submission started', { 
    jobId: job, 
    applicantId: applicant, 
    hasResume: !!resumeFile,
    method: 'full-application'
  });

  try {
    // Only require job and applicant
    if (!job || !applicant) {
      logger.warn('Application validation failed: Missing required fields', { 
        job: !!job, 
        applicant: !!applicant 
      });
      return res.status(400).json({ error: 'Job and applicant are required' });
    }

    // Upload resume to AWS S3 if provided
    let s3Response = null;
    if (resumeFile) {
      logger.info('Processing resume upload to AWS S3', { 
        fileName: resumeFile.originalname, 
        fileSize: resumeFile.size 
      });
      s3Response = await uploadToS3(resumeFile);
      logger.info('Resume uploaded successfully to AWS S3', { 
        fileId: s3Response.fileId,
        fileName: resumeFile.originalname
      });
    }

    // Create a new application with S3 resume URL if available
    const newApplication = new Application({
      job,
      applicant,
      resume: s3Response ? s3Response.webViewLink : undefined,
      coverLetter,
    });

    // Save to MongoDB
    await newApplication.save();
    
    logger.info('Application submitted successfully', { 
      applicationId: newApplication._id,
      jobId: job,
      applicantId: applicant,
      hasResume: !!s3Response
    });

    res.status(201).json({ 
      message: 'Application submitted successfully', 
      application: newApplication 
    });
  } catch (error) {
    logger.error('Error submitting application', { 
      error: error.message,
      stack: error.stack,
      jobId: job,
      applicantId: applicant
    });
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// POST: Quick apply for jobs without full profile
applicationRoute.post('/quick-apply', upload.single('resume'), async (req, res) => {
    const { job, applicantName, applicantEmail, coverLetter } = req.body;
    const resumeFile = req.file;

  logger.info('Quick application started', { 
    jobId: job, 
    applicantName, 
    applicantEmail,
    hasResume: !!resumeFile
  });

  try {
    // Validate required fields
    if (!job || !applicantName || !applicantEmail) {
      logger.warn('Quick apply validation failed: Missing required fields', { 
        job: !!job, 
        applicantName: !!applicantName, 
        applicantEmail: !!applicantEmail 
      });
      return res.status(400).json({ error: 'Job, applicant name, and email are required' });
    }

    if (!resumeFile) {
      logger.warn('Quick apply validation failed: Resume file required', { 
        jobId: job, 
        applicantEmail 
      });
      return res.status(400).json({ error: 'Resume file is required for quick apply' });
    }

    logger.info('Processing quick apply resume upload', { 
      fileName: resumeFile.originalname, 
      fileSize: resumeFile.size,
      applicantEmail
    });
    
    // Upload resume to AWS S3
    const s3Response = await uploadToS3(resumeFile);
    
    logger.info('Quick apply resume uploaded successfully', { 
      fileId: s3Response.fileId,
      applicantEmail,
      fileName: resumeFile.originalname
    });

    // Create a simplified application record
    const newApplication = new Application({
      job,
      applicant: null, // No full profile
      applicantInfo: {
        name: applicantName,
        email: applicantEmail
      },
      resume: s3Response.webViewLink,
      coverLetter: coverLetter || `Quick application for the position.`,
      applicationMethod: 'quick-apply'
    });

    // Save to MongoDB
    await newApplication.save();

    logger.info('Quick application submitted successfully', { 
      applicationId: newApplication._id,
      jobId: job,
      applicantEmail,
      applicantName
    });
    
    res.status(201).json({ 
      message: 'Quick application submitted successfully', 
      application: newApplication 
    });
  } catch (error) {
    logger.error('Error submitting quick application', { 
      error: error.message,
      stack: error.stack,
      jobId: job,
      applicantEmail
    });
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

applicationRoute.get('/:id', async (req, res) => {
      const jobId = req.params.id;
  
  logger.info('Fetching applications for job', { jobId });

  try {
      // Find applications for the given job ID & populate applicant and resume details
      const applications = await Application.find({ job: jobId })
        .populate('applicant', 'name email') // Fetch applicant's name & email
        // .populate('resume', 'url') // Fetch resume URL if stored
  
      
      if (!applications || applications.length === 0) {
      logger.info('No applications found for job', { jobId });
        return res.status(404).json({ message: 'No applications found for this job' });
      }

    logger.info('Applications retrieved successfully', { 
      jobId, 
      applicationsCount: applications.length 
    });
  
      res.status(200).json({ applications });
    } catch (error) {
    logger.error('Error fetching applications for job', { 
      error: error.message,
      stack: error.stack,
      jobId
    });
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });

  applicationRoute.get('/', async (req, res) => {
      const { postedBy } = req.query;
  
  logger.info('Fetching applications by employer', { postedBy });

  try {
      if (!postedBy) {
      logger.warn('Missing postedBy parameter in applications fetch');
        return res.status(400).json({ message: 'Missing postedBy parameter' });
      }
  
      const jobs = await Job.find({ postedBy });
      const jobIds = jobs.map(job => job._id);
    
    logger.debug('Found jobs for employer', { 
      postedBy, 
      jobsCount: jobs.length,
      jobIds: jobIds.map(id => id.toString())
    });
  
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

    logger.info('Applications retrieved successfully for employer', { 
      postedBy, 
      totalApplications: transformedApplications.length,
      quickApplyCount: transformedApplications.filter(app => app.applicationMethod === 'quick-apply').length
    });
  
      res.status(200).json({ applications: transformedApplications });
    } catch (error) {
    logger.error('Error fetching applications for employer', { 
      error: error.message,
      stack: error.stack,
      postedBy
    });
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });
  
  
applicationRoute.patch('/:id', async (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;

  logger.info('Application status update started', { applicationId, newStatus: status });

  try {
    // Validate status value
    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      logger.warn('Invalid status value provided', { 
        applicationId, 
        providedStatus: status,
        validStatuses: ['pending', 'reviewed', 'shortlisted', 'rejected']
      });
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      logger.warn('Application not found for status update', { applicationId });
      return res.status(404).json({ message: 'Application not found' });
    }

    logger.info('Application status updated successfully', { 
      applicationId, 
      oldStatus: updatedApplication.status,
      newStatus: status,
      jobId: updatedApplication.job
    });

    res.status(200).json({ message: 'Status updated successfully', application: updatedApplication });
  } catch (error) {
    logger.error('Error updating application status', { 
      error: error.message,
      stack: error.stack,
      applicationId,
      status
    });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// DELETE: Delete an application by ID
applicationRoute.delete('/:id', async (req, res) => {
  const applicationId = req.params.id;
  
  logger.info('Application deletion started', { applicationId });

  try {
    // Find the application first to get the file ID
    const application = await Application.findById(applicationId);
    if (!application) {
      logger.warn('Application not found for deletion', { applicationId });
      return res.status(404).json({ message: 'Application not found' });
    }

    logger.debug('Application found for deletion', { 
      applicationId,
      hasResume: !!application.resume,
      jobId: application.job
    });

    // Delete the file from AWS S3 if it exists
    if (application.resume && application.resume.fileId) {
      logger.info('Deleting resume from AWS S3', { 
        applicationId,
        fileId: application.resume.fileId,
        fileName: application.resume.fileName
      });
      await deleteFromS3(application.resume.fileId);
      logger.info('Resume deleted from AWS S3 successfully', { 
        applicationId,
        fileId: application.resume.fileId
      });
    }

    // Delete the application from MongoDB
    await Application.findByIdAndDelete(applicationId);
    
    logger.info('Application deleted successfully', { 
      applicationId,
      jobId: application.job
    });

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    logger.error('Error deleting application', { 
      error: error.message,
      stack: error.stack,
      applicationId
    });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// SUGGESTIONS ROUTES

// GET: Suggest applicants based on applications for jobs posted by employer
applicationRoute.get('/suggestions/applicants', async (req, res) => {
  const query = req.query.q || '';
  const employerId = req.query.employerId;
  
  logger.info('Fetching applicant suggestions', { query, employerId });

  try {
    // Get all jobs posted by this employer
    const jobs = await Job.find({ postedBy: employerId });
    const jobIds = jobs.map(job => job._id);
    
    logger.debug('Found jobs for applicant suggestions', { 
      employerId, 
      jobsCount: jobs.length 
    });

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
    
    logger.info('Applicant suggestions retrieved', { 
      query, 
      employerId, 
      suggestionsCount: suggestions.length 
    });
    
    res.json(suggestions);
  } catch (error) {
    logger.error('Error fetching applicant suggestions', { 
      error: error.message,
      stack: error.stack,
      query,
      employerId
    });
    res.status(500).json({ error: 'Failed to fetch applicant suggestions', details: error.message });
  }
});

// GET: Suggest job titles based on jobs posted by employer
applicationRoute.get('/suggestions/jobs', async (req, res) => {
  const query = req.query.q || '';
  const employerId = req.query.employerId;
  
  logger.info('Fetching job title suggestions', { query, employerId });

  try {
    // Get all jobs posted by this employer
    const jobs = await Job.find({ 
      postedBy: employerId,
      title: { $regex: query, $options: 'i' } 
    }).select('title').limit(10);

    // Extract unique job titles
    const jobTitles = jobs
      .map(job => job.title)
      .filter((title, index, arr) => arr.indexOf(title) === index); // Remove duplicates

    // Return in the format expected by AutoSuggestInput
    const suggestions = jobTitles.map(title => ({ name: title }));
    
    logger.info('Job title suggestions retrieved', { 
      query, 
      employerId, 
      suggestionsCount: suggestions.length 
    });
    
    res.json(suggestions);
  } catch (error) {
    logger.error('Error fetching job title suggestions', { 
      error: error.message,
      stack: error.stack,
      query,
      employerId
    });
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