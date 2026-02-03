const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema with normalization (1NF, 2NF, 3NF)
// Separate schemas for Students and Staff to avoid redundancy

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    enum: ['student', 'staff'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  discriminatorKey: 'userType',
  collection: 'users'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
