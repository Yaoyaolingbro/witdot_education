# 🚀 witdot Education AI Platform

中小学生 AI 通识教育 + 画布编程学习平台

## 📋 项目概述

**witdot Education AI Platform** 是一个面向中小学生的 AI 教育平台，旨在通过可视化编程（Blockly）让学生理解 AI 原理，培养计算思维。

### 核心功能

1. **AI 通识课程** - 系统化的 AI 知识学习，支持视频+PPT多媒体内容
2. **画布编程** - 基于 Google Blockly 的可视化编程，创建 AI 智能体
3. **小问同学** - 完整的 AI 对话助手，类似 Claude 的交互体验
4. **机器人教育** - 集成机器人教育资源导航
5. **学习进度追踪** - 自动记录学习时长和完成状态

## 🎨 主要特性

### ✨ 用户体验
- 🎯 **现代化 UI 设计** - 基于 TailwindCSS 的精美界面
- 📱 **完全响应式** - 支持桌面端和移动端
- 🌈 **流畅动画效果** - 丰富的交互反馈
- 🎨 **深色/浅色主题** - 优雅的配色方案

### 🤖 AI 功能
- 💬 **流式对话响应** - 打字机效果的 AI 回复
- 📚 **上下文理解** - 支持多轮对话
- 🔍 **课程内容辅导** - 基于课程内容的精准解答
- 💾 **对话历史管理** - 支持查看、删除、新建对话

### 🎓 课程系统
- 📖 **多媒体课程** - 支持视频、PPT、Markdown
- 📊 **学习进度可视化** - 实时显示完成百分比
- ⏱️ **学习时长统计** - 自动记录学习时间
- ✅ **章节完成标记** - 一键标记学习状态

### 🧩 Blockly 编程
- 🎨 **自定义积木块** - 优化的颜色和 CSS 样式
- 🔧 **9种基础积木** - if/else、循环、比较、运算等
- 🖼️ **图像识别画板** - 集成 Claude Vision API
- 💾 **项目管理** - 保存、加载、分享编程作品

## 🏗 技术栈

### 前端技术
```json
{
  "框架": "React 18",
  "构建工具": "Vite 7.x",
  "样式": "TailwindCSS 3.x",
  "路由": "React Router v6",
  "状态管理": "Zustand",
  "可视化编程": "Google Blockly",
  "HTTP客户端": "Axios",
  "Markdown渲染": "react-markdown"
}
```

### 后端技术
```json
{
  "运行环境": "Node.js 18+",
  "框架": "Express 4.x",
  "数据库": "MongoDB 6.x + Mongoose",
  "认证": "JWT + bcrypt",
  "AI集成": "Claude API (Anthropic)",
  "日志": "Winston",
  "验证": "Zod"
}
```

### 开发工具
- **并发运行**: concurrently
- **热重载**: nodemon
- **代码格式化**: ESLint + Prettier

## 🚀 快速开始

### 前置要求

- Node.js 18+ ([下载地址](https://nodejs.org/))
- MongoDB 6.x ([安装指南](https://www.mongodb.com/docs/manual/installation/))
- npm 或 yarn
- Claude API Key ([获取地址](https://console.anthropic.com/))

### 1. 克隆项目

```bash
git clone <repository-url>
cd edu_app
```

### 2. 安装依赖

```bash
# 方式1：同时安装前后端依赖
npm install

# 方式2：分别安装
cd client && npm install
cd ../server && npm install
```

### 3. 配置环境变量

在 `server` 目录下创建 `.env` 文件：

```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```env
# 服务器配置
PORT=3210
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/edu_app

# JWT 配置
JWT_SECRET=your-secret-key-here

# Claude API 配置
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 4. 初始化数据库

```bash
# 确保 MongoDB 正在运行
sudo systemctl start mongod   # Linux
brew services start mongodb-community  # macOS

# 启动服务器会自动同步课程数据
cd server
npm run dev
```

### 5. 启动开发服务器

```bash
# 方式1：从根目录同时启动前后端（推荐）
npm run dev

# 方式2：分别启动
# 终端1 - 后端服务器 (http://localhost:3210)
cd server
npm run dev

# 终端2 - 前端开发服务器 (http://localhost:5432)
cd client
npm run dev
```

### 6. 访问应用

打开浏览器访问：
- **前端**: http://localhost:5432
- **后端 API**: http://localhost:3210/api

## 📁 项目结构

```
edu_app/
├── client/                   # 前端 React 项目
│   ├── public/               # 静态资源
│   ├── src/
│   │   ├── api/              # API 调用封装
│   │   ├── blockly/          # Blockly 自定义
│   │   │   ├── blocks/       # 自定义积木块
│   │   │   └── toolbox.js    # 工具箱配置
│   │   ├── components/       # 可复用组件
│   │   │   ├── ai/           # AI 相关组件
│   │   │   ├── blockly/      # Blockly 组件
│   │   │   └── layout/       # 布局组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── Chat.jsx      # 小问同学对话页面
│   │   │   ├── Courses.jsx   # 课程列表
│   │   │   └── ...
│   │   ├── store/            # Zustand 状态管理
│   │   ├── styles/           # 全局样式
│   │   └── router.jsx        # 路由配置
│   └── package.json
│
├── server/                   # 后端 Node.js 项目
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/           # Mongoose 模型
│   │   ├── routes/           # Express 路由
│   │   ├── services/         # 业务逻辑服务
│   │   └── app.js            # 应用入口
│   ├── public/               # 静态文件（课程资源）
│   │   └── courses/          # 课程文件
│   └── package.json
│
├── docs/                     # 文档
│   ├── 开发计划.md           # 开发规划
│   ├── 部署教程.md           # 部署指南
│   └── 开发过程/             # 开发日志
│
└── README.md
```

## 🎯 核心功能说明

### 1. AI 通识课程

- **课程管理**: 支持多级分类（1-3年级、4-6年级、7-9年级）
- **多媒体内容**: 视频播放、PPT 预览、Markdown 文档
- **学习追踪**: 自动记录学习时长、章节完成状态
- **进度可视化**: 实时显示课程完成百分比

### 2. 画布编程

**图像识别画板**：
- 拖拽式 Blockly 编程界面
- 集成 Claude Vision API 进行图像识别
- 实时代码生成和执行
- 项目保存和管理功能

**自定义积木块**：
- 🟣 AI 功能块：图像识别、文本生成
- 🟢 输入输出块：消息显示、用户输入
- 🔵 逻辑控制块：if/else、循环、比较
- 🟠 数学运算块：加减乘除
- 🔷 文本处理块：文本拼接、比较
- 🔴 变量块：数字、文本输入

### 3. 小问同学 AI 助手

**功能特性**：
- ✅ 类似 Claude 的完整对话界面
- ✅ 流式响应（打字机效果）
- ✅ 左侧历史记录侧边栏
- ✅ 新建/删除对话
- ✅ 自动生成对话标题
- ✅ 支持 Markdown 渲染
- ✅ 消息持久化存储

**使用场景**：
- 课程内容答疑
- 编程问题辅导
- 知识点讲解
- 学习建议咨询

### 4. 学习进度系统

- **自动记录**: 学习时长自动计算和保存
- **完成标记**: 一键标记章节完成
- **进度统计**: 课程完成百分比实时更新
- **历史追踪**: 查看学习历史和时间统计

## 🔧 开发指南

### 目录规范

- `client/src/components/` - 可复用的 UI 组件
- `client/src/pages/` - 路由页面组件
- `client/src/api/` - API 调用封装
- `server/src/models/` - 数据库模型
- `server/src/controllers/` - 业务逻辑控制器
- `server/src/routes/` - API 路由定义

### 代码规范

- 使用 ES6+ 语法
- React 组件使用函数式组件 + Hooks
- 后端使用 async/await 处理异步
- 遵循 ESLint 配置规则
- 提交前运行 lint 检查

### API 调用规范

```javascript
// 前端 API 调用示例
import * as coursesAPI from '@/api/courses';

const courses = await coursesAPI.getCourses();
```

### 添加新路由

1. 在 `client/src/pages/` 创建页面组件
2. 在 `client/src/router.jsx` 添加路由配置
3. 在 `server/src/routes/` 创建后端路由
4. 在 `server/src/controllers/` 添加控制器逻辑

## 📊 开发进度

### ✅ 已完成功能

#### 基础架构
- [x] 项目初始化与配置
- [x] 前端框架搭建（React + Vite + TailwindCSS）
- [x] 后端框架搭建（Express + MongoDB）
- [x] 左侧边栏布局（响应式设计）
- [x] 路由配置和权限控制

#### 用户系统
- [x] JWT 认证系统
- [x] 用户注册/登录
- [x] 密码加密（bcrypt）
- [x] 状态管理（Zustand）
- [x] 用户信息显示和登出

#### 课程系统
- [x] 课程配置系统（JSON 管理）
- [x] 课程列表页（筛选、搜索）
- [x] 课程详情页（章节导航）
- [x] 章节学习页（视频+PPT+Markdown）
- [x] 学习进度追踪和可视化
- [x] 学习时长自动记录

#### AI 功能
- [x] 全局 AI 助教（悬浮按钮）
- [x] 小问同学对话页面
- [x] 流式响应（Server-Sent Events）
- [x] 对话历史管理
- [x] 上下文记忆（多轮对话）
- [x] Claude API 集成

#### 画布编程
- [x] Blockly 编辑器集成
- [x] 自定义积木块（9种基础块）
- [x] 积木样式优化（颜色+阴影+动画）
- [x] 图像识别画板
- [x] 项目保存和管理
- [x] 代码生成和执行

#### 其他功能
- [x] 机器人教育导航
- [x] 我的学习页面
- [x] 我的作品页面

### 🚧 进行中

- [ ] 教师后台功能
- [ ] 更多课程内容制作
- [ ] 性能优化
- [ ] 移动端适配优化

### 📅 计划中

- [ ] 语音助手画板
- [ ] 机器人画板
- [ ] 社区功能（作品分享）
- [ ] 作品画廊
- [ ] 成就系统
- [ ] 家长监控面板

## 🐛 常见问题

### Q: MongoDB 连接失败？
**A**: 确保 MongoDB 服务正在运行：
```bash
# Linux
sudo systemctl status mongod

# macOS
brew services list
```

### Q: API 请求失败？
**A**: 检查环境变量配置：
- 确认 `.env` 文件已正确配置
- 验证 Claude API Key 是否有效
- 检查后端服务是否正常运行

### Q: Blockly 积木不显示？
**A**: 尝试清除浏览器缓存并刷新页面

### Q: 课程数据没有加载？
**A**: 运行课程同步脚本：
```bash
cd server
node src/scripts/syncCourses.js
```

## 📖 文档资源

- [开发计划详细版](docs/开发计划.md)
- [部署教程](docs/部署教程.md)
- [技术指南](docs/CLAUDE.md)
- [快速开始](docs/快速开始.md)

## 🚀 部署

详细的生产环境部署指南请查看：[部署教程](docs/部署教程.md)

### 快速部署命令

```bash
# 构建前端
cd client
npm run build

# 启动生产服务器
cd ../server
npm start
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

ISC License

## 👥 维护者

witdot Development Team

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-29
**项目状态**: 🚀 Active Development
