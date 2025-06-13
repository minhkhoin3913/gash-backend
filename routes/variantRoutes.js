const express = require("express");
const router = express.Router();
const ProductVariants = require("../models/ProductVariants");
const Products = require("../models/Products");
const ProductColors = require("../models/ProductColors");
const ProductSizes = require("../models/ProductSizes");
const ProductImages = require("../models/ProductImages");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Create a new product variant (Admin/Manager)
router.post(
  "/",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { pro_id, color_id, size_id, image_id } = req.body;

      if (
        !mongoose.isValidObjectId(pro_id) ||
        !mongoose.isValidObjectId(color_id) ||
        !mongoose.isValidObjectId(size_id) ||
        !mongoose.isValidObjectId(image_id)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid product, color, size, or image ID" });
      }

      const [product, color, size, image] = await Promise.all([
        Products.findById(pro_id),
        ProductColors.findById(color_id),
        ProductSizes.findById(size_id),
        ProductImages.findById(image_id),
      ]);

      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (!color) return res.status(404).json({ message: "Color not found" });
      if (!size) return res.status(404).json({ message: "Size not found" });
      if (!image) return res.status(404).json({ message: "Image not found" });

      const variant = new ProductVariants({
        pro_id,
        color_id,
        size_id,
        image_id,
      });
      const savedVariant = await variant.save();
      res.status(201).json({
        message: "Product variant created successfully",
        variant: savedVariant,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error creating product variant",
          error: error.message,
        });
    }
  }
);

// Get all product variants (Public), with optional pro_id filter
router.get("/", async (req, res) => {
  try {
    const { pro_id } = req.query;
    let query = {};

    if (pro_id) {
      if (!mongoose.isValidObjectId(pro_id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      query = { pro_id: new mongoose.Types.ObjectId(pro_id) };
    }

    const variants = await ProductVariants.find(query)
      .populate("pro_id", "pro_name")
      .populate("color_id", "color_name")
      .populate("size_id", "size_name")
      .populate("image_id", "imageURL");
    res.status(200).json(variants);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product variants",
        error: error.message,
      });
  }
});

// Get a single product variant by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid variant ID' });
    }

    const variant = await ProductVariants.findById(new mongoose.Types.ObjectId(id))
      .populate('pro_id', 'Pro_name')
      .populate('color_id', 'color_name')
      .populate('size_id', 'size_name')
      .populate('image_id', 'imageURL');
    
    if (!variant) {
      return res.status(404).json({ message: 'Product variant not found' });
    }
    
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product variant', error: error.message });
  }
});

// Update a product variant (Admin/Manager)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid variant ID" });
      }
      const { pro_id, color_id, size_id, image_id } = req.body;

      if (pro_id && !mongoose.isValidObjectId(pro_id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      if (color_id && !mongoose.isValidObjectId(color_id)) {
        return res.status(400).json({ message: "Invalid color ID" });
      }
      if (size_id && !mongoose.isValidObjectId(size_id)) {
        return res.status(400).json({ message: "Invalid size ID" });
      }
      if (image_id && !mongoose.isValidObjectId(image_id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }

      if (pro_id) {
        const product = await Products.findById(pro_id);
        if (!product)
          return res.status(404).json({ message: "Product not found" });
      }
      if (color_id) {
        const color = await ProductColors.findById(color_id);
        if (!color) return res.status(404).json({ message: "Color not found" });
      }
      if (size_id) {
        const size = await ProductSizes.findById(size_id);
        if (!size) return res.status(404).json({ message: "Size not found" });
      }
      if (image_id) {
        const image = await ProductImages.findById(image_id);
        if (!image) return res.status(404).json({ message: "Image not found" });
      }

      const variant = await ProductVariants.findByIdAndUpdate(
        req.params.id,
        {
          ...(pro_id && { pro_id }),
          ...(color_id && { color_id }),
          ...(size_id && { size_id }),
          ...(image_id && { image_id }),
        },
        { new: true, runValidators: true }
      )
        .populate("pro_id", "Pro_name")
        .populate("color_id", "color_name")
        .populate("size_id", "size_name")
        .populate("image_id", "imageURL");
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      res.status(200).json({
        message: "Product variant updated successfully",
        variant,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error updating product variant",
          error: error.message,
        });
    }
  }
);

// Delete a product variant (Admin/Manager)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid variant ID" });
      }
      const variant = await ProductVariants.findByIdAndDelete(req.params.id);
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      res.status(200).json({ message: "Product variant deleted successfully" });
    } catch (error) {
      console.log("Access denied or error:", {
        userId: req.user?.id,
        role: req.user?.role,
        error: error.message,
      });
      res
        .status(500)
        .json({
          message: "Error deleting product variant",
          error: error.message,
        });
    }
  }
);

module.exports = router;
