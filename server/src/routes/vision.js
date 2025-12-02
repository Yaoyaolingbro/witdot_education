const express = require('express');
const router = express.Router();
const visionController = require('../controllers/visionController');
const auth = require('../middleware/auth');

/**
 * Vision API 路由
 * 所有路由都需要 JWT 认证
 */

// 图像识别相关接口
router.post('/recognize', auth, visionController.recognizeObject);
router.post('/recognize-scene', auth, visionController.recognizeScene);
router.post('/recognize-text', auth, visionController.recognizeText);

// AI 生图相关接口
router.post('/generate', auth, visionController.generateImage);
router.post('/enhance-prompt', auth, visionController.enhancePrompt);

// 工具接口
router.get('/supported-sizes', auth, visionController.getSupportedSizes);

module.exports = router;
