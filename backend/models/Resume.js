const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required']
  },
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      fieldOfStudy: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date }
    }
  ],
  experience: [
    {
      company: { type: String, required: true },
      jobTitle: { type: String, required: true },
      location: { type: String },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String }
    }
  ],
  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }
  ],
  certifications: [
    {
      name: { type: String, required: true },
      issuingOrganization: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expirationDate: { type: Date }
    }
  ],
  projects: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      startDate: { type: Date },
      endDate: { type: Date },
      link: { type: String }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
