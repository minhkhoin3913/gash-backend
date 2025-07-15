const favoriteService = require('../services/favoriteService');

exports.addFavorite = async (req, res) => {
  try {
    const savedFavorite = await favoriteService.addFavoriteService(req.body.pro_id, req.user.id);
    res.status(201).json({
      message: 'Product added to favorites successfully',
      favorite: savedFavorite
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error adding to favorites' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteService.getFavoritesService(req.user.id);
    res.status(200).json(favorites);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving favorites' });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const result = await favoriteService.deleteFavoriteService(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error removing from favorites' });
  }
}; 