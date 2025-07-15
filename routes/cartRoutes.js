const express = require("express");
const router = express.Router();
const { authenticateJWT, authorizeRole } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// Create a new cart item (User for own cart, Admin/Manager)
router.post("/", authenticateJWT, cartController.createCartItem);

// Get all cart items (Admin/Manager or own carts for User)
router.get("/", authenticateJWT, cartController.getAllCartItems);

// Get a single cart item by ID (Admin/Manager or own cart for User)
router.get("/:id", authenticateJWT, cartController.getCartItemById);

// Update a cart item (Admin/Manager or own cart for User)
router.put("/:id", authenticateJWT, cartController.updateCartItem);

// Delete a cart item (Admin/Manager or own cart for User)
router.delete("/:id", authenticateJWT, cartController.deleteCartItem);

module.exports = router;
