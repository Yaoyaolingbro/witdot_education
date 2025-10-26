const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const auth = require('../middleware/auth');

/**
 * 学习记录路由
 * 所有路由都需要认证
 */

// 获取所有学习记录
router.get('/', auth, recordController.getAllRecords);

// 获取学习统计
router.get('/stats', auth, recordController.getStudyStats);

// 获取指定课程的学习进度
router.get('/:courseId', auth, recordController.getCourseProgress);

// 标记章节完成
router.post('/:courseId/complete', auth, recordController.markSectionComplete);

// 记录学习时长
router.post('/:courseId/time', auth, recordController.recordStudyTime);

// 提交测验答案
router.post('/:courseId/quiz', auth, recordController.submitQuiz);

module.exports = router;
