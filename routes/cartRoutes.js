const express = require("express");
const router = express.Router();
const Carts = require("../models/Carts");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Create a new cart item (User for own cart, Admin/Manager)
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { acc_id, variant_id, pro_quantity, pro_price } = req.body;

    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      req.user.id !== acc_id.toString()
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        requestedAccId: acc_id,
      });
      return res
        .status(403)
        .json({
          message: "Access denied: Can only create cart for own account",
        });
    }

    const Total_price = pro_quantity * pro_price;
    const cartItem = new Carts({
      acc_id,
      variant_id,
      pro_quantity,
      pro_price,
      Total_price,
    });

    const savedCartItem = await cartItem.save();
    res.status(201).json({
      message: "Cart item created successfully",
      cartItem: savedCartItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating cart item", error: error.message });
  }
});

// Get all cart items (Admin/Manager or own carts for User)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    let cartItems;
    if (req.user.role === "admin" || req.user.role === "manager") {
      cartItems = await Carts.find()
        .populate("acc_id", "username name")
        .populate({
          path: "variant_id",
          populate: [
            { path: "pro_id", select: "pro_name" },
            { path: "color_id", select: "color_name" },
            { path: "size_id", select: "size_name" },
            { path: "image_id", select: "imageURL" },
          ],
        });
    } else {
      cartItems = await Carts.find({ acc_id: req.user.id })
        .populate("acc_id", "username name")
        .populate({
          path: "variant_id",
          populate: [
            { path: "pro_id", select: "pro_name" },
            { path: "color_id", select: "color_name" },
            { path: "size_id", select: "size_name" },
            { path: "image_id", select: "imageURL" },
          ],
        });
    }
    res.status(200).json(cartItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart items", error: error.message });
  }
});

// Get a single cart item by ID (Admin/Manager or own cart for User)
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const cartItem = await Carts.findById(req.params.id)
      .populate("acc_id", "username name")
      .populate({
        path: "variant_id",
        populate: [
          { path: "pro_id", select: "pro_name" },
          { path: "color_id", select: "color_name" },
          { path: "size_id", select: "size_name" },
            { path: "image_id", select: "imageURL" },
        ],
      });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      cartItem.acc_id._id.toString() !== req.user.id
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        cartAccId: cartItem.acc_id._id.toString(),
      });
      return res
        .status(403)
        .json({ message: "Access denied: Can only view own cart item" });
    }
    res.status(200).json(cartItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart item", error: error.message });
  }
});

// Update a cart item (Admin/Manager or own cart for User)
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const cartItem = await Carts.findById(req.params.id).populate({
      path: "variant_id",
      populate: { path: "pro_id", select: "pro_price" },
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      cartItem.acc_id.toString() !== req.user.id
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        cartAccId: cartItem.acc_id.toString(),
      });
      return res
        .status(403)
        .json({ message: "Access denied: Can only update own cart item" });
    }

    const { pro_quantity, pro_price, ...updateData } = req.body;
    let Total_price;
    // Use provided pro_price, existing cartItem.pro_price, or fetch from variant_id.pro_id
    const priceToUse =
      pro_price ||
      cartItem.pro_price ||
      cartItem.variant_id?.pro_id?.pro_price ||
      0;
    const newQuantity = pro_quantity || cartItem.pro_quantity;

    if (newQuantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    Total_price = newQuantity * priceToUse;

    const updatedCartItem = await Carts.findByIdAndUpdate(
      req.params.id,
      { ...updateData, pro_quantity: newQuantity, pro_price: priceToUse, Total_price },
      { new: true, runValidators: true }
    )
      .populate("acc_id", "username name")
      .populate({
        path: "variant_id",
        populate: [
          { path: "pro_id", select: "pro_name pro_price" },
          { path: "color_id", select: "color_name" },
          { path: "size_id", select: "size_name" },
          { path: "image_id", select: "imageURL" },
        ],
      });

    res.status(200).json({
      message: "Cart item updated successfully",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
});

// Delete a cart item (Admin/Manager or own cart for User)
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const cartItem = await Carts.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      cartItem.acc_id.toString() !== req.user.id
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        cartAccId: cartItem.acc_id.toString(),
      });
      return res
        .status(403)
        .json({ message: "Access denied: Can only delete own cart item" });
    }
    await Carts.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cart item", error: error.message });
  }
});

module.exports = router;
