const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { verifyToken } = require('../middlewares/auth');

// Placement test can be viewed publicly, but submission can link to user if logged in
router.get('/placement-test', testController.getPlacementTest);
router.post('/placement-test/submit', (req, res, next) => {
  // Optional auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}, testController.submitPlacementTest);

// Lesson Quiz submit requires token
router.post('/quiz/:lessonId/submit', verifyToken, testController.submitLessonQuiz);

module.exports = router;
