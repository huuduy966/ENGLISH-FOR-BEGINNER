const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, dashboardController.getDashboard);
router.get('/progress/stats', verifyToken, dashboardController.getProgressStats);

module.exports = router;
