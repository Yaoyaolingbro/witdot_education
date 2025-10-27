import client from './client';

/**
 * AI 对话历史相关 API
 */

/**
 * 获取或创建对话
 * @param {string} type - 对话类型：'global' | 'course' | 'lesson'
 * @param {string} courseId - 课程 ID（可选）
 * @param {string} sectionId - 章节 ID（可选）
 */
export const getOrCreateConversation = async (type = 'global', courseId = null, sectionId = null) => {
  const params = { type };
  if (courseId) params.courseId = courseId;
  if (sectionId) params.sectionId = sectionId;

  const response = await client.get('/conversations/get-or-create', { params });
  return response.data;
};

/**
 * 获取所有对话列表
 * @param {string} type - 对话类型（可选）
 * @param {string} courseId - 课程 ID（可选）
 */
export const getAllConversations = async (type = null, courseId = null) => {
  const params = {};
  if (type) params.type = type;
  if (courseId) params.courseId = courseId;

  const response = await client.get('/conversations', { params });
  return response.data;
};

/**
 * 获取指定对话
 * @param {string} conversationId - 对话 ID
 */
export const getConversation = async (conversationId) => {
  const response = await client.get(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * 添加消息到对话
 * @param {string} conversationId - 对话 ID
 * @param {string} role - 角色：'user' | 'assistant'
 * @param {string} content - 消息内容
 * @param {object} metadata - 元数据（可选）
 */
export const addMessage = async (conversationId, role, content, metadata = null) => {
  const response = await client.post(`/conversations/${conversationId}/messages`, {
    role,
    content,
    metadata,
  });
  return response.data;
};

/**
 * 更新对话标题
 * @param {string} conversationId - 对话 ID
 * @param {string} title - 新标题
 */
export const updateConversationTitle = async (conversationId, title) => {
  const response = await client.put(`/conversations/${conversationId}/title`, { title });
  return response.data;
};

/**
 * 归档对话
 * @param {string} conversationId - 对话 ID
 */
export const archiveConversation = async (conversationId) => {
  const response = await client.post(`/conversations/${conversationId}/archive`);
  return response.data;
};

/**
 * 删除对话
 * @param {string} conversationId - 对话 ID
 */
export const deleteConversation = async (conversationId) => {
  const response = await client.delete(`/conversations/${conversationId}`);
  return response.data;
};
