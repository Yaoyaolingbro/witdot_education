const mongoose = require('mongoose');

/**
 * AI 对话历史模型
 * 保存学生与 AI 助教的对话记录
 */
const conversationSchema = new mongoose.Schema({
  // 用户 ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // 对话类型
  type: {
    type: String,
    enum: ['global', 'course', 'lesson'], // 全局助教、课程助教、章节助教
    default: 'global',
  },

  // 关联的课程 ID（课程/章节助教）
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },

  // 关联的章节 ID（章节助教）
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  // 对话标题（自动生成或用户设置）
  title: {
    type: String,
    default: '新对话',
  },

  // 对话消息列表
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // 消息元数据（可选）
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  }],

  // 对话上下文（用于保持连续性）
  context: {
    courseContent: String,      // 课程内容摘要
    sectionTitle: String,       // 章节标题
    lastTopic: String,          // 最后讨论的主题
  },

  // 是否归档
  isArchived: {
    type: Boolean,
    default: false,
  },

  // 最后活跃时间
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },

  // 消息总数（便于统计）
  messageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// 创建索引
conversationSchema.index({ userId: 1, lastActiveAt: -1 });
conversationSchema.index({ userId: 1, courseId: 1 });
conversationSchema.index({ userId: 1, type: 1 });

// 实例方法：添加消息
conversationSchema.methods.addMessage = function(role, content, metadata = null) {
  this.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date(),
  });
  this.messageCount = this.messages.length;
  this.lastActiveAt = new Date();

  // 自动生成标题（如果是新对话）
  if (this.title === '新对话' && this.messages.length === 2) {
    // 使用第一条用户消息的前20个字符作为标题
    const firstUserMessage = this.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      this.title = firstUserMessage.content.slice(0, 20) + '...';
    }
  }

  return this.save();
};

// 实例方法：归档对话
conversationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// 静态方法：获取用户最近的对话
conversationSchema.statics.getRecentConversations = function(userId, limit = 10) {
  return this.find({
    userId,
    isArchived: false,
  })
    .sort({ lastActiveAt: -1 })
    .limit(limit)
    .select('title type courseId sectionId lastActiveAt messageCount');
};

// 静态方法：获取课程相关的对话
conversationSchema.statics.getCourseConversations = function(userId, courseId) {
  return this.find({
    userId,
    courseId,
    isArchived: false,
  })
    .sort({ lastActiveAt: -1 });
};

// 自动更新 lastActiveAt
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActiveAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
