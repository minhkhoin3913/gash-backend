const express = require("express");
const router = express.Router();
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createProductImage,
  getAllProductImages,
  getProductImagesByProductId,
  getProductImageById,
  updateProductImage,
  deleteProductImage,
  createProductColor,
  getAllProductColors,
  getProductColorById,
  updateProductColor,
  deleteProductColor,
  createProductSize,
  getAllProductSizes,
  getProductSizeById,
  updateProductSize,
  deleteProductSize,
  searchSpecifications
} = require("../controllers/specController");

// --- Product Images Routes ---
router.post("/image", authenticateJWT, authorizeRole(["admin", "manager"]), createProductImage);
router.get("/image", getAllProductImages);
router.get("/image/product/:pro_id", getProductImagesByProductId);
router.get("/image/:id", getProductImageById);
router.put("/image/:id", authenticateJWT, authorizeRole(["admin", "manager"]), updateProductImage);
router.delete("/image/:id", authenticateJWT, authorizeRole(["admin", "manager"]), deleteProductImage);

// --- Product Colors Routes ---
router.post("/color", authenticateJWT, authorizeRole(["admin", "manager"]), createProductColor);
router.get("/color", getAllProductColors);
router.get("/color/:id", getProductColorById);
router.put("/color/:id", authenticateJWT, authorizeRole(["admin", "manager"]), updateProductColor);
router.delete("/color/:id", authenticateJWT, authorizeRole(["admin", "manager"]), deleteProductColor);

// --- Product Sizes Routes ---
router.post("/size", authenticateJWT, authorizeRole(["admin", "manager"]), createProductSize);
router.get("/size", getAllProductSizes);
router.get("/size/:id", getProductSizeById);
router.put("/size/:id", authenticateJWT, authorizeRole(["admin", "manager"]), updateProductSize);
router.delete("/size/:id", authenticateJWT, authorizeRole(["admin", "manager"]), deleteProductSize);

// --- Search Specifications Routes ---
router.get("/search", searchSpecifications);

module.exports = router;