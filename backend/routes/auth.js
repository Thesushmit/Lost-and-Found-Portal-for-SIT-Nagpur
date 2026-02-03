const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup/student
// @desc    Register a new student
// @access  Public
router.post('/signup/student', async (req, res) => {
  try {
    const { email, password, name, studentId, semester } = req.body;

    // Validation
    if (!email || !password || !name || !studentId || !semester) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if student ID already exists
    const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }

    // Create new student
    const student = new Student({
      email,
      password,
      name,
      studentId,
      semester: parseInt(semester)
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id);

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        userType: student.userType,
        studentId: student.studentId,
        semester: student.semester
      }
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/signup/staff
// @desc    Register a new staff member
// @access  Public
router.post('/signup/staff', async (req, res) => {
  try {
    const { email, password, name, department } = req.body;

    // Validation
    if (!email || !password || !name || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new staff
    const staff = new Staff({
      email,
      password,
      name,
      department
    });

    await staff.save();

    // Generate token
    const token = generateToken(staff._id);

    res.status(201).json({
      message: 'Staff registered successfully',
      token,
      user: {
        id: staff._id,
        email: staff.email,
        name: staff.name,
        userType: staff.userType,
        department: staff.department
      }
    });
  } catch (error) {
    console.error('Staff signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data based on type
    let userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType
    };

    if (user.userType === 'student') {
      userData.studentId = user.studentId;
      userData.semester = user.semester;
    } else if (user.userType === 'staff') {
      userData.department = user.department;
    }

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
