const specService = require('../services/specService');

// --- Product Images ---
exports.createProductImage = async (req, res) => {
  try {
    const savedImage = await specService.createProductImageService(req.body);
    res.status(201).json({ message: 'Product image created successfully', image: savedImage });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating product image' });
  }
};
exports.getAllProductImages = async (req, res) => {
  try {
    const images = await specService.getAllProductImagesService();
    res.status(200).json(images);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product images' });
  }
};
exports.getProductImagesByProductId = async (req, res) => {
  try {
    const images = await specService.getProductImagesByProductIdService(req.params.pro_id);
    res.status(200).json(images);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product images' });
  }
};
exports.getProductImageById = async (req, res) => {
  try {
    const image = await specService.getProductImageByIdService(req.params.id);
    res.status(200).json(image);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product image' });
  }
};
exports.updateProductImage = async (req, res) => {
  try {
    const image = await specService.updateProductImageService(req.params.id, req.body);
    res.status(200).json({ message: 'Product image updated successfully', image });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating product image' });
  }
};
exports.deleteProductImage = async (req, res) => {
  try {
    const result = await specService.deleteProductImageService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting product image' });
  }
};

// --- Product Colors ---
exports.createProductColor = async (req, res) => {
  try {
    const savedColor = await specService.createProductColorService(req.body);
    res.status(201).json({ message: 'Product color created successfully', color: savedColor });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating product color' });
  }
};
exports.getAllProductColors = async (req, res) => {
  try {
    const colors = await specService.getAllProductColorsService();
    res.status(200).json(colors);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product colors' });
  }
};
exports.getProductColorById = async (req, res) => {
  try {
    const color = await specService.getProductColorByIdService(req.params.id);
    res.status(200).json(color);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product color' });
  }
};
exports.updateProductColor = async (req, res) => {
  try {
    const color = await specService.updateProductColorService(req.params.id, req.body);
    res.status(200).json({ message: 'Product color updated successfully', color });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating product color' });
  }
};
exports.deleteProductColor = async (req, res) => {
  try {
    const result = await specService.deleteProductColorService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting product color' });
  }
};

// --- Product Sizes ---
exports.createProductSize = async (req, res) => {
  try {
    const savedSize = await specService.createProductSizeService(req.body);
    res.status(201).json({ message: 'Product size created successfully', size: savedSize });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating product size' });
  }
};
exports.getAllProductSizes = async (req, res) => {
  try {
    const sizes = await specService.getAllProductSizesService();
    res.status(200).json(sizes);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product sizes' });
  }
};
exports.getProductSizeById = async (req, res) => {
  try {
    const size = await specService.getProductSizeByIdService(req.params.id);
    res.status(200).json(size);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product size' });
  }
};
exports.updateProductSize = async (req, res) => {
  try {
    const size = await specService.updateProductSizeService(req.params.id, req.body);
    res.status(200).json({ message: 'Product size updated successfully', size });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating product size' });
  }
};
exports.deleteProductSize = async (req, res) => {
  try {
    const result = await specService.deleteProductSizeService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting product size' });
  }
};

// --- Search Specifications ---
exports.searchSpecifications = async (req, res) => {
  try {
    const results = await specService.searchSpecificationsService(req.query);
    res.status(200).json(results);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error searching specifications' });
  }
}; 