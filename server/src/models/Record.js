const mongoose = require('mongoose');

/**
 * 学习记录模型
 * 记录学生的课程学习进度、测验成绩等
 */
const recordSchema = new mongoose.Schema({
  // 学生 ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // 课程 ID
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // 进度百分比（0-100）
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // 已完成章节 ID 列表
  completedSections: [{
    type: mongoose.Schema.Types.ObjectId,
  }],

  // 当前学习章节 ID
  currentSectionId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  // 测验成绩
  quizScores: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    answers: [String], // 学生答案
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // 最后访问时间
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },

  // 总学习时长（秒）
  totalTimeSpent: {
    type: Number,
    default: 0,
  },

  // 学习时长记录（每次学习的时长）
  timeLogs: [{
    sectionId: mongoose.Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    duration: Number, // 秒
  }],

  // 是否完成整个课程
  isCompleted: {
    type: Boolean,
    default: false,
  },

  // 课程完成时间
  completedAt: Date,
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
});

// 创建复合索引
recordSchema.index({ userId: 1, courseId: 1 }, { unique: true });
recordSchema.index({ userId: 1, lastAccessedAt: -1 });

// 实例方法：更新进度百分比
recordSchema.methods.updateProgress = function() {
  const totalSections = this.completedSections.length;
  // 这里需要知道课程总章节数，暂时从已完成数计算
  // 实际应该从课程模型获取
  this.progress = totalSections > 0 ? Math.min(100, (totalSections / 10) * 100) : 0;
};

// 实例方法：标记章节完成
recordSchema.methods.markSectionComplete = function(sectionId) {
  if (!this.completedSections.includes(sectionId)) {
    this.completedSections.push(sectionId);
    this.lastAccessedAt = new Date();
  }
};

// 实例方法：添加学习时长
recordSchema.methods.addTimeLog = function(sectionId, startTime, endTime) {
  const duration = Math.floor((endTime - startTime) / 1000); // 转换为秒

  this.timeLogs.push({
    sectionId,
    startTime,
    endTime,
    duration,
  });

  this.totalTimeSpent += duration;
  this.lastAccessedAt = new Date();
};

module.exports = mongoose.model('Record', recordSchema);
