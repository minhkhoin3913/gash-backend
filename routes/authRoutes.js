const express = require('express');
const router = express.Router();
const Accounts = require('../models/Accounts');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, phone, address, password, image } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check for duplicate username or email
    const existingAccount = await Accounts.findOne({ $or: [{ username }, { email }] });
    if (existingAccount) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new account with default role and status
    const account = new Accounts({
      username,
      name,
      email,
      phone,
      address,
      password,
      image: image || 'https://example.com/default-profile-image.jpg',
      role: 'user',
      acc_status: 'active'
    });

    const savedAccount = await account.save();

    // Generate JWT
    const token = jwt.sign(
      { id: savedAccount._id, username: savedAccount.username, role: savedAccount.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
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
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const account = await Accounts.findOne({ username }).select('+password');
    if (!account) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (account.acc_status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }

    const token = jwt.sign(
      { id: account._id, username: account.username, role: account.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      account: {
        _id: account._id,
        username: account.username,
        name: account.name,
        email: account.email,
        phone: account.phone,
        address: account.address,
        image: account.image,
        role: account.role,
        acc_status: account.acc_status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;