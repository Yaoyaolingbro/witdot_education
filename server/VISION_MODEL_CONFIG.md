# Vision API 模型配置说明

## 概述

AI 视觉工坊使用三个独立的模型来完成不同的任务，它们共用一个 API 地址但调用不同的模型。

## 配置项说明

### 1. API 连接配置

```env
# API 地址和 Key（共用）
VISION_API_URL=https://www.dmxapi.cn
VISION_API_KEY=your_api_key_here
```

### 2. 图像识别模型 (VISION_RECOGNITION_MODEL)

**用途**: 识别图片内容
- 通用物体识别
- 场景识别
- 文字识别（OCR）

**推荐模型**: `claude-3-5-sonnet-20241022` 或其他支持视觉能力的模型

**API 调用格式**:
```javascript
POST /v1/messages
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "image", "source": { "type": "base64", "data": "..." } },
        { "type": "text", "text": "请识别这张图片" }
      ]
    }
  ]
}
```

### 3. AI 生图模型 (VISION_GENERATION_MODEL)

**用途**: 根据文字描述生成图片

**推荐模型**: `stable-diffusion-xl` 或您 API 支持的其他生图模型

**API 调用格式**:
```javascript
POST /v1/images/generations
{
  "model": "stable-diffusion-xl",
  "prompt": "a cute shiba inu astronaut in space",
  "width": 512,
  "height": 512,
  "steps": 20,
  "guidance_scale": 7.5,
  "response_format": "b64_json"
}
```

### 4. 提示词优化模型 (VISION_PROMPT_ENHANCE_MODEL)

**用途**: 优化用户输入的中文描述为专业的英文绘画提示词

**可选配置**: 如果不设置，默认使用 `VISION_RECOGNITION_MODEL`

**推荐模型**: `claude-3-5-sonnet-20241022` 或其他擅长文本转换的模型

**API 调用格式**:
```javascript
POST /v1/messages
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [
    {
      "role": "user",
      "content": "请将这个描述转换为详细的英文绘画提示词：可爱的柴犬宇航员"
    }
  ]
}
```

**返回示例**:
```
cute shiba inu astronaut, space suit, floating in space, stars background, digital art, high quality
```

## 完整配置示例

### 方案 1: 使用不同的模型（推荐）

```env
# 图像识别使用 Claude（支持视觉）
VISION_RECOGNITION_MODEL=claude-3-5-sonnet-20241022

# 生图使用 SD 模型
VISION_GENERATION_MODEL=stable-diffusion-xl

# 提示词优化使用 Claude（擅长文本处理）
VISION_PROMPT_ENHANCE_MODEL=claude-3-5-sonnet-20241022
```

### 方案 2: 简化配置（复用模型）

```env
# 图像识别和提示词优化都用 Claude
VISION_RECOGNITION_MODEL=claude-3-5-sonnet-20241022

# 只有生图用专门的模型
VISION_GENERATION_MODEL=stable-diffusion-xl

# 不设置 VISION_PROMPT_ENHANCE_MODEL，自动使用 VISION_RECOGNITION_MODEL
```

## 工作流程

### 图像识别流程

```
用户上传图片
  ↓
前端发送 base64 到后端
  ↓
后端调用 VISION_RECOGNITION_MODEL
  ↓
返回识别结果（中文）
```

### AI 生图流程

```
用户输入中文描述："可爱的小狗"
  ↓
后端调用 VISION_PROMPT_ENHANCE_MODEL 优化
  ↓
得到优化后的英文提示词："cute puppy, fluffy, ..."
  ↓
后端调用 VISION_GENERATION_MODEL 生成图片
  ↓
返回 base64 图片数据
```

## 模型选择建议

| 功能 | 推荐模型 | 原因 |
|------|---------|------|
| 图像识别 | Claude 3.5 Sonnet | 强大的视觉理解能力，支持中文输出 |
| 提示词优化 | Claude 3.5 Sonnet | 擅长中英文转换和文本优化 |
| 图片生成 | Stable Diffusion XL | 专业的文生图模型，质量高 |

## 注意事项

1. **API 兼容性**: 确保您的 API 支持对应的模型调用格式
2. **响应格式**: 生图接口需要返回 `b64_json` 格式的图片数据
3. **超时设置**: 生图通常需要更长时间，已设置 120 秒超时
4. **错误处理**: 如果提示词优化失败，会自动降级使用原始输入

## 修改配置

1. 编辑 `server/.env` 文件
2. 修改对应的模型配置
3. 重启后端服务: `pm2 restart eduapp-server`

## 测试模型配置

可以通过以下 API 接口测试：

```bash
# 测试图像识别
curl -X POST http://localhost:3210/api/vision/recognize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "BASE64_DATA"}'

# 测试 AI 生图
curl -X POST http://localhost:3210/api/vision/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "可爱的小狗", "size": "512x512"}'
```

## 常见问题

### Q: 为什么要分三个模型？
A: 图像识别、文本优化和图片生成是三种不同的任务，使用专门的模型可以获得更好的效果。

### Q: 可以都用同一个模型吗？
A: 可以，但生图必须使用支持图片生成的模型。识别和优化可以共用。

### Q: 如何知道我的 API 支持哪些模型？
A: 请查看您的 API 提供商文档，或联系技术支持。
