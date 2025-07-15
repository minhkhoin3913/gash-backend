// accountService.js
const Accounts = require('../models/Accounts');

exports.createAccount = async (data) => {
  const { username, name, email, phone, address, password, image, role } = data;
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
    image: image || 'https://i.redd.it/1to4yvt3i88c1.png',
    role: role || 'user',
    acc_status: 'active'
  });
  const savedAccount = await account.save();
  return {
    status: 201,
    response: {
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
    }
  };
};

exports.getAllAccounts = async () => {
  return await Accounts.find().select('-password');
};

exports.getAccountById = async (id, user) => {
  if (user.role !== 'admin' && user.id !== id.toString()) {
    return { status: 403, response: { message: 'Access denied: Can only view own account' } };
  }
  const account = await Accounts.findById(id).select('-password');
  if (!account) {
    return { status: 404, response: { message: 'Account not found' } };
  }
  return { status: 200, response: account };
};

exports.updateAccount = async (id, data, user) => {
  if (user.role !== 'admin' && user.id !== id.toString()) {
    return { status: 403, response: { message: 'Access denied: Can only update own account' } };
  }
  const { username, email, ...updateData } = data;
  if (username || email) {
    const existingAccount = await Accounts.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: id }
    });
    if (existingAccount) {
      return { status: 400, response: { message: 'Username or email already exists' } };
    }
  }
  const account = await Accounts.findByIdAndUpdate(
    id,
    { ...updateData, ...(username && { username }), ...(email && { email }) },
    { new: true, runValidators: true }
  ).select('-password');
  if (!account) {
    return { status: 404, response: { message: 'Account not found' } };
  }
  return { status: 200, response: { message: 'Account updated successfully', account } };
};

exports.deleteAccount = async (id, user) => {
  if (user.role !== 'admin' && user.id !== id.toString()) {
    return { status: 403, response: { message: 'Access denied: Can only delete own account' } };
  }
  const account = await Accounts.findByIdAndDelete(id);
  if (!account) {
    return { status: 404, response: { message: 'Account not found' } };
  }
  return { status: 200, response: { message: 'Account deleted successfully' } };
}; 