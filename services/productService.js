const Products = require("../models/Products");
const Categories = require("../models/Categories");
const mongoose = require("mongoose");

async function createProductService({ pro_name, pro_price, imageURL, description, cat_id, status_product }) {
  if (!mongoose.isValidObjectId(cat_id)) {
    const err = new Error("Invalid category ID");
    err.status = 400;
    throw err;
  }
  const category = await Categories.findById(cat_id);
  if (!category) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }
  const product = new Products({
    pro_name,
    pro_price,
    imageURL: imageURL || "https://external-preview.redd.it/r6g38aXSaQWtd1KxwJbQ-Fs5jtSVDxX3wtLHJEdqixw.jpg?width=1080&crop=smart&auto=webp&s=87a2c94cb3e1561e2b6abd467ea68d81b9901720",
    description,
    cat_id,
    status_product: status_product || "active"
  });
  return await product.save();
}

async function getAllProductsService() {
  return await Products.find().populate("cat_id", "cat_name");
}

async function searchProductsService(queryParams) {
  const {
    q,
    cat_id,
    status_product,
    minPrice,
    maxPrice,
    hasImage,
    dateFrom,
    dateTo
  } = queryParams;
  let query = {};
  if (cat_id) {
    if (!mongoose.isValidObjectId(cat_id)) {
      const err = new Error("Invalid category ID");
      err.status = 400;
      throw err;
    }
    query.cat_id = new mongoose.Types.ObjectId(cat_id);
  }
  if (status_product) {
    query.status_product = status_product;
  }
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
  if (hasImage === 'true') {
    query.imageURL = { $exists: true, $ne: null, $ne: "" };
  } else if (hasImage === 'false') {
    query.$or = [
      { imageURL: { $exists: false } },
      { imageURL: null },
      { imageURL: "" }
    ];
  }
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
  if (q && typeof q === 'string' && q.trim() !== '') {
    const trimmedQuery = q.trim();
    query.$or = [
      { pro_name: { $regex: trimmedQuery, $options: 'i' } },
      { description: { $regex: trimmedQuery, $options: 'i' } },
      { status_product: { $regex: trimmedQuery, $options: 'i' } }
    ];
    if (mongoose.isValidObjectId(trimmedQuery)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(trimmedQuery) });
    }
    if (!isNaN(parseFloat(trimmedQuery))) {
      const priceValue = parseFloat(trimmedQuery);
      query.$or.push({ pro_price: priceValue });
    }
  }
  return await Products.find(query)
    .populate("cat_id", "cat_name")
    .sort({ pro_name: 1 });
}

async function getProductByIdService(id) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid product ID");
    err.status = 400;
    throw err;
  }
  const product = await Products.findById(id).populate("cat_id", "cat_name");
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return product;
}

async function updateProductService(id, updateData) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid product ID");
    err.status = 400;
    throw err;
  }
  const { cat_id, ...rest } = updateData;
  if (cat_id) {
    if (!mongoose.isValidObjectId(cat_id)) {
      const err = new Error("Invalid category ID");
      err.status = 400;
      throw err;
    }
    const category = await Categories.findById(cat_id);
    if (!category) {
      const err = new Error("Category not found");
      err.status = 404;
      throw err;
    }
  }
  const product = await Products.findByIdAndUpdate(
    id,
    { ...rest, ...(cat_id && { cat_id }) },
    { new: true, runValidators: true }
  ).populate("cat_id", "cat_name");
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return product;
}

async function deleteProductService(id, user) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error("Invalid product ID");
    err.status = 400;
    throw err;
  }
  const product = await Products.findByIdAndDelete(id);
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }
  return { message: "Product deleted successfully" };
}

module.exports = {
  createProductService,
  getAllProductsService,
  searchProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
}; 