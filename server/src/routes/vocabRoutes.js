const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocabController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, vocabController.getVocabulary);
router.post('/:id/status', verifyToken, vocabController.updateVocabStatus);

module.exports = router;
