const mongoose = require('mongoose');
const User = require('./User');

// Student Schema - extends User (2NF: No partial dependency)
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }
});

const Student = User.discriminator('student', studentSchema);

module.exports = Student;
