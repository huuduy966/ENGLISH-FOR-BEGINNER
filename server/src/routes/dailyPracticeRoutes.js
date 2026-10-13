const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getTodayPractice, submitAnswer, updatePracticeProgress } = require('../controllers/dailyPracticeController');
const { dailyPracticeAnswerLimiter } = require('../middlewares/rateLimiter');

router.use(verifyToken);

router.get('/today', getTodayPractice);
router.post('/answer', dailyPracticeAnswerLimiter, submitAnswer);
router.post('/progress', updatePracticeProgress);

module.exports = router;
