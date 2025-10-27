const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const auth = require('../middleware/auth');

/**
 * AI 对话历史路由
 * 所有路由都需要认证
 */

// 获取所有对话列表
router.get('/', auth, conversationController.getAllConversations);

// 获取或创建对话
router.get('/get-or-create', auth, conversationController.getOrCreateConversation);

// 获取指定对话
router.get('/:conversationId', auth, conversationController.getConversation);

// 添加消息到对话
router.post('/:conversationId/messages', auth, conversationController.addMessage);

// 更新对话标题
router.put('/:conversationId/title', auth, conversationController.updateConversationTitle);

// 归档对话
router.post('/:conversationId/archive', auth, conversationController.archiveConversation);

// 删除对话
router.delete('/:conversationId', auth, conversationController.deleteConversation);

module.exports = router;
