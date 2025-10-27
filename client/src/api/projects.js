import client from './client';

/**
 * 项目管理相关 API
 */

/**
 * 获取所有项目
 * @param {string} category - 分类（可选）
 */
export const getAllProjects = async (category = null) => {
  const params = {};
  if (category) params.category = category;

  const response = await client.get('/projects', { params });
  return response.data;
};

/**
 * 获取单个项目
 * @param {string} projectId - 项目 ID
 */
export const getProjectById = async (projectId) => {
  const response = await client.get(`/projects/${projectId}`);
  return response.data;
};

/**
 * 创建项目
 * @param {object} projectData - 项目数据
 */
export const createProject = async (projectData) => {
  const response = await client.post('/projects', projectData);
  return response.data;
};

/**
 * 更新项目
 * @param {string} projectId - 项目 ID
 * @param {object} projectData - 更新数据
 */
export const updateProject = async (projectId, projectData) => {
  const response = await client.put(`/projects/${projectId}`, projectData);
  return response.data;
};

/**
 * 删除项目
 * @param {string} projectId - 项目 ID
 */
export const deleteProject = async (projectId) => {
  const response = await client.delete(`/projects/${projectId}`);
  return response.data;
};

/**
 * 生成分享链接
 * @param {string} projectId - 项目 ID
 */
export const generateShareLink = async (projectId) => {
  const response = await client.post(`/projects/${projectId}/share`);
  return response.data;
};

/**
 * 取消分享
 * @param {string} projectId - 项目 ID
 */
export const revokeShare = async (projectId) => {
  const response = await client.delete(`/projects/${projectId}/share`);
  return response.data;
};

/**
 * 通过分享链接获取项目
 * @param {string} shareToken - 分享令牌
 */
export const getSharedProject = async (shareToken) => {
  const response = await client.get(`/projects/shared/${shareToken}`);
  return response.data;
};

/**
 * 获取项目模板列表
 */
export const getTemplates = async () => {
  const response = await client.get('/projects/templates/list');
  return response.data;
};
