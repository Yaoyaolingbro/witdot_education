const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// 获取所有课程列表
// GET /api/courses?gradeLevel=4-6&category=ai_literacy&isPublished=true
router.get('/', courseController.getAllCourses);

// 获取课程详情
// GET /api/courses/:courseId
router.get('/:courseId', courseController.getCourseById);

// 获取特定章节详情
// GET /api/courses/:courseId/lessons/:lessonId
router.get('/:courseId/lessons/:lessonId', courseController.getLessonById);

module.exports = router;
