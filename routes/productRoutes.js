const express = require("express");
const router = express.Router();
const Products = require("../models/Products");
const Categories = require("../models/Categories");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Create a new product (Admin/Manager)
router.post(
  "/",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        pro_name,
        pro_price,
        imageURL,
        description,
        cat_id,
        status_product,
      } = req.body;

      if (!mongoose.isValidObjectId(cat_id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await Categories.findById(cat_id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const product = new Products({
        pro_name,
        pro_price,
        imageURL: imageURL || "https://external-preview.redd.it/r6g38aXSaQWtd1KxwJbQ-Fs5jtSVDxX3wtLHJEdqixw.jpg?width=1080&crop=smart&auto=webp&s=87a2c94cb3e1561e2b6abd467ea68d81b9901720",
        description,
        cat_id,
        status_product: status_product || "active"
      });

      const savedProduct = await product.save();
      res.status(201).json({
        message: "Product created successfully",
        product: savedProduct,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating product", error: error.message });
    }
  }
);

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Products.find().populate("cat_id", "cat_name");
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Products.findById(req.params.id).populate(
      "cat_id",
      "cat_name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
});

// Update a product (Admin/Manager)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const { cat_id, ...updateData } = req.body;
      if (cat_id) {
        if (!mongoose.isValidObjectId(cat_id)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        const category = await Categories.findById(cat_id);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
      }
      const product = await Products.findByIdAndUpdate(
        req.params.id,
        { ...updateData, ...(cat_id && { cat_id }) },
        { new: true, runValidators: true }
      ).populate("cat_id", "cat_name");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating product", error: error.message });
    }
  }
);

// Delete a product (Admin/Manager)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await Products.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log("Access denied or error:", {
        userId: req.user?.id,
        role: req.user?.role,
        error: error.message,
      });
      res
        .status(500)
        .json({ message: "Error deleting product", error: error.message });
    }
  }
);

module.exports = router;
