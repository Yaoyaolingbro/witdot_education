const axios = require('axios');
const VISION_CONFIG = require('../config/vision.config');

/**
 * Vision API 服务
 * 处理图像识别和 AI 生图的 API 调用
 */
class VisionService {
  constructor() {
    this.apiUrl = VISION_CONFIG.apiUrl;
    this.apiKey = VISION_CONFIG.apiKey;
    this.recognitionModel = VISION_CONFIG.recognitionModel;
    this.generationModel = VISION_CONFIG.generationModel;
    this.promptEnhanceModel = VISION_CONFIG.promptEnhanceModel;
  }

  /**
   * 通用物体识别
   * @param {string} imageBase64 - 图片 base64 数据（不含前缀）
   * @param {string} customPrompt - 自定义提示词（可选）
   * @returns {Promise<string>} - 识别结果文本
   */
  async recognizeObject(imageBase64, customPrompt = '') {
    const prompt = customPrompt || '请详细描述这张图片中的物体，用简单生动的语言（适合小学生理解）。';

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.recognitionModel,
          max_tokens: VISION_CONFIG.maxTokens.recognition,
          system: VISION_CONFIG.systemPrompts.objectRecognition,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: imageBase64
                  }
                },
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: VISION_CONFIG.timeout.recognition
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Object recognition error:', error.response?.data || error.message);

      if (error.code === 'ECONNABORTED') {
        throw new Error('图像识别超时，请稍后再试');
      } else if (error.response?.status === 429) {
        throw new Error('识别请求太频繁了，休息一下再来吧');
      } else if (error.response?.status === 401) {
        throw new Error('图像识别服务暂时无法使用');
      } else {
        throw new Error('图像识别失败，请检查图片格式或稍后再试');
      }
    }
  }

  /**
   * 场景识别
   * @param {string} imageBase64 - 图片 base64 数据
   * @returns {Promise<string>} - 场景描述
   */
  async recognizeScene(imageBase64) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.recognitionModel,
          max_tokens: VISION_CONFIG.maxTokens.recognition,
          system: VISION_CONFIG.systemPrompts.sceneRecognition,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: imageBase64
                  }
                },
                {
                  type: 'text',
                  text: '请识别这张图片的场景'
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: VISION_CONFIG.timeout.recognition
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Scene recognition error:', error.response?.data || error.message);
      throw new Error('场景识别失败，请稍后再试');
    }
  }

  /**
   * 文字识别 (OCR)
   * @param {string} imageBase64 - 图片 base64 数据
   * @returns {Promise<string>} - 识别到的文字
   */
  async recognizeText(imageBase64) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.recognitionModel,
          max_tokens: VISION_CONFIG.maxTokens.recognition,
          system: VISION_CONFIG.systemPrompts.textRecognition,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: imageBase64
                  }
                },
                {
                  type: 'text',
                  text: '请识别图片中的所有文字'
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: VISION_CONFIG.timeout.recognition
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Text recognition error:', error.response?.data || error.message);
      throw new Error('文字识别失败，请稍后再试');
    }
  }

  /**
   * 优化用户输入的生图提示词
   * @param {string} userPrompt - 用户输入的简单描述
   * @returns {Promise<string>} - 优化后的英文提示词
   */
  async enhancePrompt(userPrompt) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.promptEnhanceModel,  // 使用提示词优化模型
          max_tokens: VISION_CONFIG.maxTokens.generation,
          system: VISION_CONFIG.imageGeneration.promptEnhancement,
          messages: [
            {
              role: 'user',
              content: `请将这个描述转换为详细的英文绘画提示词：${userPrompt}`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000
        }
      );

      return response.data.content[0].text.trim();
    } catch (error) {
      console.error('Prompt enhancement error:', error.response?.data || error.message);
      // 如果优化失败，返回原始提示词
      return userPrompt;
    }
  }

  /**
   * AI 生成图片
   * @param {string} prompt - 绘画提示词（英文）
   * @param {Object} options - 生成选项
   * @param {string} options.size - 图片尺寸（默认 512x512）
   * @param {number} options.steps - 生成步数（默认 20）
   * @param {number} options.guidanceScale - 引导系数（默认 7.5）
   * @returns {Promise<Object>} - { imageUrl: string, imageBase64: string }
   */
  async generateImage(prompt, options = {}) {
    const {
      size = VISION_CONFIG.imageGeneration.defaultSize,
      steps = VISION_CONFIG.imageGeneration.defaultSteps,
      guidanceScale = VISION_CONFIG.imageGeneration.defaultGuidanceScale
    } = options;

    // 解析尺寸
    const [width, height] = size.split('x').map(Number);

    try {
      // 调用 SD 生图 API（假设您的 API 支持 Stable Diffusion 格式）
      const response = await axios.post(
        `${this.apiUrl}/v1/images/generations`,
        {
          model: this.generationModel,
          prompt: prompt,
          negative_prompt: VISION_CONFIG.imageGeneration.negativePrompt,
          width: width,
          height: height,
          steps: steps,
          guidance_scale: guidanceScale,
          response_format: 'b64_json'  // 返回 base64 格式
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: VISION_CONFIG.timeout.generation
        }
      );

      // 根据实际 API 响应格式调整
      const imageData = response.data.data?.[0]?.b64_json || response.data.image;

      return {
        imageBase64: imageData,
        imageUrl: null,  // 如果 API 返回 URL，可以在这里设置
        prompt: prompt,
        size: size
      };
    } catch (error) {
      console.error('Image generation error:', error.response?.data || error.message);

      if (error.code === 'ECONNABORTED') {
        throw new Error('图片生成超时，请稍后再试');
      } else if (error.response?.status === 429) {
        throw new Error('生图请求太频繁了，休息一下再来吧');
      } else if (error.response?.status === 400) {
        throw new Error('提示词不符合要求，请换个描述试试');
      } else {
        throw new Error('图片生成失败，请稍后再试');
      }
    }
  }

  /**
   * 完整的 AI 生图流程（包含提示词优化）
   * @param {string} userPrompt - 用户输入的中文描述
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>} - 生成结果
   */
  async generateImageWithEnhancement(userPrompt, options = {}) {
    try {
      // 步骤 1：优化提示词
      console.log('优化提示词中...', userPrompt);
      const enhancedPrompt = await this.enhancePrompt(userPrompt);
      console.log('优化后的提示词:', enhancedPrompt);

      // 步骤 2：生成图片
      console.log('生成图片中...');
      const result = await this.generateImage(enhancedPrompt, options);

      return {
        ...result,
        originalPrompt: userPrompt,
        enhancedPrompt: enhancedPrompt
      };
    } catch (error) {
      console.error('Image generation with enhancement error:', error.message);
      throw error;
    }
  }

  /**
   * 获取支持的图片尺寸列表
   * @returns {Array<string>}
   */
  getSupportedSizes() {
    return VISION_CONFIG.imageGeneration.supportedSizes;
  }
}

module.exports = new VisionService();
