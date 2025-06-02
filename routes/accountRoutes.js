const express = require('express');
const router = express.Router();
const Accounts = require('../models/Accounts');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Create a new account (Admin only)
router.post('/', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
  try {
    const { username, name, email, phone, address, password, image, role } = req.body;
    
    const existingAccount = await Accounts.findOne({ $or: [{ username }, { email }] });
    if (existingAccount) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const account = new Accounts({
      username,
      name,
      email,
      phone,
      address,
      password,
      image: image || 'https://i.redd.it/1to4yvt3i88c1.png',
      role: role || 'user',
      acc_status: 'active'
    });

    const savedAccount = await account.save();
    res.status(201).json({
      message: 'Account created successfully',
      account: {
        _id: savedAccount._id,
        username: savedAccount.username,
        name: savedAccount.name,
        email: savedAccount.email,
        phone: savedAccount.phone,
        address: savedAccount.address,
        image: savedAccount.image,
        role: savedAccount.role,
        acc_status: savedAccount.acc_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
});

// Get all accounts (Admin only)
router.get('/', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
  try {
    const accounts = await Accounts.find().select('-password');
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving accounts', error: error.message });
  }
});

// Get a single account by ID (Admin or self)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    // Convert both IDs to strings for comparison
    if (req.user.role !== 'admin' && req.user.id !== req.params.id.toString()) {
      console.log('Access denied:', { userId: req.user.id, requestedId: req.params.id });
      return res.status(403).json({ message: 'Access denied: Can only view own account' });
    }
    const account = await Accounts.findById(req.params.id).select('-password');
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving account', error: error.message });
  }
});

// Update an account (Admin or self)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id.toString()) {
      return res.status(403).json({ message: 'Access denied: Can only update own account' });
    }
    const { username, email, ...updateData } = req.body;

    if (username || email) {
      const existingAccount = await Accounts.findOne({
        $or: [{ username }, { email }],
        _id: { $ne: req.params.id }
      });
      if (existingAccount) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }

    const account = await Accounts.findByIdAndUpdate(
      req.params.id,
      { ...updateData, ...(username && { username }), ...(email && { email }) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json({
      message: 'Account updated successfully',
      account
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
});

// Delete an account (Admin or self)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id.toString()) {
      return res.status(403).json({ message: 'Access denied: Can only delete own account' });
    }
    const account = await Accounts.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

module.exports = router;