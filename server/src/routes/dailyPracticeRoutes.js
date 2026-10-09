const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getTodayPractice, submitAnswer } = require('../controllers/dailyPracticeController');

router.use(verifyToken);

router.get('/today', getTodayPractice);
router.post('/answer', submitAnswer);

module.exports = router;
