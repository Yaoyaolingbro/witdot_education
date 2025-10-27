const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['imageRecognition', 'voiceAssistant', 'robot'],
    required: true,
  },
  blocksJson: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null,
  },
  // 分享功能
  isPublic: {
    type: Boolean,
    default: false, // 是否公开
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true, // 允许多个 null 值
  },
  shareCount: {
    type: Number,
    default: 0, // 分享次数统计
  },
}, {
  timestamps: true,
});

// 索引
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ isTemplate: 1 });

// 实例方法：生成分享链接
projectSchema.methods.generateShareToken = function() {
  // 生成一个随机的分享 token
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(16).toString('hex');
  this.isPublic = true;
  return this.save();
};

// 实例方法：取消分享
projectSchema.methods.revokeShare = function() {
  this.isPublic = false;
  this.shareToken = null;
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);
