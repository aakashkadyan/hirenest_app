const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: false
  },
  applicantInfo: {
    name: {
      type: String,
      required: function() {
        return !this.applicant;
      }
    },
    email: {
      type: String,
      required: function() {
        return !this.applicant;
      }
    }
  },
  resume: {
    fileId: String,
    webViewLink: String,
    fileName: String
  },
  coverLetter: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  applicationMethod: {
    type: String,
    enum: ['full-profile', 'quick-apply'],
    default: 'full-profile'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
