const Course = require('../models/Course');
const fs = require('fs').promises;
const path = require('path');

// 从配置文件加载课程数据
const loadCourseFromConfig = async (configFileName) => {
  try {
    const configPath = path.join(__dirname, '../../data/courses', configFileName);
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error loading course config ${configFileName}:`, error);
    return null;
  }
};

// 同步课程数据到数据库
const syncCoursesToDB = async () => {
  try {
    const indexPath = path.join(__dirname, '../../data/courses/index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const { courses } = JSON.parse(indexData);

    for (const courseRef of courses) {
      if (!courseRef.enabled) continue;

      const courseData = await loadCourseFromConfig(courseRef.configFile);
      if (!courseData) continue;

      // 使用 upsert 更新或插入课程
      await Course.findOneAndUpdate(
        { courseId: courseData.courseId },
        courseData,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Courses synced to database successfully');
  } catch (error) {
    console.error('❌ Error syncing courses to database:', error);
  }
};

// 获取所有课程列表
const getAllCourses = async (req, res) => {
  try {
    const { gradeLevel, category, isPublished } = req.query;

    const filter = {};
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const courses = await Course.find(filter)
      .select('-lessons') // 列表不返回详细章节信息
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败',
      error: error.message,
    });
  }
};

// 获取课程详情（包含所有章节）
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: '获取课程详情失败',
      error: error.message,
    });
  }
};

// 获取特定章节详情
const getLessonById = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在',
      });
    }

    const lesson = course.lessons.find(l => l.lessonId === lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: '章节不存在',
      });
    }

    res.json({
      success: true,
      data: {
        course: {
          courseId: course.courseId,
          title: course.title,
          coverImage: course.coverImage,
        },
        lesson,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: '获取章节详情失败',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getLessonById,
  syncCoursesToDB,
};
