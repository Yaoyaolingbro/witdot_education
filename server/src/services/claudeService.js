const axios = require('axios');
const CLAUDE_CONFIG = require('../config/claude.config');

/**
 * Claude API 服务
 * 处理所有与 Claude AI 的交互
 */
class ClaudeService {
  constructor() {
    this.apiUrl = CLAUDE_CONFIG.apiUrl;
    this.apiKey = CLAUDE_CONFIG.apiKey;
    this.model = CLAUDE_CONFIG.model;
    this.systemPrompts = CLAUDE_CONFIG.systemPrompts;
  }

  /**
   * 调用 Claude API
   * @private
   */
  async callClaudeAPI(messages, systemPrompt, maxTokens = 500) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: messages
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000 // 30秒超时
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);

      // 返回友好的错误提示
      if (error.code === 'ECONNABORTED') {
        throw new Error('AI 助教响应超时，请稍后再试');
      } else if (error.response?.status === 429) {
        throw new Error('提问太频繁了，休息一下再来吧');
      } else if (error.response?.status === 401) {
        throw new Error('AI 助教暂时无法使用，请联系老师');
      } else {
        throw new Error('AI 助教暂时无法回答，请稍后再试');
      }
    }
  }

  /**
   * 首页 AI 助教 - 通用对话
   * @param {string} question - 学生问题
   * @param {Array} conversationHistory - 对话历史（可选）
   */
  async homepageTutor(question, conversationHistory = []) {
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: question
      }
    ];

    const response = await this.callClaudeAPI(
      messages,
      this.systemPrompts.homepage,
      CLAUDE_CONFIG.maxTokens.general
    );

    return response;
  }

  /**
   * 课程 AI 助教 - 课程相关问题
   * @param {string} courseContent - 当前课程内容
   * @param {string} studentQuestion - 学生问题
   * @param {string} gradeLevel - 年级（用于调整语言难度）
   */
  async courseTutor(courseContent, studentQuestion, gradeLevel = '4-6') {
    // 增强 system prompt，包含课程上下文
    const enhancedSystemPrompt = `${this.systemPrompts.courseTutor}

当前课程内容：
${courseContent}

学生年级：${gradeLevel === '1-3' ? '小学1-3年级' : gradeLevel === '4-6' ? '小学4-6年级' : '初中'}

请根据课程内容，用适合该年级学生的语言回答问题。`;

    const messages = [
      {
        role: 'user',
        content: studentQuestion
      }
    ];

    const response = await this.callClaudeAPI(
      messages,
      enhancedSystemPrompt,
      CLAUDE_CONFIG.maxTokens.tutor
    );

    return response;
  }

  /**
   * 图像识别 AI 助手
   * @param {string} imageBase64 - 图片 base64
   * @param {string} customPrompt - 自定义提示词（可选）
   */
  async recognizeImage(imageBase64, customPrompt = '') {
    const prompt = customPrompt || '请描述这张图片的内容，用简单生动的语言（适合小学生理解）';

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/messages`,
        {
          model: this.model,
          max_tokens: CLAUDE_CONFIG.maxTokens.imageRecognition,
          system: this.systemPrompts.imageRecognition,
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
          timeout: 30000
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Image recognition error:', error.response?.data || error.message);
      throw new Error('图像识别失败，请检查图片格式或稍后再试');
    }
  }

  /**
   * 文本生成 AI 助手
   * @param {string} prompt - 用户提示词
   * @param {string} gradeLevel - 年级（用于调整语言难度）
   */
  async generateText(prompt, gradeLevel = '4-6') {
    const systemPrompt = `你是一个专门为小学生设计的 AI 文本生成助手。你的任务是根据用户的提示词，生成适合小学生理解和学习的文本内容。

特点：
1. 语言简单生动，符合${gradeLevel === '1-3' ? '小学1-3年级' : gradeLevel === '4-6' ? '小学4-6年级' : '初中'}学生的认知水平
2. 内容积极向上，富有教育意义
3. 用词准确，避免使用复杂的专业术语
4. 内容有趣生动，能够吸引学生注意力

请直接生成内容，不要添加额外的解释。`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.callClaudeAPI(
      messages,
      systemPrompt,
      CLAUDE_CONFIG.maxTokens.general
    );

    return response;
  }

  /**
   * 画布编程 AI 助手
   * @param {string} question - 编程相关问题
   * @param {Object} context - 上下文（当前积木、代码等）
   */
  async canvasCodingAssistant(question, context = {}) {
    let contextInfo = '';
    if (context.currentBlocks) {
      contextInfo = `\n当前学生的积木代码：\n${JSON.stringify(context.currentBlocks, null, 2)}`;
    }

    const enhancedSystemPrompt = `${this.systemPrompts.canvasCoding}${contextInfo}`;

    const messages = [
      {
        role: 'user',
        content: question
      }
    ];

    const response = await this.callClaudeAPI(
      messages,
      enhancedSystemPrompt,
      CLAUDE_CONFIG.maxTokens.general
    );

    return response;
  }

  /**
   * 获取随机鼓励语
   */
  getRandomEncouragement() {
    const encouragements = this.systemPrompts.encouragement;
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * 获取随机错误处理话语
   */
  getRandomErrorMessage() {
    const errorMessages = this.systemPrompts.errorHandling;
    return errorMessages[Math.floor(Math.random() * errorMessages.length)];
  }

  /**
   * 流式响应（用于打字机效果）
   * @param {string} question - 问题
   * @param {string} systemPrompt - system prompt
   * @param {Array} conversationHistory - 对话历史
   * @returns {Promise<ReadableStream>} - 返回可读流
   */
  async createStreamResponse(question, systemPrompt, conversationHistory = []) {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: question }
    ];

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/chat/completions`,
        {
          model: this.model,
          max_tokens: CLAUDE_CONFIG.maxTokens.general,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          stream: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: 'stream',
          timeout: 60000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Stream creation error:', error.response?.data || error.message);
      throw new Error('流式响应创建失败');
    }
  }

  /**
   * 从文本中提取 <answer> 标签内容
   * @param {string} text - 完整文本
   * @returns {string} - 提取的答案
   */
  extractAnswer(text) {
    // 匹配 <answer>...</answer>
    const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/);
    if (answerMatch && answerMatch[1]) {
      return answerMatch[1].trim();
    }

    // 如果没有 answer 标签，返回原文本（排除 think 标签）
    const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return withoutThink || text;
  }
}

module.exports = new ClaudeService();
