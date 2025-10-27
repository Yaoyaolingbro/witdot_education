const Conversation = require('../models/Conversation');
const Course = require('../models/Course');

/**
 * 创建新对话或获取现有对话
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { type, courseId, sectionId } = req.query;
    const userId = req.user.id;

    // 查找现有未归档的对话
    let conversation = await Conversation.findOne({
      userId,
      type: type || 'global',
      courseId: courseId || null,
      sectionId: sectionId || null,
      isArchived: false,
    }).sort({ lastActiveAt: -1 });

    // 如果不存在，创建新对话
    if (!conversation) {
      const conversationData = {
        userId,
        type: type || 'global',
      };

      if (courseId) {
        conversationData.courseId = courseId;

        // 获取课程信息用于上下文
        const course = await Course.findById(courseId);
        if (course) {
          conversationData.context = {
            courseContent: course.description,
          };
        }
      }

      if (sectionId) {
        conversationData.sectionId = sectionId;
      }

      conversation = await Conversation.create(conversationData);
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ error: '获取对话失败' });
  }
};

/**
 * 添加消息到对话
 */
exports.addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { role, content, metadata } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: '消息内容不完整' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }

    await conversation.addMessage(role, content, metadata);

    res.json({
      message: '消息已添加',
      conversation,
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: '添加消息失败' });
  }
};

/**
 * 获取对话历史
 */
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    }).populate('courseId', 'title');

    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: '获取对话历史失败' });
  }
};

/**
 * 获取用户的所有对话列表
 */
exports.getAllConversations = async (req, res) => {
  try {
    const { type, courseId } = req.query;
    const userId = req.user.id;

    let query = {
      userId,
      isArchived: false,
    };

    if (type) {
      query.type = type;
    }

    if (courseId) {
      query.courseId = courseId;
    }

    const conversations = await Conversation.find(query)
      .populate('courseId', 'title')
      .sort({ lastActiveAt: -1 })
      .select('title type courseId sectionId lastActiveAt messageCount messages');

    res.json(conversations);
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ error: '获取对话列表失败' });
  }
};

/**
 * 归档对话
 */
exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }

    await conversation.archive();

    res.json({
      message: '对话已归档',
      conversation,
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ error: '归档对话失败' });
  }
};

/**
 * 删除对话
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }

    res.json({ message: '对话已删除' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: '删除对话失败' });
  }
};

/**
 * 更新对话标题
 */
exports.updateConversationTitle = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        userId: req.user.id,
      },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }

    res.json({
      message: '标题已更新',
      conversation,
    });
  } catch (error) {
    console.error('Update conversation title error:', error);
    res.status(500).json({ error: '更新标题失败' });
  }
};
