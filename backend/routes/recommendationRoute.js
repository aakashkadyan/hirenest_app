const express = require('express');
const recommendationRoute = express.Router();
const Recommendation = require('../models/Recommendation'); // Import the Recommendation model
const logger = require('../utils/logger');

// GET job recommendations for a user
recommendationRoute.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  logger.info('Job recommendations request started', { userId });

  try {
    // Find recommendations for the given userId
    const recommendations = await Recommendation.findOne({ jobSeekerId: userId })
      .populate('recommendedJobs.jobId', 'title description location') // Populate job details
      .exec();

    if (!recommendations) {
      logger.info('No recommendations found for user', { userId });
      return res.status(404).json({ message: 'No recommendations found for this user.' });
    }

    logger.info('Job recommendations retrieved successfully', { 
      userId,
      recommendationsId: recommendations._id,
      jobsCount: recommendations.recommendedJobs?.length || 0,
      recommendedJobIds: recommendations.recommendedJobs?.map(job => job.jobId?._id) || []
    });

    res.status(200).json(recommendations);
  } catch (error) {
    logger.error('Error fetching job recommendations', { 
      error: error.message,
      stack: error.stack,
      userId
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = recommendationRoute;
