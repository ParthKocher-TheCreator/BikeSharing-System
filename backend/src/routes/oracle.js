const express = require('express');
const router = express.Router();

// GET /api/oracle/status - Get oracle service status
router.get('/status', async (req, res, next) => {
  try {
    const blockchainService = req.app.locals.blockchainService;
    const isHealthy = await blockchainService.isHealthy();
    
    res.json({
      status: 'OK',
      blockchain: isHealthy ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/oracle/update-location - Update bike location
router.post('/update-location', async (req, res, next) => {
  try {
    res.json({ message: 'Update bike location - Coming Soon' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;