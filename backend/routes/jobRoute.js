const express = require('express');
const Job = require('../models/Job');
const logger = require('../utils/logger');

const jobRoute = express.Router();

// POST /api/jobs - Create a new job
jobRoute.post('/', async (req, res) => {
    const { title, description, requirements, salaryRange, location, postedBy } = req.body;

  logger.info('Job creation started', { 
    title, 
    location, 
    postedBy,
    hasDescription: !!description,
    hasRequirements: !!requirements,
    hasSalaryRange: !!salaryRange
  });

  try {
    // Create a new job
    const job = new Job({
      title,
      description,
      requirements,
      salaryRange,
      location,
      postedBy,
    });

    await job.save();
    
    logger.info('Job created successfully', { 
      jobId: job._id,
      title: job.title,
      location: job.location,
      postedBy
    });
    
    res.status(201).json({ message: "Jobs Posted successfully!"});
  } catch (error) {
    logger.error('Error creating job', { 
      error: error.message,
      stack: error.stack,
      title,
      postedBy
    });
    res.status(400).json({ message: error.message });
  }
});

jobRoute.get('/', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const location = req.query.location || '';
  const postedBy = req.query.postedBy; 

  logger.info('Jobs fetch started', { 
    offset, 
    limit, 
    search, 
    location, 
    postedBy,
    hasFilters: !!(search || location || postedBy)
  });

  // Build dynamic query
  const query = {
    title: { $regex: search, $options: 'i' },
    location: { $regex: location, $options: 'i' },
  };

  if (postedBy) {
    query.postedBy = postedBy;
  }

  logger.debug('Job query built', { query, offset, limit });

  try {
    const jobs = await Job.find(query).skip(offset).limit(limit);
    const totalCount = await Job.countDocuments(query);

    logger.info('Jobs fetched successfully', { 
      jobsCount: jobs.length,
      totalCount,
      offset,
      limit,
      hasMore: (offset + limit) < totalCount
    });

    res.json({ jobs, totalCount });
  } catch (err) {
    logger.error('Error fetching jobs', { 
      error: err.message,
      stack: err.stack,
      query,
      offset,
      limit
    });
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

jobRoute.get('/:id', async (req, res) => {
  const jobId = req.params.id;
  
  logger.info('Single job fetch started', { jobId });

  try {
    const job = await Job.findById(jobId);
    
    if (!job) {
      logger.warning('Job not found', { jobId });
      return res.status(404).json({ message: 'Job not found' });
    }

    logger.info('Job fetched successfully', { 
      jobId,
      title: job.title,
      location: job.location,
      postedBy: job.postedBy
    });

    res.status(200).json({ job });
  } catch (error) {
    logger.error('Error fetching single job', { 
      error: error.message,
      stack: error.stack,
      jobId
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

jobRoute.delete('/:id', async (req, res) => {
  const jobId = req.params.id;
  
  logger.info('Job deletion started', { jobId });

  try {
      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
      logger.warning('Job not found for deletion', { jobId });
          return res.status(404).json({ message: "Job not found" });
      }

    logger.debug('Job found for deletion', { 
      jobId,
      title: job.title,
      postedBy: job.postedBy
    });

      // Delete the job
      await Job.findByIdAndDelete(jobId);
    
    logger.info('Job deleted successfully', { 
      jobId,
      title: job.title,
      postedBy: job.postedBy
    });
    
      res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    logger.error('Error deleting job', { 
      error: error.message,
      stack: error.stack,
      jobId
    });
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

jobRoute.put('/:id', async (req, res) => {
      const jobId = req.params.id;
      const updateData = req.body;
  
  logger.info('Job update started', { 
    jobId, 
    updateFields: Object.keys(updateData)
  });

  try {
      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
      logger.warning('Job not found for update', { jobId });
          return res.status(404).json({ message: "Job not found" });
      }

    logger.debug('Job found for update', { 
      jobId,
      currentTitle: job.title,
      updateFields: Object.keys(updateData)
    });

      // Update the job
      const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true, runValidators: true });

    logger.info('Job updated successfully', { 
      jobId,
      oldTitle: job.title,
      newTitle: updatedJob.title,
      updatedFields: Object.keys(updateData)
    });

      res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    logger.error('Error updating job', { 
      error: error.message,
      stack: error.stack,
      jobId,
      updateFields: Object.keys(updateData)
    });
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = jobRoute;
