const express = require("express");
const router = express.Router();
const { authenticateJWT, authorizeRole } = require("../middleware/authMiddleware");
const orderDetailController = require("../controllers/orderDetailController");

// Advanced search/filter for order details with feedback
router.get('/search', authenticateJWT, orderDetailController.searchOrderDetails);

// Create a new order detail
router.post("/", authenticateJWT, orderDetailController.createOrderDetail);

// Get all order details
router.get("/", authenticateJWT, orderDetailController.getAllOrderDetails);

// Get a single order detail by ID
router.get("/:id", authenticateJWT, orderDetailController.getOrderDetailById);

// Update an order detail
router.put("/:id", authenticateJWT, orderDetailController.updateOrderDetail);

// Delete an order detail
router.delete("/:id", authenticateJWT, orderDetailController.deleteOrderDetail);

// Get all order details for a product with non-empty feedback
router.get("/product/:pro_id", orderDetailController.getOrderDetailsByProduct);

module.exports = router;