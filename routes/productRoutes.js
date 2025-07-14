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

// Advanced search products with comprehensive filtering
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      cat_id,
      status_product,
      minPrice,
      maxPrice,
      hasImage,
      dateFrom,
      dateTo
    } = req.query;
    
    let query = {};

    // Category filter
    if (cat_id) {
      if (!mongoose.isValidObjectId(cat_id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      query.cat_id = new mongoose.Types.ObjectId(cat_id);
    }

    // Status filter
    if (status_product) {
      query.status_product = status_product;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pro_price = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        query.pro_price.$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        query.pro_price.$lte = parseFloat(maxPrice);
      }
      if (Object.keys(query.pro_price).length === 0) {
        delete query.pro_price;
      }
    }

    // Image filter
    if (hasImage === 'true') {
      query.imageURL = { $exists: true, $ne: null, $ne: "" };
    } else if (hasImage === 'false') {
      query.$or = [
        { imageURL: { $exists: false } },
        { imageURL: null },
        { imageURL: "" }
      ];
    }

    // Date range filter (if products have creation dates)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate)) query.createdAt.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate)) {
          toDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    // Search query (q) - comprehensive search
    if (q && typeof q === 'string' && q.trim() !== '') {
      const trimmedQuery = q.trim();
      query.$or = [
        { pro_name: { $regex: trimmedQuery, $options: 'i' } },
        { description: { $regex: trimmedQuery, $options: 'i' } },
        { status_product: { $regex: trimmedQuery, $options: 'i' } }
      ];
      
      // Check if query is a valid ObjectId for _id search
      if (mongoose.isValidObjectId(trimmedQuery)) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(trimmedQuery) });
      }
      
      // Price search (if query looks like a number)
      if (!isNaN(parseFloat(trimmedQuery))) {
        const priceValue = parseFloat(trimmedQuery);
        query.$or.push({ pro_price: priceValue });
      }
    }

    const products = await Products.find(query)
      .populate("cat_id", "cat_name")
      .sort({ pro_name: 1 }); // Sort by name for consistency

    res.status(200).json(products);
  } catch (error) {
    console.error('Product search error:', error.message);
    res
      .status(500)
      .json({ message: "Error searching products", error: error.message });
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