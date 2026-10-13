// examRoutes.js - Proficiency Exam Routes
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { verifyToken } = require('../middlewares/auth');
const { examStartLimiter, examSubmitLimiter } = require('../middlewares/rateLimiter');

// All exam routes require user authentication
router.use(verifyToken);

router.get('/intro', examController.getExamIntro);
router.post('/start', examStartLimiter, examController.startExam);
router.get('/current', examController.getCurrentExam);
router.post('/save-progress', examController.saveProgress);
router.post('/submit', examSubmitLimiter, examController.submitExam);
router.get('/result/:id', examController.getExamResult);
router.get('/history', examController.getExamHistory);

module.exports = router;
