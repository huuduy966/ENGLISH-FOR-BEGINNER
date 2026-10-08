const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocabController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, vocabController.getVocabulary);
router.get('/lookup/:word', vocabController.lookupDictionary);
router.get('/wordnet/:word', vocabController.getWordNetRelations);
router.post('/save-custom', verifyToken, vocabController.saveCustomVocabulary);
router.post('/:id/status', verifyToken, vocabController.updateVocabStatus);

module.exports = router;
