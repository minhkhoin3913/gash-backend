const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Create a new product (Admin/Manager)
router.post(
  "/",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  createProduct
);

// Get all products
router.get("/", getAllProducts);

// Advanced search products with comprehensive filtering
router.get("/search", searchProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product (Admin/Manager)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  updateProduct
);

// Delete a product (Admin/Manager)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  deleteProduct
);

module.exports = router;