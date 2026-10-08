const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, lessonController.getLessons);
router.get('/:id', verifyToken, lessonController.getLessonById);
router.post('/:id/complete', verifyToken, lessonController.completeLesson);

module.exports = router;
