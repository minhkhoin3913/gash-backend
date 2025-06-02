const express = require("express");
const router = express.Router();
const OrderDetails = require("../models/OrderDetails");
const Orders = require("../models/Orders");
const ProductVariants = require("../models/ProductVariants");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Create a new order detail (User for own order, Admin/Manager)
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { order_id, variant_id, UnitPrice, Quantity, feedback_details } =
      req.body;

    const order = await Orders.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      order.acc_id.toString() !== req.user.id
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        orderAccId: order.acc_id.toString(),
      });
      return res
        .status(403)
        .json({
          message: "Access denied: Can only create order detail for own order",
        });
    }

    const variant = await ProductVariants.findById(variant_id);
    if (!variant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    const orderDetail = new OrderDetails({
      order_id,
      variant_id,
      UnitPrice,
      Quantity,
      feedback_details,
    });

    const savedOrderDetail = await orderDetail.save();
    res.status(201).json({
      message: "Order detail created successfully",
      orderDetail: savedOrderDetail,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order detail", error: error.message });
  }
});

// Get all order details (Admin/Manager or own order details for User)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    let orderDetails;
    if (req.user.role === "admin" || req.user.role === "manager") {
      orderDetails = await OrderDetails.find()
        .populate("order_id", "orderDate username totalPrice")
        .populate("variant_id", "pro_id color_id size_id");
    } else {
      const userOrders = await Orders.find({ acc_id: req.user.id }).select(
        "_id"
      );
      const orderIds = userOrders.map((order) => order._id);
      orderDetails = await OrderDetails.find({ order_id: { $in: orderIds } })
        .populate("order_id", "orderDate username totalPrice")
        .populate("variant_id", "pro_id color_id size_id");
    }
    res.status(200).json(orderDetails);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error retrieving order details",
        error: error.message,
      });
  }
});

// Get a single order detail by ID (Admin/Manager or own order detail for User)
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findById(req.params.id).populate(
      "order_id",
      "orderDate username totalPrice acc_id"
    );
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      orderDetail.order_id.acc_id._id.toString() !== req.user.id
    ) {
      console.log("Access denied:", {
        userId: req.user.id,
        orderAccId: orderDetail.order_id.acc_id._id.toString(),
      });
      return res
        .status(403)
        .json({ message: "Access denied: Can only view own order detail" });
    }
    res.status(200).json(orderDetail);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving order detail", error: error.message });
  }
});

// Update an order detail (Admin/Manager or own order detail for User)
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findById(req.params.id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      const order = await Orders.findById(orderDetail.order_id);
      if (order.acc_id.toString() !== req.user.id) {
        console.log("Access denied:", {
          userId: req.user.id,
          orderAccId: order.acc_id.toString(),
        });
        return res
          .status(403)
          .json({ message: "Access denied: Can only update own order detail" });
      }
    }

    const { order_id, variant_id, ...updateData } = req.body;
    if (order_id) {
      const order = await Orders.findById(order_id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
    }
    if (variant_id) {
      const variant = await ProductVariants.findById(variant_id);
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
    }

    const updatedOrderDetail = await OrderDetails.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        ...(order_id && { order_id }),
        ...(variant_id && { variant_id }),
      },
      { new: true, runValidators: true }
    )
      .populate("order_id", "orderDate username totalPrice")
      .populate("variant_id", "pro_id color_id size_id");

    res.status(200).json({
      message: "Order detail updated successfully",
      orderDetail: updatedOrderDetail,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order detail", error: error.message });
  }
});

// Delete an order detail (Admin/Manager or own order detail for User)
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findById(req.params.id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      const order = await Orders.findById(orderDetail.order_id);
      if (order.acc_id.toString() !== req.user.id) {
        console.log("Access denied:", {
          userId: req.user.id,
          orderAccId: order.acc_id.toString(),
        });
        return res
          .status(403)
          .json({ message: "Access denied: Can only delete own order detail" });
      }
    }
    await OrderDetails.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order detail deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting order detail", error: error.message });
  }
});

module.exports = router;
