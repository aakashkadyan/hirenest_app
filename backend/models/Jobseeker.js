const mongoose = require('mongoose');

const jobSeekerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true
  },
  bio: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    required: false // Make individual skills optional
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }, { _id: false }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number
  }, { _id: false }],
  resume: {
    type: String, // Store file path or cloud URL for resume
    required: false // Make resume optional
  },
  jobPreferences: {
    preferredJobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'freelance'],
      default: 'full-time'
    },
    preferredLocation: String
  }
}, { timestamps: true }); // This will automatically add createdAt and updatedAt

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
