import client from './client';

/**
 * 学习记录相关 API
 */

/**
 * 获取所有学习记录
 */
export const getAllRecords = async () => {
  const response = await client.get('/records');
  return response.data;
};

/**
 * 获取学习统计
 */
export const getStudyStats = async () => {
  const response = await client.get('/records/stats');
  return response.data;
};

/**
 * 获取指定课程的学习进度
 * @param {string} courseId - 课程 ID
 */
export const getCourseProgress = async (courseId) => {
  const response = await client.get(`/records/${courseId}`);
  return response.data;
};

/**
 * 标记章节完成
 * @param {string} courseId - 课程 ID
 * @param {string} sectionId - 章节 ID
 */
export const markSectionComplete = async (courseId, sectionId) => {
  const response = await client.post(`/records/${courseId}/complete`, {
    sectionId,
  });
  return response.data;
};

/**
 * 记录学习时长
 * @param {string} courseId - 课程 ID
 * @param {string} sectionId - 章节 ID
 * @param {Date} startTime - 开始时间
 * @param {Date} endTime - 结束时间
 */
export const recordStudyTime = async (courseId, sectionId, startTime, endTime) => {
  const response = await client.post(`/records/${courseId}/time`, {
    sectionId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });
  return response.data;
};

/**
 * 提交测验答案
 * @param {string} courseId - 课程 ID
 * @param {string} sectionId - 章节 ID
 * @param {Array<string>} answers - 答案数组
 */
export const submitQuiz = async (courseId, sectionId, answers) => {
  const response = await client.post(`/records/${courseId}/quiz`, {
    sectionId,
    answers,
  });
  return response.data;
};
