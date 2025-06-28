const express = require('express');
const recommendationRoute = express.Router();
const Recommendation = require('../models/Recommendation'); // Import the Recommendation model

// GET job recommendations for a user
recommendationRoute.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find recommendations for the given userId
    const recommendations = await Recommendation.findOne({ jobSeekerId: userId })
      .populate('recommendedJobs.jobId', 'title description location') // Populate job details
      .exec();

    if (!recommendations) {
      return res.status(404).json({ message: 'No recommendations found for this user.' });
    }

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = recommendationRoute;
