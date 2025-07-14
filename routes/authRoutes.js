const express = require('express');
const router = express.Router();
const Accounts = require('../models/Accounts');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const { generateOTP, storeOTP, verifyStoredOTP } = require('../utils/emailUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, phone, address, password, image } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

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
      role: 'user',
      acc_status: 'active'
    });

    const savedAccount = await account.save();

    const token = jwt.sign(
      { id: savedAccount._id, username: savedAccount.username, role: savedAccount.role },
      JWT_SECRET,
      { expiresIn: '1d' }
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

// Verify OTP for registration
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const isValidOTP = await verifyStoredOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Request OTP for forgot password
router.post('/forgot-password/request-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const account = await Accounts.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOTP();
    const stored = storeOTP(email, otp);
    if (!stored) {
      throw new Error('Failed to store OTP');
    }

    res.status(200).json({ message: 'OTP generated successfully', otp });
  } catch (error) {
    console.error('Error generating OTP:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate OTP' });
  }
});

// Verify OTP for forgot password
router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const account = await Accounts.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const isValidOTP = await verifyStoredOTP(email, otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Reset password
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const account = await Accounts.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // No OTP verification here; it was done in /forgot-password/verify-otp
    account.password = newPassword;
    await account.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
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
      { expiresIn: '1d' }
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

// Google Login route
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    let account = await Accounts.findOne({ email });

    if (!account) {
      const username = email.split('@')[0];
      account = new Accounts({
        username,
        name: name || username,
        email,
        image: picture || 'https://i.redd.it/1to4yvt3i88c1.png',
        googleId,
        role: 'user',
        acc_status: 'active'
      });
      await account.save();
    } else if (!account.googleId) {
      account.googleId = googleId;
      await account.save();
    }

    if (account.acc_status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }

    const jwtToken = jwt.sign(
      { id: account._id, username: account.username, role: account.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
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
    res.status(500).json({ message: 'Error with Google login', error: error.message });
  }
});

// Request OTP for registration
router.post('/register/request-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existingAccount = await Accounts.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    const stored = storeOTP(email, otp);
    if (!stored) {
      throw new Error('Failed to store OTP');
    }

    res.status(200).json({ message: 'OTP generated successfully', otp });
  } catch (error) {
    console.error('Error generating OTP:', error.message);
    res.status(500).json({ message: error.message || 'Failed to generate OTP' });
  }
});

module.exports = router;