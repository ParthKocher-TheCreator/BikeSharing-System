const express = require('express');
const router = express.Router();

// GET /api/bikes - Get all available bikes
router.get('/', async (req, res, next) => {
  try {
    res.json({ message: 'Bikes route - Coming Soon' });
  } catch (error) {
    next(error);
  }
});

// GET /api/bikes/:id - Get specific bike
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json({ message: `Bike ${id} details - Coming Soon` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;