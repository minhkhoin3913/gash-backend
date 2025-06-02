const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AccountsSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true, 
    minlength: [3, 'Username must be at least 3 characters long'], 
    maxlength: [30, 'Username cannot exceed 30 characters'] 
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    maxlength: [50, 'Name cannot exceed 50 characters'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'] 
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'], 
    maxlength: [100, 'Address cannot exceed 100 characters'] 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Prevents password from being returned in queries
  },
  image: { 
    type: String, 
    default: 'https://example.com/default-profile-image.jpg', 
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  },
  role: { 
    type: String, 
    required: [true, 'Role is required'], 
    enum: {
      values: ['user', 'admin', 'manager'],
      message: 'Role must be either user, admin, or manager'
    },
    default: 'user'
  },
  acc_status: { 
    type: String, 
    required: [true, 'Account status is required'], 
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Account status must be active, inactive, or suspended'
    },
    default: 'active'
  }
});

// Hash password before saving
AccountsSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
AccountsSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Accounts', AccountsSchema);