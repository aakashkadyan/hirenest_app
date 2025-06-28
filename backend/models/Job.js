const mongoose = require('mongoose');
const salarySchema = new mongoose.Schema({
  min: {
    type: Number,
    required: [true, 'Minimum salary is required'],
    min: 0, // Minimum salary should not be negative
  },
  max: {
    type: Number,
    required: [true, 'Maximum salary is required'],
    validate: {
      validator: function (value) {
        if (typeof value !== 'number' || typeof this.min !== 'number') return true;
        return value >= this.min;
      },
      message: 'Max salary must be greater than or equal to min salary.',
    },
    
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD'],
  }, 
}, { _id: false });

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
    },
    salaryRange: salarySchema, // Use the sub-schema for salary range
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ensure a user is linked to the job posting
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

module.exports = mongoose.model('Job', jobSchema);
