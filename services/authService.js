// authService.js
const Accounts = require('../models/Accounts');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const { generateOTP, storeOTP, verifyStoredOTP } = require('../utils/emailUtils');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');

exports.register = async (data) => {
  const { username, name, email, phone, address, password, image } = data;
  if (!username || !email || !password) {
    return { status: 400, response: { message: 'Username, email, and password are required' } };
  }
  const existingAccount = await Accounts.findOne({ $or: [{ username }, { email }] });
  if (existingAccount) {
    return { status: 400, response: { message: 'Username or email already exists' } };
  }
  const account = new Accounts({
    username,
    name,
    email,
    phone,
    address,
    password,
    image: image || 'http://localhost:4000/default-pfp.jpg',
    role: 'user',
    acc_status: 'active'
  });
  const savedAccount = await account.save();
  const token = jwt.sign(
    { id: savedAccount._id, username: savedAccount.username, role: savedAccount.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return {
    status: 201,
    response: {
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
    }
  };
};

exports.verifyRegisterOtp = async (data) => {
  const { email, otp } = data;
  if (!email || !otp) {
    return { status: 400, response: { message: 'Email and OTP are required' } };
  }
  const isValidOTP = await verifyStoredOTP(email, otp);
  if (!isValidOTP) {
    return { status: 400, response: { message: 'Invalid or expired OTP' } };
  }
  return { status: 200, response: { message: 'OTP verified successfully' } };
};

exports.requestForgotPasswordOtp = async (data) => {
  const { email } = data;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { status: 400, response: { message: 'Invalid email address' } };
  }
  const account = await Accounts.findOne({ email });
  if (!account) {
    return { status: 404, response: { message: 'No account found with this email' } };
  }
  const otp = generateOTP();
  const stored = storeOTP(email, otp);
  if (!stored) {
    throw new Error('Failed to store OTP');
  }
  return { status: 200, response: { message: 'OTP generated successfully', otp } };
};

exports.verifyForgotPasswordOtp = async (data) => {
  const { email, otp } = data;
  if (!email || !otp) {
    return { status: 400, response: { message: 'Email and OTP are required' } };
  }
  const account = await Accounts.findOne({ email });
  if (!account) {
    return { status: 404, response: { message: 'No account found with this email' } };
  }
  const isValidOTP = await verifyStoredOTP(email, otp);
  if (!isValidOTP) {
    return { status: 400, response: { message: 'Invalid or expired OTP' } };
  }
  return { status: 200, response: { message: 'OTP verified successfully' } };
};

exports.resetPassword = async (data) => {
  const { email, newPassword } = data;
  if (!email || !newPassword) {
    return { status: 400, response: { message: 'Email and new password are required' } };
  }
  const account = await Accounts.findOne({ email });
  if (!account) {
    return { status: 404, response: { message: 'No account found with this email' } };
  }
  account.password = newPassword;
  await account.save();
  return { status: 200, response: { message: 'Password reset successfully' } };
};

exports.login = async (data) => {
  const { username, password } = data;
  if (!username || !password) {
    return { status: 400, response: { message: 'Username and password are required' } };
  }
  const account = await Accounts.findOne({ username }).select('+password');
  if (!account) {
    return { status: 401, response: { message: 'Invalid username or password' } };
  }
  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    return { status: 401, response: { message: 'Invalid username or password' } };
  }
  if (account.acc_status !== 'active') {
    return { status: 403, response: { message: 'Account is inactive or suspended' } };
  }
  const token = jwt.sign(
    { id: account._id, username: account.username, role: account.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return {
    status: 200,
    response: {
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
    }
  };
};

exports.googleLogin = async (data) => {
  const { token } = data;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, name, picture, sub: googleId } = ticket.getPayload();
  let account = await Accounts.findOne({ email });
  if (!account) {
    const username = email.split('@')[0];
    // Generate a random secure password for Google accounts
    const randomPassword = crypto.randomBytes(24).toString('base64');
    account = new Accounts({
      username,
      name: name || username,
      email,
      image: picture || 'http://localhost:4000/default-pfp.jpg',
      googleId,
      password: randomPassword,
      role: 'user',
      acc_status: 'active'
    });
    await account.save();
  } else if (!account.googleId) {
    account.googleId = googleId;
    await account.save();
  }
  if (account.acc_status !== 'active') {
    return { status: 403, response: { message: 'Account is inactive or suspended' } };
  }
  const jwtToken = jwt.sign(
    { id: account._id, username: account.username, role: account.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return {
    status: 200,
    response: {
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
    }
  };
};

exports.requestRegisterOtp = async (data) => {
  const { email } = data;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { status: 400, response: { message: 'Invalid email address' } };
  }
  const existingAccount = await Accounts.findOne({ email });
  if (existingAccount) {
    return { status: 400, response: { message: 'Email already registered' } };
  }
  const otp = generateOTP();
  const stored = storeOTP(email, otp);
  if (!stored) {
    throw new Error('Failed to store OTP');
  }
  return { status: 200, response: { message: 'OTP generated successfully', otp } };
}; 