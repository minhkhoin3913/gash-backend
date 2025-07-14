const express = require("express");
const router = express.Router();
const OrderDetails = require("../models/OrderDetails");
const Orders = require("../models/Orders");
const ProductVariants = require("../models/ProductVariants");
const Accounts = require("../models/Accounts");
const { authenticateJWT, authorizeRole } = require("../middleware/authMiddleware");

// Validate date string
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Advanced search/filter for order details with feedback
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const {
      order_id,
      variant_id,
      pro_id,
      color_id,
      size_id,
      username,
      startDate,
      endDate,
      feedback,
      q
    } = req.query;
    const query = {
      feedback_details: { $nin: ['None', '', null] },
    };

    // Role-based access
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      // Only feedbacks for user's own orders
      const userOrders = await Orders.find({ acc_id: req.user.id }).select('_id');
      const userOrderIds = userOrders.map(order => order._id);
      query.order_id = { $in: userOrderIds };
    }

    // Filter by order_id
    if (order_id) {
      query.order_id = order_id;
    }

    // Filter by variant_id
    if (variant_id) {
      query.variant_id = variant_id;
    }

    // Filter by product/color/size via variant
    if (pro_id || color_id || size_id) {
      const variantQuery = {};
      if (pro_id) variantQuery.pro_id = pro_id;
      if (color_id) variantQuery.color_id = color_id;
      if (size_id) variantQuery.size_id = size_id;
      const variants = await ProductVariants.find(variantQuery).select('_id');
      const variantIds = variants.map(v => v._id);
      query.variant_id = { $in: variantIds };
    }

    // Filter by username (account)
    if (username) {
      const user = await Accounts.findOne({ username }).select('_id');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const userOrders = await Orders.find({ acc_id: user._id }).select('_id');
      const userOrderIds = userOrders.map(order => order._id);
      query.order_id = query.order_id
        ? { $in: userOrderIds.filter(id => query.order_id.$in ? query.order_id.$in.includes(id) : id === query.order_id) }
        : { $in: userOrderIds };
    }

    // Date range filter (orderDate)
    if (startDate || endDate) {
      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) {
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateQuery.$lte = toDate;
      }
      const orders = await Orders.find({ orderDate: dateQuery }).select('_id');
      const orderIds = orders.map(order => order._id);
      query.order_id = query.order_id
        ? { $in: orderIds.filter(id => query.order_id.$in ? query.order_id.$in.includes(id) : id === query.order_id) }
        : { $in: orderIds };
    }

    // Feedback text filter
    if (feedback) {
      query.feedback_details = { $regex: feedback, $options: 'i' };
    }

    // General search (q)
    if (q && typeof q === 'string' && q.trim() !== '') {
      const trimmedQuery = q.trim();
      query.$or = [
        { feedback_details: { $regex: trimmedQuery, $options: 'i' } },
      ];
    }

    // Find and populate
    const orderDetails = await OrderDetails.find(query)
      .populate({
        path: 'order_id',
        select: 'orderDate totalPrice acc_id',
        populate: { path: 'acc_id', select: 'username' },
      })
      .populate({
        path: 'variant_id',
        select: 'pro_id color_id size_id',
        populate: [
          { path: 'pro_id', select: 'pro_name' },
          { path: 'color_id', select: 'color_name' },
          { path: 'size_id', select: 'size_name' },
        ],
      });
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error searching feedbacks', error: error.message });
  }
});

// Create a new order detail
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { order_id, variant_id, UnitPrice, Quantity, feedback_details } = req.body;

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

// Get all order details
router.get("/", authenticateJWT, async (req, res) => {
  try {
    let orderDetails;
    if (req.user.role === "admin" || req.user.role === "manager") {
      orderDetails = await OrderDetails.find()
        .populate({
          path: "order_id",
          select: "orderDate totalPrice",
          populate: {
            path: "acc_id",
            select: "username",
          },
        })
        .populate({
          path: "variant_id",
          select: "pro_id color_id size_id",
          populate: [
            { path: "pro_id", select: "pro_name" },
            { path: "color_id", select: "color_name" },
            { path: "size_id", select: "size_name" },
          ],
        });
    } else {
      const userOrders = await Orders.find({ acc_id: req.user.id }).select("_id");
      const orderIds = userOrders.map((order) => order._id);
      orderDetails = await OrderDetails.find({ order_id: { $in: orderIds } })
        .populate({
          path: "order_id",
          select: "orderDate totalPrice",
          populate: {
            path: "acc_id",
            select: "username",
          },
        })
        .populate({
          path: "variant_id",
          select: "pro_id color_id size_id",
          populate: [
            { path: "pro_id", select: "pro_name" },
            { path: "color_id", select: "color_name" },
            { path: "size_id", select: "size_name" },
          ],
        });
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

// Get a single order detail by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const orderDetail = await OrderDetails.findById(req.params.id)
      .populate({
        path: "order_id",
        select: "orderDate totalPrice acc_id",
        populate: {
          path: "acc_id",
          select: "username",
        },
      })
      .populate({
        path: "variant_id",
        select: "pro_id color_id size_id",
        populate: [
          { path: "pro_id", select: "pro_name" },
          { path: "color_id", select: "color_name" },
          { path: "size_id", select: "size_name" },
        ],
      });
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

// Update an order detail
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
      .populate({
        path: "order_id",
        select: "orderDate totalPrice",
        populate: {
          path: "acc_id",
          select: "username",
        },
      })
      .populate({
        path: "variant_id",
        select: "pro_id color_id size_id",
        populate: [
          { path: "pro_id", select: "pro_name" },
          { path: "color_id", select: "color_name" },
          { path: "size_id", select: "size_name" },
        ],
      });

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

// Delete an order detail
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

// Get all order details for a product with non-empty feedback
router.get("/product/:pro_id", async (req, res) => {
  try {
    const { pro_id } = req.params;

    // Find variants for the product
    const variants = await ProductVariants.find({ pro_id }).select("_id");
    const variantIds = variants.map(variant => variant._id);

    // Find order details with non-empty feedback
    const orderDetails = await OrderDetails.find({
      variant_id: { $in: variantIds },
      feedback_details: { $nin: ["None", "", null] },
    })
      .populate({
        path: "order_id",
        select: "orderDate totalPrice",
        populate: {
          path: "acc_id",
          select: "username",
        },
      })
      .populate({
        path: "variant_id",
        select: "pro_id color_id size_id",
        populate: [
          { path: "pro_id", select: "pro_name" },
          { path: "color_id", select: "color_name" },
          { path: "size_id", select: "size_name" },
        ],
      });

    if (!orderDetails.length) {
      return res.status(404).json({ message: "No feedback found for this product" });
    }

    res.status(200).json(orderDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving product feedback", error: error.message });
  }
});

module.exports = router;