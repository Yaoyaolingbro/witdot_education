const mongoose = require('mongoose');

/**
 * Agent 模板模型
 * 用于存储预设的 Blockly Agent 模板（如图像识别助手）
 */
const templateSchema = new mongoose.Schema({
  // 模板名称
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // 模板描述
  description: {
    type: String,
    required: true,
  },

  // 分类
  category: {
    type: String,
    required: true,
    enum: ['imageRecognition', 'voiceAssistant', 'robot', 'general'],
  },

  // 预设的 Blockly JSON（工作区序列化数据）
  blocksJson: {
    type: String,
    required: true,
  },

  // 是否为固定流程（学生不可修改核心逻辑）
  isFixed: {
    type: Boolean,
    default: false,
  },

  // 可编辑字段列表（如提示词参数）
  editableFields: [{
    type: String,
  }],

  // Claude API 默认提示词
  prompt: {
    type: String,
    default: '',
  },

  // 封面图
  coverImage: {
    type: String,
    default: null,
  },

  // 使用次数（统计）
  usageCount: {
    type: Number,
    default: 0,
  },

  // 创建者 ID（教师）
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // 是否公开（可供所有学生使用）
  isPublic: {
    type: Boolean,
    default: true,
  },

  // 适合年级
  gradeLevel: {
    type: String,
    enum: ['1-3', '4-6', '7-9', 'all'],
    default: 'all',
  },

  // 难度级别
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },

  // 标签（用于搜索和筛选）
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// 创建索引
templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ creatorId: 1 });
templateSchema.index({ usageCount: -1 }); // 按使用次数降序

// 实例方法：增加使用次数
templateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// 静态方法：获取热门模板
templateSchema.statics.getPopularTemplates = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ usageCount: -1 })
    .limit(limit);
};

// 静态方法：根据分类获取模板
templateSchema.statics.getByCategory = function(category) {
  return this.find({ category, isPublic: true })
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Template', templateSchema);
