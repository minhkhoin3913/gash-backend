const ProductVariants = require("../models/ProductVariants");
const Products = require("../models/Products");
const ProductColors = require("../models/ProductColors");
const ProductSizes = require("../models/ProductSizes");
const ProductImages = require("../models/ProductImages");
const mongoose = require("mongoose");

async function createVariantService({ pro_id, color_id, size_id, image_id }) {
  if (
    !mongoose.isValidObjectId(pro_id) ||
    !mongoose.isValidObjectId(color_id) ||
    !mongoose.isValidObjectId(size_id) ||
    (image_id && !mongoose.isValidObjectId(image_id))
  ) {
    const err = new Error("Invalid product, color, size, or image ID");
    err.status = 400;
    throw err;
  }
  const [product, color, size, image] = await Promise.all([
    Products.findById(pro_id),
    ProductColors.findById(color_id),
    ProductSizes.findById(size_id),
    image_id ? ProductImages.findById(image_id) : Promise.resolve(null),
  ]);
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  if (!color) {
    const err = new Error("Color not found");
    err.status = 404;
    throw err;
  }
  if (!size) {
    const err = new Error("Size not found");
    err.status = 404;
    throw err;
  }
  if (image_id && !image) {
    const err = new Error("Image not found");
    err.status = 404;
    throw err;
  }
  const variant = new ProductVariants({ pro_id, color_id, size_id, image_id });
  return await variant.save();
}

async function getVariantsService(query) {
  const { pro_id, color_id, size_id } = query;
  const q = {};
  if (pro_id) {
    if (!mongoose.isValidObjectId(pro_id)) {
      const err = new Error("Invalid product ID");
      err.status = 400;
      throw err;
    }
    q.pro_id = new mongoose.Types.ObjectId(pro_id);
  }
  if (color_id) {
    if (!mongoose.isValidObjectId(color_id)) {
      const err = new Error("Invalid color ID");
      err.status = 400;
      throw err;
    }
    q.color_id = new mongoose.Types.ObjectId(color_id);
  }
  if (size_id) {
    if (!mongoose.isValidObjectId(size_id)) {
      const err = new Error("Invalid size ID");
      err.status = 400;
      throw err;
    }
    q.size_id = new mongoose.Types.ObjectId(size_id);
  }
  return await ProductVariants.find(q)
    .populate("pro_id", "pro_name")
    .populate("color_id", "color_name")
    .populate("size_id", "size_name")
    .populate("image_id", "imageURL");
}

async function getVariantByIdService(id) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid variant ID');
    err.status = 400;
    throw err;
  }
  const variant = await ProductVariants.findById(new mongoose.Types.ObjectId(id))
    .populate('pro_id', 'pro_name')
    .populate('color_id', 'color_name')
    .populate('size_id', 'size_name')
    .populate('image_id', 'imageURL');
  if (!variant) {
    const err = new Error('Product variant not found');
    err.status = 404;
    throw err;
  }
  return variant;
}

async function updateVariantService(id, { pro_id, color_id, size_id, image_id }) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid variant ID");
    err.status = 400;
    throw err;
  }
  if (pro_id && !mongoose.isValidObjectId(pro_id)) {
    const err = new Error("Invalid product ID");
    err.status = 400;
    throw err;
  }
  if (color_id && !mongoose.isValidObjectId(color_id)) {
    const err = new Error("Invalid color ID");
    err.status = 400;
    throw err;
  }
  if (size_id && !mongoose.isValidObjectId(size_id)) {
    const err = new Error("Invalid size ID");
    err.status = 400;
    throw err;
  }
  if (image_id && !mongoose.isValidObjectId(image_id)) {
    const err = new Error("Invalid image ID");
    err.status = 400;
    throw err;
  }
  if (pro_id) {
    const product = await Products.findById(pro_id);
    if (!product) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
  }
  if (color_id) {
    const color = await ProductColors.findById(color_id);
    if (!color) {
      const err = new Error("Color not found");
      err.status = 404;
      throw err;
    }
  }
  if (size_id) {
    const size = await ProductSizes.findById(size_id);
    if (!size) {
      const err = new Error("Size not found");
      err.status = 404;
      throw err;
    }
  }
  if (image_id) {
    const image = await ProductImages.findById(image_id);
    if (!image) {
      const err = new Error("Image not found");
      err.status = 404;
      throw err;
    }
  }
  const variant = await ProductVariants.findByIdAndUpdate(
    id,
    {
      ...(pro_id && { pro_id }),
      ...(color_id && { color_id }),
      ...(size_id && { size_id }),
      ...(image_id && { image_id }),
    },
    { new: true, runValidators: true }
  )
    .populate("pro_id", "pro_name")
    .populate("color_id", "color_name")
    .populate("size_id", "size_name")
    .populate("image_id", "imageURL");
  if (!variant) {
    const err = new Error("Product variant not found");
    err.status = 404;
    throw err;
  }
  return variant;
}

async function deleteVariantService(id, user) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid variant ID");
    err.status = 400;
    throw err;
  }
  const variant = await ProductVariants.findByIdAndDelete(id);
  if (!variant) {
    const err = new Error("Product variant not found");
    err.status = 404;
    throw err;
  }
  return { message: "Product variant deleted successfully" };
}

module.exports = {
  createVariantService,
  getVariantsService,
  getVariantByIdService,
  updateVariantService,
  deleteVariantService
}; 