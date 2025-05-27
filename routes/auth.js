const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Accounts = require('../models/Accounts');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, phone, address, image, role, acc_status } = req.body;

    const account = new Accounts({
      username,
      email,
      password,
      name,
      phone,
      address,
      image,
      role,
      acc_status
    });

    await account.save();

    const token = jwt.sign(
      { id: account._id, role: account.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, user: { id: account._id, username, email, role: account.role, image: account.image } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const account = await Accounts.findOne({ email }).select('+password');
    if (!account) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await account.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (account.acc_status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const token = jwt.sign(
      { id: account._id, role: account.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: account._id, username: account.username, email, role: account.role, image: account.image } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const account = await Accounts.findById(decoded.id);

    if (!account) return res.status(404).json({ error: 'User not found' });

    res.json({ id: account._id, username: account.username, email: account.email, role: account.role, image: account.image });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;