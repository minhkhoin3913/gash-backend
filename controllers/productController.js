const productService = require("../services/productService");

exports.createProduct = async (req, res) => {
  try {
    const savedProduct = await productService.createProductService(req.body);
    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error creating product" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProductsService();
    res.status(200).json(products);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error retrieving products" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProductsService(req.query);
    res.status(200).json(products);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error searching products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductByIdService(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error retrieving product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProductService(req.params.id, req.body);
    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProductService(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Error deleting product" });
  }
}; 