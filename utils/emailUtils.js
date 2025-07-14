const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP (in-memory; use Redis in production)
const otpStore = new Map();

const storeOTP = (email, otp) => {
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expires });
  console.log(`Stored OTP ${otp} for ${email}`);
  return true;
};

const verifyStoredOTP = (email, otp) => {
  const stored = otpStore.get(email);
  if (!stored) {
    console.log(`No OTP found for ${email}`);
    return false;
  }

  const { otp: storedOTP, expires } = stored;
  if (Date.now() > expires) {
    otpStore.delete(email); // Remove expired OTP
    console.log(`OTP expired for ${email}`);
    return false;
  }

  if (storedOTP !== otp) {
    console.log(`Invalid OTP for ${email}`);
    return false;
  }

  // OTP is valid; clean up after successful verification
  otpStore.delete(email);
  console.log(`OTP verified successfully for ${email}`);
  return true;
};

module.exports = { generateOTP, storeOTP, verifyStoredOTP };