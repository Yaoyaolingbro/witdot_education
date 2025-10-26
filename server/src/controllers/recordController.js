const Record = require('../models/Record');
const Course = require('../models/Course');

/**
 * 获取用户的所有学习记录
 */
exports.getAllRecords = async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id })
      .populate('courseId', 'title coverImage gradeLevel')
      .sort({ lastAccessedAt: -1 });

    res.json(records);
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: '获取学习记录失败' });
  }
};

/**
 * 获取指定课程的学习进度
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    let record = await Record.findOne({
      userId: req.user.id,
      courseId,
    });

    // 如果没有记录，创建新记录
    if (!record) {
      record = await Record.create({
        userId: req.user.id,
        courseId,
      });
    }

    // 更新最后访问时间
    record.lastAccessedAt = new Date();
    await record.save();

    res.json(record);
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ error: '获取学习进度失败' });
  }
};

/**
 * 标记章节完成
 */
exports.markSectionComplete = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({ error: '请提供章节 ID' });
    }

    // 查找或创建学习记录
    let record = await Record.findOne({
      userId: req.user.id,
      courseId,
    });

    if (!record) {
      record = await Record.create({
        userId: req.user.id,
        courseId,
      });
    }

    // 标记章节完成
    record.markSectionComplete(sectionId);
    record.currentSectionId = sectionId;

    // 获取课程信息，计算进度
    const course = await Course.findById(courseId);
    if (course) {
      const totalSections = course.sections.length;
      const completedSections = record.completedSections.length;
      record.progress = Math.round((completedSections / totalSections) * 100);

      // 检查是否完成整个课程
      if (completedSections >= totalSections && !record.isCompleted) {
        record.isCompleted = true;
        record.completedAt = new Date();
      }
    }

    await record.save();

    res.json({
      message: '章节标记完成',
      record,
    });
  } catch (error) {
    console.error('Mark section complete error:', error);
    res.status(500).json({ error: '标记章节完成失败' });
  }
};

/**
 * 记录学习时长
 */
exports.recordStudyTime = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionId, startTime, endTime } = req.body;

    if (!sectionId || !startTime || !endTime) {
      return res.status(400).json({ error: '请提供完整的时长信息' });
    }

    // 查找或创建学习记录
    let record = await Record.findOne({
      userId: req.user.id,
      courseId,
    });

    if (!record) {
      record = await Record.create({
        userId: req.user.id,
        courseId,
      });
    }

    // 添加学习时长
    record.addTimeLog(
      sectionId,
      new Date(startTime),
      new Date(endTime)
    );

    await record.save();

    res.json({
      message: '学习时长已记录',
      totalTimeSpent: record.totalTimeSpent,
    });
  } catch (error) {
    console.error('Record study time error:', error);
    res.status(500).json({ error: '记录学习时长失败' });
  }
};

/**
 * 提交测验答案
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionId, answers } = req.body;

    if (!sectionId || !answers) {
      return res.status(400).json({ error: '请提供测验信息' });
    }

    // 获取课程和章节信息
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const section = course.sections.id(sectionId);
    if (!section || !section.quiz) {
      return res.status(404).json({ error: '章节或测验不存在' });
    }

    // 计算得分
    let score = 0;
    let totalPoints = 0;
    const quiz = section.quiz;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points || 1;
      if (answers[index] === question.answer) {
        score += question.points || 1;
      }
    });

    // 查找或创建学习记录
    let record = await Record.findOne({
      userId: req.user.id,
      courseId,
    });

    if (!record) {
      record = await Record.create({
        userId: req.user.id,
        courseId,
      });
    }

    // 添加测验成绩
    record.quizScores.push({
      sectionId,
      score,
      totalPoints,
      answers,
    });

    await record.save();

    res.json({
      message: '测验提交成功',
      score,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: '提交测验失败' });
  }
};

/**
 * 获取学习统计
 */
exports.getStudyStats = async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id });

    const stats = {
      totalCourses: records.length,
      completedCourses: records.filter(r => r.isCompleted).length,
      totalTimeSpent: records.reduce((sum, r) => sum + r.totalTimeSpent, 0),
      averageProgress: records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.progress, 0) / records.length)
        : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({ error: '获取学习统计失败' });
  }
};
