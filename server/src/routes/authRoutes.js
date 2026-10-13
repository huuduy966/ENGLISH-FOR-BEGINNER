const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const {
  loginEndpointLimiter,
  loginFailureLimiter,
  registerLimiter,
} = require('../middlewares/rateLimiter');

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginEndpointLimiter, loginFailureLimiter, authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
