const visionService = require('../services/visionService');

/**
 * Vision API 控制器
 * 处理图像识别和 AI 生图的 HTTP 请求
 */

/**
 * 通用物体识别
 * POST /api/vision/recognize
 */
exports.recognizeObject = async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;

    // 验证必填参数
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: '请提供图片数据'
      });
    }

    // 移除 base64 前缀（如果有）
    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // 调用服务层
    const result = await visionService.recognizeObject(cleanedBase64, prompt);

    res.json({
      success: true,
      data: {
        result: result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Recognize object error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '图像识别失败'
    });
  }
};

/**
 * 场景识别
 * POST /api/vision/recognize-scene
 */
exports.recognizeScene = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: '请提供图片数据'
      });
    }

    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const result = await visionService.recognizeScene(cleanedBase64);

    res.json({
      success: true,
      data: {
        scene: result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Recognize scene error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '场景识别失败'
    });
  }
};

/**
 * 文字识别 (OCR)
 * POST /api/vision/recognize-text
 */
exports.recognizeText = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: '请提供图片数据'
      });
    }

    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const result = await visionService.recognizeText(cleanedBase64);

    res.json({
      success: true,
      data: {
        text: result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Recognize text error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '文字识别失败'
    });
  }
};

/**
 * AI 生成图片（包含提示词优化）
 * POST /api/vision/generate
 */
exports.generateImage = async (req, res) => {
  try {
    const { prompt, size, steps, guidanceScale } = req.body;

    // 验证必填参数
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '请提供绘画描述'
      });
    }

    // 验证尺寸（如果提供）
    if (size) {
      const supportedSizes = visionService.getSupportedSizes();
      if (!supportedSizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `不支持的图片尺寸。支持的尺寸: ${supportedSizes.join(', ')}`
        });
      }
    }

    // 构建选项
    const options = {};
    if (size) options.size = size;
    if (steps) options.steps = parseInt(steps);
    if (guidanceScale) options.guidanceScale = parseFloat(guidanceScale);

    // 调用服务层（包含提示词优化）
    const result = await visionService.generateImageWithEnhancement(prompt, options);

    res.json({
      success: true,
      data: {
        imageBase64: result.imageBase64,
        imageUrl: result.imageUrl,
        originalPrompt: result.originalPrompt,
        enhancedPrompt: result.enhancedPrompt,
        size: result.size,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '图片生成失败'
    });
  }
};

/**
 * 优化提示词（不生成图片，仅用于预览）
 * POST /api/vision/enhance-prompt
 */
exports.enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '请提供需要优化的提示词'
      });
    }

    const enhancedPrompt = await visionService.enhancePrompt(prompt);

    res.json({
      success: true,
      data: {
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt
      }
    });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提示词优化失败'
    });
  }
};

/**
 * 获取支持的图片尺寸列表
 * GET /api/vision/supported-sizes
 */
exports.getSupportedSizes = async (req, res) => {
  try {
    const sizes = visionService.getSupportedSizes();

    res.json({
      success: true,
      data: {
        sizes: sizes,
        default: '512x512'
      }
    });
  } catch (error) {
    console.error('Get supported sizes error:', error);
    res.status(500).json({
      success: false,
      message: '获取支持的尺寸失败'
    });
  }
};
