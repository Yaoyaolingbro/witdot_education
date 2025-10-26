const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // 课程唯一标识符（用于匹配配置文件）
  courseId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gradeLevel: {
    type: String,
    enum: ['1-3', '4-6', '7-9'],
    required: true,
  },
  category: {
    type: String,
    enum: ['ai_literacy', 'canvas_coding'],
    required: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
  // 课程时长（分钟）
  duration: {
    type: Number,
    default: 0,
  },
  // 难度级别
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  // 学习目标
  objectives: [{
    type: String,
  }],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // 系统课程可以没有创建者
  },
  lessons: [{
    lessonId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    // 视频文件路径或 URL
    videoUrl: {
      type: String,
      default: null,
    },
    // PPT 文件路径
    pptUrl: {
      type: String,
      default: null,
    },
    // 章节时长（分钟）
    duration: {
      type: Number,
      default: 0,
    },
    quiz: {
      questions: [{
        question: String,
        type: {
          type: String,
          enum: ['choice', 'fill'],
        },
        options: [String],
        answer: String,
        points: Number,
      }],
    },
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// 索引
// courseId 已经通过 unique: true 创建了索引，不需要重复定义
courseSchema.index({ gradeLevel: 1, category: 1 });
courseSchema.index({ creatorId: 1 });

module.exports = mongoose.model('Course', courseSchema);
