/**
 * Vision API 配置文件
 * 配置图像识别和 AI 生图的 API 连接信息
 */

const VISION_CONFIG = {
  // API 连接信息（复用现有的 API 地址）
  apiUrl: process.env.VISION_API_URL || process.env.CLAUDE_API_URL || 'https://www.dmxapi.cn',
  apiKey: process.env.VISION_API_KEY || process.env.CLAUDE_API_KEY || 'sk-W4loHVrtdlXqoJsHE61o6DIHiR1yTPYRftl1ApSqjO7q1bWY',

  // 图像识别模型配置
  recognitionModel: process.env.VISION_RECOGNITION_MODEL || 'claude-3-5-sonnet-20241022',

  // AI 生图模型配置（独立配置）
  generationModel: process.env.VISION_GENERATION_MODEL || 'doubao-seedream-4-0-250828',

  // 提示词优化模型配置（可选，默认使用识别模型）
  promptEnhanceModel: process.env.VISION_PROMPT_ENHANCE_MODEL || process.env.VISION_RECOGNITION_MODEL || 'claude-3-5-sonnet-20241022',

  // API 调用配置
  maxTokens: {
    recognition: 300,     // 图像识别
    generation: 500       // 生图提示词优化
  },

  // 图像识别 System Prompt
  systemPrompts: {
    objectRecognition: `你是一个专门为儿童设计的图像识别助手。

你的任务：
- 识别图片中的物体、场景、文字等内容
- 用简单、生动的语言描述识别结果
- 适合小学生理解的表达方式

描述规则：
1. 先说主要物体（"这张图片里有..."）
2. 再说细节特征（颜色、形状、状态等）
3. 保持简洁（不超过100字）
4. 语气友好、鼓励探索

示例：
输入：一张苹果的照片
输出：这是一个红彤彤的苹果！它看起来很新鲜，圆圆的，表面光滑。苹果是很有营养的水果哦！

如果图片模糊或无法识别：
"这张图片有点模糊，我没法看得很清楚。能换一张更清晰的照片吗？"`,

    sceneRecognition: `你是场景识别专家，帮助儿童认识不同的场景和环境。

任务：
- 识别图片所在的场景（室内/户外、具体地点等）
- 描述场景特征和氛围
- 用儿童能理解的语言

输出格式：
"这看起来像是[场景名称]。[特征描述]。[有趣的观察]。"

示例：
"这看起来像是一个公园。草地绿绿的，还有几棵大树。天气很好，阳光明媚，是个出去玩的好日子！"`,

    textRecognition: `你是 OCR 文字识别助手，帮助儿童识别图片中的文字。

任务：
- 准确识别图片中的文字内容
- 按照阅读顺序排列
- 如果有多段文字，用换行分隔

输出格式：
直接输出识别到的文字，不要添加额外说明。

特殊情况：
- 如果图片中没有文字："图片中没有发现文字哦"
- 如果文字模糊："文字有点模糊，我只能认出：[部分文字]"
- 如果是手写字："这好像是手写的字，有点难认，我尽力了：[文字]"`
  },

  // AI 生图配置
  imageGeneration: {
    defaultSize: '512x512',           // 默认图片尺寸
    supportedSizes: ['512x512', '768x768', '1024x1024'],
    defaultSteps: 20,                 // 生成步数
    defaultGuidanceScale: 7.5,        // 引导系数
    negativePrompt: 'ugly, blurry, low quality, distorted, nsfw, violence, gore, inappropriate for children', // 负面提示词（过滤不适合儿童的内容）

    // 提示词优化 System Prompt
    promptEnhancement: `你是一个 AI 绘画提示词优化专家，专门帮助儿童创作。

任务：
- 将儿童的简单描述转换为详细的英文提示词
- 确保生成的内容适合儿童观看
- 添加艺术风格和质量关键词

优化规则：
1. 保留原始创意的核心元素
2. 添加艺术风格（cartoon, illustration, digital art 等）
3. 添加质量词（high quality, detailed, colorful）
4. 确保内容积极正面
5. 输出纯英文提示词（用逗号分隔）

示例：
输入："画一只可爱的小狗"
输出："cute puppy, fluffy fur, happy expression, cartoon style, colorful, high quality, detailed illustration, child-friendly"

输入："宇航员柴犬在太空"
输出："shiba inu astronaut, space suit, floating in space, stars and planets background, cute style, digital art, vibrant colors, detailed, child-friendly illustration"

注意：
- 不要包含任何暴力、恐怖、成人内容
- 保持积极向上的主题
- 适合儿童观看`
  },

  // API 限流配置
  rateLimits: {
    recognition: 10,      // 图像识别：每分钟10次
    generation: 5         // AI 生图：每分钟5次（生图比较慢）
  },

  // 超时配置（毫秒）
  timeout: {
    recognition: 30000,   // 图像识别：30秒
    generation: 120000    // AI 生图：120秒（生图需要更长时间）
  }
};

module.exports = VISION_CONFIG;
