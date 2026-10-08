const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

// All admin routes require verifyToken AND requireAdmin
router.use(verifyToken, requireAdmin);

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);

router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

router.post('/vocabulary', adminController.createVocabulary);
router.delete('/vocabulary/:id', adminController.deleteVocabulary);

module.exports = router;
