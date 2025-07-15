// cartService.js
const Carts = require('../models/Carts');

exports.createCartItem = async (data) => {
  const { acc_id, variant_id, pro_quantity, pro_price } = data;
  const Total_price = pro_quantity * pro_price;
  const cartItem = new Carts({ acc_id, variant_id, pro_quantity, pro_price, Total_price });
  return await cartItem.save();
};

exports.getAllCartItems = async (user) => {
  if (user.role === 'admin' || user.role === 'manager') {
    return await Carts.find()
      .populate('acc_id', 'username name')
      .populate({
        path: 'variant_id',
        populate: [
          { path: 'pro_id', select: 'pro_name' },
          { path: 'color_id', select: 'color_name' },
          { path: 'size_id', select: 'size_name' },
          { path: 'image_id', select: 'imageURL' },
        ],
      });
  } else {
    return await Carts.find({ acc_id: user.id })
      .populate('acc_id', 'username name')
      .populate({
        path: 'variant_id',
        populate: [
          { path: 'pro_id', select: 'pro_name' },
          { path: 'color_id', select: 'color_name' },
          { path: 'size_id', select: 'size_name' },
          { path: 'image_id', select: 'imageURL' },
        ],
      });
  }
};

exports.getCartItemById = async (id) => {
  return await Carts.findById(id)
    .populate('acc_id', 'username name')
    .populate({
      path: 'variant_id',
      populate: [
        { path: 'pro_id', select: 'pro_name' },
        { path: 'color_id', select: 'color_name' },
        { path: 'size_id', select: 'size_name' },
        { path: 'image_id', select: 'imageURL' },
      ],
    });
};

// For update/delete access check (raw, not populated)
exports.getCartItemByIdRaw = async (id) => {
  return await Carts.findById(id);
};

exports.updateCartItem = async (id, data, cartItem) => {
  const { pro_quantity, pro_price, ...updateData } = data;
  const priceToUse =
    pro_price || cartItem.pro_price || cartItem.variant_id?.pro_id?.pro_price || 0;
  const newQuantity = pro_quantity || cartItem.pro_quantity;
  if (newQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  const Total_price = newQuantity * priceToUse;
  return await Carts.findByIdAndUpdate(
    id,
    { ...updateData, pro_quantity: newQuantity, pro_price: priceToUse, Total_price },
    { new: true, runValidators: true }
  )
    .populate('acc_id', 'username name')
    .populate({
      path: 'variant_id',
      populate: [
        { path: 'pro_id', select: 'pro_name pro_price' },
        { path: 'color_id', select: 'color_name' },
        { path: 'size_id', select: 'size_name' },
        { path: 'image_id', select: 'imageURL' },
      ],
    });
};

exports.deleteCartItem = async (id) => {
  return await Carts.findByIdAndDelete(id);
}; 