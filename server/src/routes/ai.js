const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const auth = require('../middleware/auth');
const Course = require('../models/Course');

/**
 * AI 助教路由
 * 处理所有 AI 相关的 API 请求
 */

/**
 * POST /api/ai/homepage
 * 首页 AI 助教对话
 */
router.post('/homepage', auth, async (req, res) => {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: '请输入问题哦'
      });
    }

    // 限制对话历史长度（防止 token 过多）
    const limitedHistory = conversationHistory?.slice(-10) || [];

    const answer = await claudeService.homepageTutor(question, limitedHistory);

    res.json({
      answer,
      encouragement: claudeService.getRandomEncouragement()
    });
  } catch (error) {
    console.error('Homepage AI error:', error);
    res.status(500).json({
      error: error.message || 'AI 助教暂时无法回答，请稍后再试'
    });
  }
});

/**
 * POST /api/ai/course-tutor
 * 课程 AI 助教对话
 */
router.post('/course-tutor', auth, async (req, res) => {
  try {
    const { courseId, lessonId, question, context } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: '请输入问题哦'
      });
    }

    // 获取课程内容作为上下文
    let courseContent = context || '';

    if (courseId && !context) {
      const course = await Course.findById(courseId);
      if (course) {
        // 如果指定了章节，只用该章节内容
        if (lessonId) {
          const lesson = course.sections.find(s => s._id.toString() === lessonId);
          courseContent = lesson?.content || '';
        } else {
          // 否则用所有章节内容
          courseContent = course.sections.map(s => s.content).join('\n\n');
        }
      }
    }

    const answer = await claudeService.courseTutor(
      courseContent,
      question,
      req.user.grade || '4-6'
    );

    res.json({
      answer,
      encouragement: claudeService.getRandomEncouragement()
    });
  } catch (error) {
    console.error('Course tutor error:', error);
    res.status(500).json({
      error: error.message || 'AI 助教暂时无法回答，请稍后再试'
    });
  }
});

/**
 * POST /api/ai/image-recognition
 * 图像识别
 */
router.post('/image-recognition', auth, async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: '请上传图片'
      });
    }

    // 移除 base64 前缀（如果有）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await claudeService.recognizeImage(base64Data, prompt);

    res.json({
      result,
      encouragement: claudeService.getRandomEncouragement()
    });
  } catch (error) {
    console.error('Image recognition error:', error);
    res.status(500).json({
      error: error.message || '图像识别失败，请稍后再试'
    });
  }
});

/**
 * POST /api/ai/canvas-coding
 * 画布编程 AI 助手
 */
router.post('/canvas-coding', auth, async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: '请输入问题哦'
      });
    }

    const answer = await claudeService.canvasCodingAssistant(question, context);

    res.json({
      answer,
      encouragement: claudeService.getRandomEncouragement()
    });
  } catch (error) {
    console.error('Canvas coding assistant error:', error);
    res.status(500).json({
      error: error.message || 'AI 助教暂时无法回答，请稍后再试'
    });
  }
});

/**
 * POST /api/ai/stream
 * 流式响应（打字机效果）
 */
router.post('/stream', auth, async (req, res) => {
  try {
    const { question, type, conversationHistory, courseId, lessonId, context } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: '请输入问题哦'
      });
    }

    // 根据类型选择 system prompt 和获取上下文
    let systemPrompt = '';
    let history = conversationHistory || [];

    switch (type) {
      case 'course':
        // 获取课程内容作为上下文
        let courseContent = context || '';
        if (courseId && !context) {
          const course = await Course.findById(courseId);
          if (course) {
            if (lessonId) {
              const lesson = course.sections.find(s => s._id.toString() === lessonId);
              courseContent = lesson?.content || '';
            } else {
              courseContent = course.sections.map(s => s.content).join('\n\n');
            }
          }
        }
        systemPrompt = `${claudeService.systemPrompts.courseTutor}

当前课程内容：
${courseContent}

学生年级：${req.user.grade === '1-3' ? '小学1-3年级' : req.user.grade === '4-6' ? '小学4-6年级' : '初中'}

请根据课程内容，用适合该年级学生的语言回答问题。`;
        break;
      case 'canvas':
        systemPrompt = claudeService.systemPrompts.canvasCoding;
        break;
      default:
        systemPrompt = claudeService.systemPrompts.homepage;
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 nginx 缓冲

    // 获取流
    const stream = await claudeService.createStreamResponse(question, systemPrompt, history);

    let fullText = '';
    let buffer = '';
    let insideThink = false;
    let answerStarted = false;
    let answerText = '';

    stream.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');

      for (const line of lines) {
        if (!line.trim() || line.trim() === 'data: [DONE]') continue;

        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            // 处理不同 API 格式
            let content = '';
            if (data.choices && data.choices[0]?.delta?.content) {
              content = data.choices[0].delta.content;
            } else if (data.delta && data.delta.text) {
              content = data.delta.text;
            }

            if (content) {
              buffer += content;
              fullText += content;

              // 实时解析和过滤
              // 检查是否在 <think> 标签内
              if (buffer.includes('<think>')) {
                insideThink = true;
              }
              if (buffer.includes('</think>')) {
                insideThink = false;
                buffer = buffer.split('</think>')[1] || '';
              }

              // 检查是否进入 <answer> 标签
              if (buffer.includes('<answer>')) {
                answerStarted = true;
                const parts = buffer.split('<answer>');
                buffer = parts[parts.length - 1];
              }

              // 如果在 answer 标签内且不在 think 标签内，发送内容
              if (answerStarted && !insideThink && buffer && !buffer.includes('</answer>')) {
                // 发送可见字符
                const textToSend = buffer.replace(/<[^>]*>/g, ''); // 移除其他标签
                if (textToSend) {
                  answerText += textToSend;
                  res.write(`data: ${JSON.stringify({ text: textToSend })}\n\n`);
                  buffer = '';
                }
              }

              // 检查是否结束 answer
              if (buffer.includes('</answer>')) {
                answerStarted = false;
              }
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    });

    stream.on('end', () => {
      // 如果没有找到 answer 标签，尝试从完整文本中提取
      if (!answerText && fullText) {
        const extracted = claudeService.extractAnswer(fullText);
        res.write(`data: ${JSON.stringify({ text: extracted })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: '流式响应出错，请稍后再试' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Stream endpoint error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'AI 助教暂时无法回答' })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/ai/encouragement
 * 获取随机鼓励语
 */
router.get('/encouragement', (req, res) => {
  res.json({
    message: claudeService.getRandomEncouragement()
  });
});

module.exports = router;
