const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 公开路由（不需要认证）
router.post('/register', authController.register);
router.post('/login', authController.login);

// 受保护路由（需要认证）
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
