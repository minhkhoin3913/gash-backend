const variantService = require('../services/variantService');

exports.createVariant = async (req, res) => {
  try {
    const savedVariant = await variantService.createVariantService(req.body);
    res.status(201).json({
      message: 'Product variant created successfully',
      variant: savedVariant
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating product variant' });
  }
};

exports.getVariants = async (req, res) => {
  try {
    const variants = await variantService.getVariantsService(req.query);
    res.status(200).json(variants);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product variants' });
  }
};

exports.getVariantById = async (req, res) => {
  try {
    const variant = await variantService.getVariantByIdService(req.params.id);
    res.status(200).json(variant);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving product variant' });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    const variant = await variantService.updateVariantService(req.params.id, req.body);
    res.status(200).json({
      message: 'Product variant updated successfully',
      variant
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating product variant' });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const result = await variantService.deleteVariantService(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting product variant' });
  }
}; 