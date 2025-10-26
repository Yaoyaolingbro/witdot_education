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
}, {
  timestamps: true,
});

// 索引
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('Project', projectSchema);
