const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    required: [true, 'Role is required'],
    enum: {
      values: ['jobseeker', 'employer'],
      message: 'Role must be either jobseeker or employer'
    }
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
