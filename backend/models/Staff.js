const mongoose = require('mongoose');
const User = require('./User');

// Staff Schema - extends User (2NF: No partial dependency)
const staffSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true
  }
});

const Staff = User.discriminator('staff', staffSchema);

module.exports = Staff;
