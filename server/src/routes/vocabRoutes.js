const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocabController');
const { verifyToken } = require('../middlewares/auth');
const {
  dictionaryLookupLimiter,
  translationLimiter,
} = require('../middlewares/rateLimiter');

router.get('/', verifyToken, vocabController.getVocabulary);
router.get('/suggest', dictionaryLookupLimiter, vocabController.suggestVocabulary);
router.get('/topics', dictionaryLookupLimiter, vocabController.getTopicVocabulary);
router.post('/translate', translationLimiter, vocabController.translateText);
router.get('/lookup/:word', dictionaryLookupLimiter, vocabController.lookupDictionary);
router.get('/wordnet/:word', dictionaryLookupLimiter, vocabController.getWordNetRelations);
router.post('/save-custom', verifyToken, vocabController.saveCustomVocabulary);
router.post('/:id/status', verifyToken, vocabController.updateVocabStatus);

module.exports = router;
