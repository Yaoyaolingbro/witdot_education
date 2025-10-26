# 🧠 CLAUDE.md - witdot 中小学生 AI 教育平台技术指南

> 本文档为 Claude AI 编程助手提供项目上下文、技术规范和开发指导

---

## 📋 项目概述

**项目名称**: witdot Education AI Platform
**项目定位**: 中小学生 AI 通识教育 + 画布编程学习平台
**核心目标**: 通过可视化编程（Blockly）让学生理解 AI 原理，培养计算思维

### 平台架构
```
witdot Education AI Platform
├── 1. AI通识课
│   ├── 小学课程
│   │   ├── 1-3年级通识课
│   │   └── 4-6年级通识课
│   │       └── 走进AI系列课 ⭐ （当前核心课程）
│   └── 初中课程
├── 2. 画布编程
│   ├── 图像识别画板 ⭐ （固定Agent，MVP首选）
│   ├── 语音助手画板
│   └── 机器人画板
└── 3. 机器人编程（未来规划）
```

### MVP 核心功能
1. **AI通识课**："走进AI系列课"（4-6年级）+ AI助教
2. **画布编程**：图像识别画板（固定Agent示例）
3. **基础功能**：用户登录、学习进度、作品保存

---

## 🏗 技术栈

### 前端技术栈
```json
{
  "framework": "React 18",
  "buildTool": "Vite",
  "styling": "TailwindCSS",
  "routing": "React Router v6",
  "stateManagement": "Zustand",
  "visualProgramming": "Google Blockly",
  "httpClient": "Axios",
  "markdown": "react-markdown",
  "formHandling": "React Hook Form",
  "validation": "Zod"
}
```

### 后端技术栈
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express",
  "database": "MongoDB + Mongoose",
  "authentication": "JWT + bcrypt",
  "validation": "Zod",
  "logger": "Winston",
  "fileUpload": "Multer (可选)"
}
```

### AI 集成
- **Claude API** (Anthropic) - AI 助教 + 图像识别
- **Web Speech API** - 语音识别（浏览器原生）

### 可视化编程库
- **选择**: [Google Blockly](https://github.com/google/blockly)
- **理由**: 文档完善、可高度自定义、轻量级

---

## 📁 项目目录结构

```
edu_app/
├── client/                     # 前端 React 项目
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx          # 顶部导航栏
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Container.jsx       # 页面容器
│   │   │   ├── course/
│   │   │   │   ├── CourseCard.jsx      # 课程卡片
│   │   │   │   ├── ChapterList.jsx     # 章节目录
│   │   │   │   ├── CourseContent.jsx   # 课程内容显示
│   │   │   │   └── QuizComponent.jsx   # 测验组件
│   │   │   ├── ai/
│   │   │   │   ├── AIAssistant.jsx     # AI助教对话框
│   │   │   │   └── ChatMessage.jsx
│   │   │   ├── blockly/
│   │   │   │   ├── BlocklyEditor.jsx   # Blockly 编辑器
│   │   │   │   ├── BlocklyPreview.jsx  # 预览区
│   │   │   │   └── BlocklyToolbox.jsx  # 工具箱配置
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx                # 首页
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Courses.jsx             # 课程列表
│   │   │   ├── CourseDetail.jsx        # 课程详情
│   │   │   ├── CanvasCoding.jsx        # 画布编程主页
│   │   │   ├── ImageRecognition.jsx    # 图像识别画板
│   │   │   ├── VoiceAssistant.jsx      # 语音助手画板
│   │   │   ├── MyProjects.jsx          # 我的作品
│   │   │   ├── Profile.jsx             # 个人中心
│   │   │   └── TeacherDashboard.jsx    # 教师后台
│   │   ├── api/                # API 调用封装
│   │   │   ├── client.js               # Axios 实例
│   │   │   ├── auth.js
│   │   │   ├── course.js
│   │   │   ├── project.js
│   │   │   └── ai.js                   # Claude API 调用
│   │   ├── store/              # Zustand 状态管理
│   │   │   ├── useAuthStore.js
│   │   │   ├── useCourseStore.js
│   │   │   └── useProjectStore.js
│   │   ├── hooks/              # 自定义 Hooks
│   │   │   ├── useAuth.js
│   │   │   └── useCourse.js
│   │   ├── blockly/            # Blockly 自定义模块
│   │   │   ├── blocks/         # 自定义积木定义
│   │   │   │   ├── aiBlocks.js         # AI 相关积木
│   │   │   │   ├── logicBlocks.js      # 逻辑积木
│   │   │   │   └── ioBlocks.js         # 输入输出积木
│   │   │   ├── generators/     # 代码生成器
│   │   │   │   └── javascript.js
│   │   │   ├── toolbox.js              # 工具箱配置
│   │   │   └── interpreter.js          # 解释执行器
│   │   ├── utils/              # 工具函数
│   │   │   ├── formatDate.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx          # 路由配置
│   ├── public/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   └── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # 后端 Node.js 项目
│   ├── src/
│   │   ├── models/             # Mongoose 数据模型
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   ├── Project.js
│   │   │   ├── Record.js               # 学习记录
│   │   │   └── Template.js             # Agent 模板
│   │   ├── routes/             # Express 路由
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── projects.js
│   │   │   ├── ai.js                   # AI 相关接口
│   │   │   └── teachers.js
│   │   ├── controllers/        # 控制器
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── projectController.js
│   │   │   └── aiController.js
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.js                 # JWT 验证
│   │   │   ├── validate.js             # 请求验证
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js          # API 限流
│   │   ├── services/           # 业务逻辑
│   │   │   ├── claudeService.js        # Claude API 集成
│   │   │   ├── blocklyExecutor.js      # Blockly 执行引擎
│   │   │   └── courseService.js
│   │   ├── utils/              # 工具函数
│   │   │   └── logger.js
│   │   ├── config/             # 配置
│   │   │   ├── db.js                   # MongoDB 连接
│   │   │   └── env.js
│   │   └── app.js              # Express 入口
│   ├── .env.example
│   └── package.json
│
├── docs/                       # 文档
│   ├── introduction.md         # 项目介绍
│   ├── 开发计划.md             # 开发计划
│   └── CLAUDE.md               # 本文件
│
├── .gitignore
├── README.md
└── package.json                # Monorepo 配置（可选）
```

---

## 🗄 数据库设计（MongoDB）

### 1. users 集合
```javascript
{
  _id: ObjectId,
  username: String,             // 用户名（唯一）
  email: String,                // 邮箱（唯一）
  password: String,             // bcrypt 加密后的密码
  role: String,                 // 'student' | 'teacher'
  grade: String,                // 年级（学生）：'1-3' | '4-6' | '7-9'
  avatar: String,               // 头像 URL（可选）
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
```

### 2. courses 集合
```javascript
{
  _id: ObjectId,
  title: String,                // 课程标题："走进AI系列课"
  description: String,          // 课程简介
  gradeLevel: String,           // '1-3' | '4-6' | '7-9'
  category: String,             // 'ai_literacy' | 'canvas_coding'
  coverImage: String,           // 封面图 URL
  creatorId: ObjectId,          // 创建者（教师）ID
  sections: [{                  // 章节列表
    _id: ObjectId,
    title: String,              // 章节标题
    order: Number,              // 排序
    content: String,            // Markdown 内容
    videoUrl: String,           // 视频链接（可选）
    quiz: {                     // 章节测验（可选）
      questions: [{
        question: String,
        type: String,           // 'choice' | 'fill'
        options: [String],      // 选择题选项
        answer: String,         // 正确答案
        points: Number          // 分值
      }]
    }
  }],
  isPublished: Boolean,         // 是否发布
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.courses.createIndex({ gradeLevel: 1, category: 1 });
db.courses.createIndex({ creatorId: 1 });
```

### 3. projects 集合（Blockly 作品）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // 创建者 ID
  title: String,                // 项目名称
  description: String,          // 项目描述
  category: String,             // 'imageRecognition' | 'voiceAssistant' | 'robot'
  blocksJson: String,           // Blockly workspace JSON 字符串
  coverImage: String,           // 封面图（可选）
  isTemplate: Boolean,          // 是否为模板（固定Agent）
  templateId: ObjectId,         // 基于的模板 ID（可选）
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.projects.createIndex({ userId: 1, createdAt: -1 });
db.projects.createIndex({ isTemplate: 1 });
```

### 4. records 集合（学习记录）
```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // 学生 ID
  courseId: ObjectId,           // 课程 ID
  progress: Number,             // 进度百分比（0-100）
  completedSections: [ObjectId], // 已完成章节 ID 列表
  quizScores: [{                // 测验成绩
    sectionId: ObjectId,
    score: Number,              // 得分
    totalPoints: Number,        // 总分
    answers: [String],          // 学生答案
    completedAt: Date
  }],
  lastAccessedAt: Date,         // 最后访问时间
  totalTimeSpent: Number,       // 总学习时长（秒）
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.records.createIndex({ userId: 1, courseId: 1 }, { unique: true });
db.records.createIndex({ userId: 1, lastAccessedAt: -1 });
```

### 5. templates 集合（Agent 模板）
```javascript
{
  _id: ObjectId,
  name: String,                 // 模板名称："图像识别助手"
  description: String,          // 模板描述
  category: String,             // 'imageRecognition' | 'voiceAssistant' | 'robot'
  blocksJson: String,           // 预设的 Blockly JSON
  isFixed: Boolean,             // 是否为固定流程（学生不可修改核心逻辑）
  editableFields: [String],     // 可编辑字段列表（如提示词）
  prompt: String,               // Claude API 默认提示词
  coverImage: String,
  usageCount: Number,           // 使用次数
  createdAt: Date,
  updatedAt: Date
}

// 索引
db.templates.createIndex({ category: 1 });
```

---

## 🔌 API 路由设计

### 用户认证 (`/api/auth`)
```javascript
POST   /api/auth/register       // 注册
POST   /api/auth/login          // 登录
GET    /api/auth/profile        // 获取当前用户信息（需要 JWT）
PUT    /api/auth/profile        // 更新用户信息（需要 JWT）
POST   /api/auth/logout         // 登出（可选）
```

### 课程模块 (`/api/courses`)
```javascript
GET    /api/courses             // 获取课程列表
                                // 查询参数：?gradeLevel=4-6&category=ai_literacy
GET    /api/courses/:id         // 获取课程详情（包含章节）
POST   /api/courses             // 创建课程（教师）
PUT    /api/courses/:id         // 更新课程（教师）
DELETE /api/courses/:id         // 删除课程（教师）
POST   /api/courses/:id/sections // 添加章节（教师）
```

### 学习进度 (`/api/records`)
```javascript
GET    /api/records             // 获取当前用户所有学习记录
GET    /api/records/:courseId   // 获取指定课程学习进度
POST   /api/records/:courseId/progress  // 更新章节完成状态
POST   /api/records/:courseId/quiz      // 提交测验答案
```

### 项目管理 (`/api/projects`)
```javascript
GET    /api/projects            // 获取我的项目列表
GET    /api/projects/:id        // 获取项目详情
POST   /api/projects            // 创建/保存项目
PUT    /api/projects/:id        // 更新项目
DELETE /api/projects/:id        // 删除项目
GET    /api/projects/templates  // 获取模板列表
```

### AI 模块 (`/api/ai`)
```javascript
POST   /api/ai/tutor            // AI 助教对话
                                // Body: { courseId, question, context }
POST   /api/ai/execute          // 执行 Blockly Agent
                                // Body: { blocksJson, input }
POST   /api/ai/image-recognition // 图像识别
                                // Body: { image (base64), prompt }
```

### 教师后台 (`/api/teachers`)
```javascript
GET    /api/teachers/stats      // 教师统计数据（需要教师角色）
GET    /api/teachers/students   // 学生列表
GET    /api/teachers/submissions // 学生作品列表
POST   /api/teachers/courses    // 创建课程
```

---

## 🎨 前端组件设计

### 核心组件规范

#### 1. Navbar（顶部导航栏）
```jsx
// src/components/layout/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="witdot" className="h-8" />
          <span className="text-xl font-bold text-blue-600">witdot</span>
        </Link>

        {/* 导航菜单 */}
        <div className="flex items-center gap-6">
          <Link to="/courses" className="text-gray-700 hover:text-blue-600">
            AI通识课
          </Link>
          <Link to="/canvas" className="text-gray-700 hover:text-blue-600">
            画布编程
          </Link>
          <Link to="/my-learning" className="text-gray-700 hover:text-blue-600">
            我的学习
          </Link>
        </div>

        {/* 用户区 */}
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.username}</span>
              <img
                src={user.avatar || '/default-avatar.png'}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">登录</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

#### 2. BlocklyEditor（Blockly 编辑器）
```jsx
// src/components/blockly/BlocklyEditor.jsx
import { useEffect, useRef } from 'react';
import Blockly from 'blockly';
import { toolboxConfig } from '@/blockly/toolbox';
import '@/blockly/blocks/aiBlocks'; // 自定义积木

export default function BlocklyEditor({
  initialBlocks,
  onWorkspaceChange,
  readOnly = false
}) {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxConfig,
        readOnly,
        grid: { spacing: 20, length: 3, colour: '#ccc' },
        zoom: { controls: true, wheel: true }
      });

      // 加载初始积木
      if (initialBlocks) {
        Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(initialBlocks),
          workspace.current
        );
      }

      // 监听变化
      workspace.current.addChangeListener(() => {
        const json = Blockly.serialization.workspaces.save(workspace.current);
        onWorkspaceChange?.(JSON.stringify(json));
      });
    }

    return () => {
      workspace.current?.dispose();
      workspace.current = null;
    };
  }, []);

  return (
    <div
      ref={blocklyDiv}
      className="w-full h-full border rounded-lg"
      style={{ minHeight: '500px' }}
    />
  );
}
```

#### 3. AIAssistant（AI 助教）
```jsx
// src/components/ai/AIAssistant.jsx
import { useState } from 'react';
import { useAITutor } from '@/hooks/useAITutor';
import ChatMessage from './ChatMessage';

export default function AIAssistant({ courseId, courseContent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { askQuestion, isLoading } = useAITutor();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const response = await askQuestion(courseId, input, courseContent);

    const aiMessage = { role: 'assistant', content: response };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b bg-purple-50">
        <h3 className="font-semibold text-purple-800">🤖 AI 助教</h3>
        <p className="text-xs text-gray-600">有问题随时问我！</p>
      </div>

      {/* 聊天记录 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin">⚙️</div>
            <span>AI 助教正在思考...</span>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的问题..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="btn btn-primary"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧱 Blockly 自定义积木

### 示例：AI 文本生成积木

```javascript
// client/src/blockly/blocks/aiBlocks.js
import Blockly from 'blockly';

// 积木定义
Blockly.Blocks['ai_text_generate'] = {
  init: function() {
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('使用 AI 生成文本，提示词：');
    this.setOutput(true, 'String');
    this.setColour(270); // 紫色（AI 相关）
    this.setTooltip('调用 Claude API 生成文本');
    this.setHelpUrl('');
  }
};

// JavaScript 代码生成器
Blockly.JavaScript['ai_text_generate'] = function(block) {
  const prompt = Blockly.JavaScript.valueToCode(
    block,
    'PROMPT',
    Blockly.JavaScript.ORDER_ATOMIC
  ) || '""';

  const code = `await callClaudeAPI(${prompt})`;
  return [code, Blockly.JavaScript.ORDER_AWAIT];
};
```

### 工具箱配置

```javascript
// client/src/blockly/toolbox.js
export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '基础逻辑',
      colour: 210,
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'text' }
      ]
    },
    {
      kind: 'category',
      name: 'AI 功能',
      colour: 270,
      contents: [
        { kind: 'block', type: 'ai_text_generate' },
        { kind: 'block', type: 'ai_image_recognize' },
        { kind: 'block', type: 'ai_voice_recognize' }
      ]
    },
    {
      kind: 'category',
      name: '输入输出',
      colour: 160,
      contents: [
        { kind: 'block', type: 'io_get_input' },
        { kind: 'block', type: 'io_display_result' },
        { kind: 'block', type: 'io_upload_image' }
      ]
    }
  ]
};
```

---

## 🧠 Claude API 集成

### 服务端集成

```javascript
// server/src/services/claudeService.js
const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });
  }

  /**
   * AI 助教对话
   * @param {string} courseContent - 课程内容
   * @param {string} studentQuestion - 学生问题
   * @param {string} gradeLevel - 年级（用于调整语言难度）
   */
  async tutorResponse(courseContent, studentQuestion, gradeLevel = '4-6') {
    const prompt = `你是一位专业的小学AI课程助教。

当前课程内容：
${courseContent}

学生年级：${gradeLevel === '1-3' ? '小学1-3年级' : '小学4-6年级'}

学生问题：
${studentQuestion}

请用简单易懂的语言解释，符合学生的认知水平。要求：
1. 语言亲切友好
2. 避免专业术语，多用比喻
3. 回答简洁（不超过150字）
4. 鼓励学生继续探索

请回答：`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('AI 助教暂时无法回答，请稍后再试');
    }
  }

  /**
   * 图像识别
   * @param {string} imageBase64 - 图片 base64
   * @param {string} customPrompt - 自定义提示词
   */
  async recognizeImage(imageBase64, customPrompt = '') {
    const defaultPrompt = '请描述这张图片的内容，用简单的语言（适合小学生理解）';
    const prompt = customPrompt || defaultPrompt;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
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
            { type: 'text', text: prompt }
          ]
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Image recognition error:', error);
      throw new Error('图像识别失败');
    }
  }
}

module.exports = new ClaudeService();
```

### API 路由

```javascript
// server/src/routes/ai.js
const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// AI 助教对话（限流：每分钟最多 10 次）
router.post('/tutor', auth, rateLimiter(10), async (req, res) => {
  try {
    const { courseId, question, context } = req.body;

    // 获取课程内容
    const course = await Course.findById(courseId);
    const courseContent = context || course.sections.map(s => s.content).join('\n');

    const response = await claudeService.tutorResponse(
      courseContent,
      question,
      req.user.grade
    );

    res.json({ answer: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 图像识别（限流：每分钟最多 5 次）
router.post('/image-recognition', auth, rateLimiter(5), async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;

    const result = await claudeService.recognizeImage(imageBase64, prompt);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🔒 安全性规范

### 1. JWT 认证中间件
```javascript
// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, grade }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
};

module.exports = authMiddleware;
```

### 2. API 限流（防止滥用 Claude API）
```javascript
// server/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (maxRequests) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 分钟
    max: maxRequests,
    message: '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = createRateLimiter;
```

### 3. 输入验证（Zod）
```javascript
// server/src/controllers/projectController.js
const { z } = require('zod');

const projectSchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().max(200),
  category: z.enum(['imageRecognition', 'voiceAssistant', 'robot']),
  blocksJson: z.string()
});

exports.createProject = async (req, res) => {
  try {
    const validatedData = projectSchema.parse(req.body);

    const project = await Project.create({
      ...validatedData,
      userId: req.user.id
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: '创建项目失败' });
  }
};
```

---

## 🎨 设计规范

### TailwindCSS 配置
```javascript
// client/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6', // 主蓝色
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: '#10b981',
        warning: '#f59e0b',
        ai: '#8b5cf6' // AI 相关功能专用紫色
      }
    }
  },
  plugins: []
};
```

### 通用样式类
```css
/* client/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border p-4;
  }
}
```

---

## 📝 开发注意事项

### 给 Claude AI 的关键指导

#### 1. 教育场景优先考虑
- **语言简化**：所有 UI 文案、提示信息用小学生能理解的语言
- **大按钮设计**：按钮至少 `px-6 py-3`，方便点击
- **即时反馈**：每个操作都有视觉反馈（loading、success、error）
- **防误操作**：重要操作（如删除）需要二次确认

#### 2. Blockly 开发技巧
- 积木命名用**中文**（如"调用 AI 生成文本"）
- 避免深层嵌套（最多 3 层）
- 固定 Agent 模式：核心逻辑积木设为 `disabled: true`
- 提供默认值（如提示词输入框预填充示例）

#### 3. Claude API 使用规范
- **成本控制**：
  - `max_tokens` 限制：助教 300、图像识别 200
  - 实现 API 限流（每分钟 10 次）
  - 缓存常见问题（如"什么是 AI"）
- **Prompt 设计**：
  - 明确角色（小学 AI 助教）
  - 限制回复长度（不超过 150 字）
  - 要求简单语言、避免术语

#### 4. 性能优化要点
- React 组件使用 `React.memo`（避免无意义重渲染）
- Blockly 工作区积木数量限制（< 50 个）
- 图片上传限制：< 2MB，压缩后再上传
- 路由懒加载：`const Courses = lazy(() => import('./pages/Courses'))`

#### 5. 错误处理规范
```javascript
// 友好的错误提示示例
try {
  await saveProject();
} catch (error) {
  // ❌ 不好：显示技术错误
  // alert(error.message);

  // ✅ 好：简化为用户能理解的提示
  showToast('保存失败，请检查网络后重试', 'error');
}
```

---

## 🧪 测试建议

### 前端组件测试示例
```javascript
// client/src/components/__tests__/CourseCard.test.jsx
import { render, screen } from '@testing-library/react';
import CourseCard from '../course/CourseCard';

test('renders course card with correct data', () => {
  const course = {
    title: '走进AI系列课',
    description: '了解 AI 基础知识',
    gradeLevel: '4-6'
  };

  render(<CourseCard course={course} />);

  expect(screen.getByText('走进AI系列课')).toBeInTheDocument();
  expect(screen.getByText('4-6年级')).toBeInTheDocument();
});
```

---

## 🚀 部署清单

### 环境变量 (`.env`)
```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/witdot_edu

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Claude API
CLAUDE_API_KEY=sk-ant-api03-xxx

# 服务器配置
PORT=3210
NODE_ENV=production

# 前端 URL（CORS）
CLIENT_URL=https://witdot.edu
```

### 部署步骤
1. **前端**：
   ```bash
   cd client
   npm run build
   # 部署到 Vercel/Netlify
   ```

2. **后端**：
   ```bash
   cd server
   # 使用 PM2 管理进程
   pm2 start src/app.js --name witdot-api
   ```

3. **数据库**：MongoDB Atlas（云数据库）

---

## 📚 参考资源

- [Google Blockly 官方文档](https://developers.google.com/blockly)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [React Router v6](https://reactrouter.com)
- [Zustand 状态管理](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com)

---

## 🎯 开发优先级提醒

### P0（立即开始）
1. 用户登录注册系统
2. "走进AI系列课"课程详情页
3. AI 助教基础功能
4. Blockly 编辑器集成

### P1（第二优先级）
1. 图像识别画板（固定 Agent）
2. 学习进度追踪
3. 项目保存功能
4. 教师后台基础功能

### P2（后续优化）
1. 语音助手画板
2. 机器人画板
3. 高级统计功能
4. 移动端优化

---

**文档版本**: v2.0
**最后更新**: 2025-10-25
**维护者**: witdot Development Team
**适用于**: Claude AI 编程助手
