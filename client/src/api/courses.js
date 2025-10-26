import client from './client';

/**
 * 获取所有课程列表
 * @param {Object} params - 查询参数
 * @param {string} params.gradeLevel - 年级范围（可选）
 * @param {string} params.category - 课程分类（可选）
 * @param {boolean} params.isPublished - 是否已发布（可选）
 * @returns {Promise<Object>} 课程列表数据
 */
export const getCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
  if (params.category) queryParams.append('category', params.category);
  if (params.isPublished !== undefined) queryParams.append('isPublished', params.isPublished);

  const url = `/courses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await client.get(url);
  return response.data;
};

/**
 * 获取课程详情
 * @param {string} courseId - 课程 ID
 * @returns {Promise<Object>} 课程详细信息
 */
export const getCourseById = async (courseId) => {
  const response = await client.get(`/courses/${courseId}`);
  return response.data;
};

/**
 * 获取章节详情
 * @param {string} courseId - 课程 ID
 * @param {string} lessonId - 章节 ID
 * @returns {Promise<Object>} 章节详细信息
 */
export const getLessonById = async (courseId, lessonId) => {
  const response = await client.get(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

export default {
  getCourses,
  getCourseById,
  getLessonById,
};
