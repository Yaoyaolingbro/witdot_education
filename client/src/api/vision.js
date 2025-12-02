import client from './client';

/**
 * Vision API - 图像识别和 AI 生图接口
 */

/**
 * 通用物体识别
 * @param {string} imageBase64 - 图片 base64 数据
 * @param {string} prompt - 自定义提示词（可选）
 * @returns {Promise<Object>} - { success, data: { result, timestamp } }
 */
export const recognizeObject = async (imageBase64, prompt = '') => {
  const response = await client.post('/vision/recognize', {
    imageBase64,
    prompt
  });
  return response.data;
};

/**
 * 场景识别
 * @param {string} imageBase64 - 图片 base64 数据
 * @returns {Promise<Object>} - { success, data: { scene, timestamp } }
 */
export const recognizeScene = async (imageBase64) => {
  const response = await client.post('/vision/recognize-scene', {
    imageBase64
  });
  return response.data;
};

/**
 * 文字识别 (OCR)
 * @param {string} imageBase64 - 图片 base64 数据
 * @returns {Promise<Object>} - { success, data: { text, timestamp } }
 */
export const recognizeText = async (imageBase64) => {
  const response = await client.post('/vision/recognize-text', {
    imageBase64
  });
  return response.data;
};

/**
 * AI 生成图片
 * @param {string} prompt - 绘画提示词
 * @param {Object} options - 生成选项
 * @param {string} options.size - 图片尺寸（512x512, 768x768, 1024x1024）
 * @param {number} options.steps - 生成步数
 * @param {number} options.guidanceScale - 引导系数
 * @returns {Promise<Object>} - { success, data: { imageBase64, imageUrl, originalPrompt, enhancedPrompt, size, timestamp } }
 */
export const generateImage = async (prompt, options = {}) => {
  const response = await client.post('/vision/generate', {
    prompt,
    ...options
  }, {
    timeout: 120000  // AI 生图需要更长时间，设置 120 秒超时
  });
  return response.data;
};

/**
 * 优化提示词（不生成图片）
 * @param {string} prompt - 需要优化的提示词
 * @returns {Promise<Object>} - { success, data: { originalPrompt, enhancedPrompt } }
 */
export const enhancePrompt = async (prompt) => {
  const response = await client.post('/vision/enhance-prompt', {
    prompt
  });
  return response.data;
};

/**
 * 获取支持的图片尺寸列表
 * @returns {Promise<Object>} - { success, data: { sizes, default } }
 */
export const getSupportedSizes = async () => {
  const response = await client.get('/vision/supported-sizes');
  return response.data;
};
