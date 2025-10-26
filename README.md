# 🚀 witdot Education AI Platform

中小学生 AI 通识教育 + 画布编程学习平台

## 📋 项目概述

**witdot Education AI Platform** 是一个面向中小学生的 AI 教育平台，旨在通过可视化编程（Blockly）让学生理解 AI 原理，培养计算思维。

### 核心功能

1. **AI 通识课程** - 系统化的 AI 知识学习
2. **画布编程** - 可视化编程创建 AI 智能体
3. **AI 助教** - 智能学习辅助

## 🏗 技术栈

### 前端
- **框架**: React 18
- **构建工具**: Vite
- **样式**: TailwindCSS
- **路由**: React Router v6
- **状态管理**: Zustand
- **可视化编程**: Google Blockly

### 后端
- **运行环境**: Node.js 18+
- **框架**: Express
- **数据库**: MongoDB + Mongoose
- **认证**: JWT + bcrypt

## 🚀 快速开始

### 前置要求

- Node.js 18+
- MongoDB
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 配置环境变量

```bash
# 在 server 目录下
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 启动开发服务器

```bash
# 启动后端服务器 (端口 3210)
cd server
npm run dev

# 在新终端启动前端开发服务器 (端口 5432)
cd client
npm run dev
```

访问 http://localhost:5432 查看应用

## 📁 项目结构

```
edu_app/
├── client/                 # 前端 React 项目
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── api/            # API 调用
│   │   ├── store/          # 状态管理
│   │   └── blockly/        # Blockly 自定义
│   └── package.json
│
├── server/                 # 后端 Node.js 项目
│   ├── src/
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置
│   └── package.json
│
└── docs/                   # 文档
    ├── CLAUDE.md           # 技术指南
    └── 开发计划.md         # 开发计划
```

## 📖 开发文档

- [技术指南](docs/CLAUDE.md)
- [开发计划](docs/开发计划.md)
- [快速开始](docs/快速开始.md)
- [布局重构总结](docs/布局重构总结.md)
- [布局快速参考](docs/布局快速参考.md)

## 🎯 开发进度

### ✅ 已完成
- [x] 项目初始化
- [x] 前端框架搭建（React + Vite + TailwindCSS）
- [x] 后端框架搭建（Express + MongoDB）
- [x] **左侧边栏布局**（Sidebar + Topbar）✨
- [x] 完全响应式设计（桌面端 + 移动端）
- [x] 路由配置
- [x] 数据库模型设计（User, Course, Project）
- [x] 现代化 UI 优化
- [x] **用户认证系统** ✨ 新增
  - JWT Token 认证
  - 注册/登录功能
  - 密码加密（bcrypt）
  - Zustand 状态管理
  - 用户信息显示和登出

### 🚧 进行中
- [ ] AI 通识课程模块
- [ ] 学习进度追踪
- [ ] Blockly 编辑器集成

### 📅 计划中
- [ ] AI 助教功能
- [ ] 图像识别画板
- [ ] 教师后台

## 🤝 贡献指南

欢迎贡献代码！请查看 [开发计划](docs/开发计划.md) 了解详细信息。

## 📄 许可证

ISC

## 👥 维护者

witdot Development Team

---

**文档版本**: v0.3.0
**最后更新**: 2025-10-26
