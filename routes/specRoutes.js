const express = require("express");
const router = express.Router();
const ProductImages = require("../models/ProductImages");
const ProductSizes = require("../models/ProductSizes");
const ProductColors = require("../models/ProductColors");
const Products = require("../models/Products");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// --- Product Images Routes ---

// Create a new product image (Admin/Manager)
router.post(
  "/image",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { pro_id, imageURL } = req.body;

      if (!mongoose.isValidObjectId(pro_id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await Products.findById(pro_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const image = new ProductImages({ pro_id, imageURL: imageURL || "https://i.redd.it/iq6c1c3yqc861.jpg" });
      const savedImage = await image.save();
      res.status(201).json({
        message: "Product image created successfully",
        image: savedImage,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error creating product image",
          error: error.message,
        });
    }
  }
);

// Get all product images (Public)
router.get("/image", async (req, res) => {
  try {
    const images = await ProductImages.find().populate("pro_id", "pro_name");
    res.status(200).json(images);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product images",
        error: error.message,
      });
  }
});

// Get a single product image by ID (Public)
router.get("/image/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }
    const image = await ProductImages.findById(req.params.id).populate(
      "pro_id",
      "pro_name"
    );
    if (!image) {
      return res.status(404).json({ message: "Product image not found" });
    }
    res.status(200).json(image);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product image",
        error: error.message,
      });
  }
});

// Update a product image (Admin/Manager)
router.put(
  "/image/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const { pro_id, imageURL } = req.body;
      if (pro_id) {
        if (!mongoose.isValidObjectId(pro_id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Products.findById(pro_id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
      }
      const image = await ProductImages.findByIdAndUpdate(
        req.params.id,
        { ...(pro_id && { pro_id }), ...(imageURL && { imageURL }) },
        { new: true, runValidators: true }
      ).populate("pro_id", "pro_name");
      if (!image) {
        return res.status(404).json({ message: "Product image not found" });
      }
      res.status(200).json({
        message: "Product image updated successfully",
        image,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error updating product image",
          error: error.message,
        });
    }
  }
);

// Delete a product image (Admin/Manager)
router.delete(
  "/image/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const image = await ProductImages.findByIdAndDelete(req.params.id);
      if (!image) {
        return res.status(404).json({ message: "Product image not found" });
      }
      res.status(200).json({ message: "Product image deleted successfully" });
    } catch (error) {
      console.log("Access denied or error:", {
        userId: req.user?.id,
        role: req.user?.role,
        error: error.message,
      });
      res
        .status(500)
        .json({
          message: "Error deleting product image",
          error: error.message,
        });
    }
  }
);

// --- Product Colors Routes ---

// Create a new product color (Admin/Manager)
router.post(
  "/color",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { color_name } = req.body;
      if (!color_name) {
        return res.status(400).json({ message: "Color name is required" });
      }
      const existingColor = await ProductColors.findOne({ color_name });
      if (existingColor) {
        return res.status(400).json({ message: "Color name already exists" });
      }
      const color = new ProductColors({ color_name });
      const savedColor = await color.save();
      res.status(201).json({
        message: "Product color created successfully",
        color: savedColor,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error creating product color",
          error: error.message,
        });
    }
  }
);

// Get all product colors (Public)
router.get("/color", async (req, res) => {
  try {
    const colors = await ProductColors.find();
    res.status(200).json(colors);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product colors",
        error: error.message,
      });
  }
});

// Get a single product color by ID (Public)
router.get("/color/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid color ID" });
    }
    const color = await ProductColors.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: "Product color not found" });
    }
    res.status(200).json(color);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product color",
        error: error.message,
      });
  }
});

// Update a product color (Admin/Manager)
router.put(
  "/color/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid color ID" });
      }
      const { color_name } = req.body;
      if (color_name) {
        const existingColor = await ProductColors.findOne({
          color_name,
          _id: { $ne: req.params.id },
        });
        if (existingColor) {
          return res.status(400).json({ message: "Color name already exists" });
        }
      }
      const color = await ProductColors.findByIdAndUpdate(
        req.params.id,
        { color_name },
        { new: true, runValidators: true }
      );
      if (!color) {
        return res.status(404).json({ message: "Product color not found" });
      }
      res.status(200).json({
        message: "Product color updated successfully",
        color,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error updating product color",
          error: error.message,
        });
    }
  }
);

// Delete a product color (Admin/Manager)
router.delete(
  "/color/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid color ID" });
      }
      const color = await ProductColors.findByIdAndDelete(req.params.id);
      if (!color) {
        return res.status(404).json({ message: "Product color not found" });
      }
      res.status(200).json({ message: "Product color deleted successfully" });
    } catch (error) {
      console.log("Access denied or error:", {
        userId: req.user?.id,
        role: req.user?.role,
        error: error.message,
      });
      res
        .status(500)
        .json({
          message: "Error deleting product color",
          error: error.message,
        });
    }
  }
);

// --- Product Sizes Routes ---

// Create a new product size (Admin/Manager)
router.post(
  "/size",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { size_name } = req.body;
      if (!size_name) {
        return res.status(400).json({ message: "Size name is required" });
      }
      const existingSize = await ProductSizes.findOne({ size_name });
      if (existingSize) {
        return res.status(400).json({ message: "Size name already exists" });
      }
      const size = new ProductSizes({ size_name });
      const savedSize = await size.save();
      res.status(201).json({
        message: "Product size created successfully",
        size: savedSize,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating product size", error: error.message });
    }
  }
);

// Get all product sizes (Public)
router.get("/size", async (req, res) => {
  try {
    const sizes = await ProductSizes.find();
    res.status(200).json(sizes);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving product sizes",
        error: error.message,
      });
  }
});

// Get a single product size by ID (Public)
router.get("/size/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid size ID" });
    }
    const size = await ProductSizes.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: "Product size not found" });
    }
    res.status(200).json(size);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving product size", error: error.message });
  }
});

// Update a product size (Admin/Manager)
router.put(
  "/size/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid size ID" });
      }
      const { size_name } = req.body;
      if (size_name) {
        const existingSize = await ProductSizes.findOne({
          size_name,
          _id: { $ne: req.params.id },
        });
        if (existingSize) {
          return res.status(400).json({ message: "Size name already exists" });
        }
      }
      const size = await ProductSizes.findByIdAndUpdate(
        req.params.id,
        { size_name },
        { new: true, runValidators: true }
      );
      if (!size) {
        return res.status(404).json({ message: "Product size not found" });
      }
      res.status(200).json({
        message: "Product size updated successfully",
        size,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating product size", error: error.message });
    }
  }
);

// Delete a product size (Admin/Manager)
router.delete(
  "/size/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid size ID" });
      }
      const size = await ProductSizes.findByIdAndDelete(req.params.id);
      if (!size) {
        return res.status(404).json({ message: "Product size not found" });
      }
      res.status(200).json({ message: "Product size deleted successfully" });
    } catch (error) {
      console.log("Access denied or error:", {
        userId: req.user?.id,
        role: req.user?.role,
        error: error.message,
      });
      res
        .status(500)
        .json({ message: "Error deleting product size", error: error.message });
    }
  }
);

module.exports = router;
