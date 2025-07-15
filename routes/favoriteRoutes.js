const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');
const {
  addFavorite,
  getFavorites,
  deleteFavorite
} = require('../controllers/favoriteController');

router.post('/', authenticateJWT, addFavorite);
router.get('/', authenticateJWT, getFavorites);
router.delete('/:id', authenticateJWT, deleteFavorite);

module.exports = router;