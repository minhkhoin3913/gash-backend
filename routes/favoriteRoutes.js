const express = require('express');
const router = express.Router();
const Favorites = require('../models/Favorites');
const { authenticateJWT } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Add a product to favorites (Authenticated user)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { pro_id } = req.body;
    const acc_id = req.user.id; // Get account ID from JWT payload

    if (!pro_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!mongoose.isValidObjectId(pro_id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const existingFavorite = await Favorites.findOne({ acc_id, pro_id });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Product already in favorites' });
    }

    const favorite = new Favorites({ acc_id, pro_id });
    const savedFavorite = await favorite.save();
    res.status(201).json({
      message: 'Product added to favorites successfully',
      favorite: savedFavorite
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

// Get all favorites for an account (Authenticated user)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const acc_id = req.user.id; // Get account ID from JWT payload
    const favorites = await Favorites.find({ acc_id }).populate('pro_id');
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving favorites', error: error.message });
  }
});

// Delete a favorite product (Authenticated user)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid favorite ID' });
    }

    const acc_id = req.user.id; // Get account ID from JWT payload
    const favorite = await Favorites.findOneAndDelete({ _id: req.params.id, acc_id });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found or not authorized' });
    }

    res.status(200).json({ message: 'Product removed from favorites successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

module.exports = router;