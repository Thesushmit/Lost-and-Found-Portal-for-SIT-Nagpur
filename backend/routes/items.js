const express = require('express');
const FoundItem = require('../models/FoundItem');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/items
// @desc    Upload a new found item
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { itemName, description, foundLocation, foundDate, foundTime, depositLocation, category } = req.body;

    // Validation
    if (!itemName || !description || !foundLocation || !foundDate || !foundTime || !depositLocation) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Create image URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // Create new found item
    const foundItem = new FoundItem({
      itemName,
      description,
      imageUrl,
      foundLocation,
      foundDate: new Date(foundDate),
      foundTime,
      depositLocation,
      category: category || 'others',
      uploadedBy: req.userId
    });

    await foundItem.save();

    // Populate uploader info
    await foundItem.populate('uploadedBy', 'name email userType');

    res.status(201).json({
      message: 'Item uploaded successfully',
      item: foundItem
    });
  } catch (error) {
    console.error('Upload item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/items
// @desc    Get all found items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 12 } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { foundLocation: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get items with pagination
    const items = await FoundItem.find(query)
      .populate('uploadedBy', 'name email userType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await FoundItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('uploadedBy', 'name email userType')
      .populate('claimDetails.claimedBy', 'name email userType');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only uploader or staff can update
    if (item.uploadedBy.toString() !== req.userId && req.user.userType !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    if (status) {
      item.status = status;
    }

    await item.save();
    await item.populate('uploadedBy', 'name email userType');
    await item.populate('claimDetails.claimedBy', 'name email userType');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/items/:id/claim
// @desc    Claim an item
// @access  Private
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const { claimantName, claimantEmail, claimantPhone, claimantId, ownershipProof } = req.body;

    // Validation
    if (!claimantName || !claimantEmail || !claimantPhone || !ownershipProof) {
      return res.status(400).json({ message: 'Please provide all required claim details' });
    }

    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'This item is no longer available for claiming' });
    }

    // Update item with claim details
    item.status = 'claimed';
    item.claimDetails = {
      claimantName,
      claimantEmail,
      claimantPhone,
      claimantId: claimantId || '',
      ownershipProof,
      claimedAt: new Date(),
      claimedBy: req.userId
    };

    await item.save();
    await item.populate('uploadedBy', 'name email userType');
    await item.populate('claimDetails.claimedBy', 'name email userType');

    res.json({
      message: 'Item claimed successfully! Please visit the deposit location with valid ID.',
      item
    });
  } catch (error) {
    console.error('Claim item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Only uploader or staff can delete
    if (item.uploadedBy.toString() !== req.userId && req.user.userType !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/items/user/my-items
// @desc    Get items uploaded by current user
// @access  Private
router.get('/user/my-items', auth, async (req, res) => {
  try {
    const items = await FoundItem.find({ uploadedBy: req.userId })
      .populate('uploadedBy', 'name email userType')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
