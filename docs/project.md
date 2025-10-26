🧠 Claude Prompt 模板：witdot AI 教育智能体平台（React + MongoDB + Blockly）

⸻

🔷 项目名称

witdot Education AI Platform
教育智能体创新大赛配套系统：AI通识课程 + 画布编程 + 智能体实验平台

⸻

🔧 技术架构说明

前端： React + Vite + TailwindCSS + Blockly（或 OpenBlock / Scratch-GUI）
后端： Node.js + Express + MongoDB (Mongoose ODM)
AI模块： Claude / OpenAI API 接口，用于AI助教、语音助手、识图解释等功能
部署目标： Web 端（桌面优先），后续可扩展为校园专用AI学习平台

⸻

🧩 功能总览

1️⃣ AI 通识课程模块

目标：让小学生/初中生通过趣味课程认识AI。

主要功能：
	•	年级分类：1–3年级、4–6年级、初中课程
	•	课程类型：
	•	“走进AI”系列课：展示AI基础知识与互动演示
	•	图文+视频课程支持
	•	AI对话演示（Claude / ChatGPT）嵌入
	•	教师端：
	•	创建/编辑课程
	•	管理课程内容（标题、简介、章节列表）
	•	管理学生进度、统计数据
	•	学生端：
	•	学习课程、查看进度
	•	完成测验/问答题（支持客观题自动判分）
	•	AI助教功能（“我不懂，请帮我讲解”）

⸻

2️⃣ 画布编程模块（Canvas Coding）

目标：为学生提供类似 Scratch 的可视化编程体验，用于构建智能体。

参考开源库：
	•	google/blockly
	•	microsoft/pxt
	•	openblockcc/openblock
	•	scratchfoundation/scratch-gui

主要功能：
	•	画布类型：
	1.	图像识别画板（上传图片 → AI识图 → 显示结果）
	2.	语音助手画板（语音输入 → 文本识别 → Claude响应）
	3.	机器人画板（控制虚拟角色移动、发声）
	•	Blockly 自定义模块：
	•	控制逻辑（if/else, loop, wait）
	•	输入模块（语音、图像、传感器模拟）
	•	AI 模块（文本生成、图像识别）
	•	执行环境：
	•	用户可点击“运行”按钮执行逻辑
	•	动画化输出（如机器人移动）
	•	数据持久化：
	•	将Blockly项目以JSON结构存入MongoDB
	•	支持加载、保存、分享、导出

⸻

3️⃣ 智能体实验室（AI Agent Lab）

目标：让学生用画布创建“固定步骤”的智能体（Agent）。

功能点：
	•	Agent定义（名称、任务、输入输出类型）
	•	逻辑编辑（可视化积木编程）
	•	一键运行Agent（如语音识别助手 / 图像识别助手）
	•	Agent结果展示（输出对话、图片或动画）
	•	可保存Agent为模板（JSON结构）
	•	MongoDB 结构示例：

{
  "agentName": "语音识别助手",
  "blocks": "{Blockly JSON结构}",
  "creatorId": "user123",
  "createdAt": "2025-10-25T00:00:00Z"
}


⸻

4️⃣ 教学与管理后台

目标：为教师提供教学监控与课程管理功能。

功能点：
	•	教师身份登录（JWT）
	•	学生列表与学习进度查看
	•	作业批改系统（学生作品可打分）
	•	课程创建、编辑与下线
	•	AI自动批改作文模块（后端接入Claude文本评估）

⸻

5️⃣ 用户系统与作品展示

功能：
	•	注册 / 登录（支持邮箱或学号）
	•	用户角色：学生 / 教师 / 管理员
	•	我的课程 / 我的作品
	•	作品画廊展示区（作品可预览、点赞、评论）
	•	MongoDB 存储结构：

{
  "user": { "id": "xxx", "role": "student" },
  "project": {
      "title": "图像识别画板",
      "category": "CanvasCoding",
      "blocks": "{Blockly JSON}",
      "createdAt": "2025-10-25"
  }
}


⸻

⚙️ API设计建议

Endpoint	Method	描述
/api/auth/register	POST	注册用户
/api/auth/login	POST	登录（JWT认证）
/api/courses	GET / POST	获取或创建课程
/api/lessons/:id	GET	获取单门课程详情
/api/blocks/save	POST	保存Blockly项目
/api/blocks/load/:id	GET	加载用户项目
/api/agents/run	POST	运行智能体逻辑（调用Claude/OpenAI）
/api/teachers/stats	GET	获取教师统计数据
/api/feedback	POST	提交AI助教反馈/测验结果


⸻

💾 数据库设计（MongoDB）

集合结构：
	1.	users：保存用户信息（id, name, role, progress, createdAt）
	2.	courses：课程信息（title, gradeLevel, sections, materials）
	3.	projects：Blockly作品（userId, blocks, previewUrl）
	4.	agents：AI Agent定义（名称、逻辑JSON、作者）
	5.	records：学习记录（userId, courseId, progress, score）

⸻

🎨 前端页面结构（React）

src/
 ├── components/
 │    ├── Navbar.jsx
 │    ├── CourseCard.jsx
 │    ├── BlocklyEditor.jsx
 │    └── AgentRunner.jsx
 ├── pages/
 │    ├── Home.jsx
 │    ├── Courses.jsx
 │    ├── CanvasCoding.jsx
 │    ├── AgentLab.jsx
 │    ├── Login.jsx
 │    ├── Register.jsx
 │    ├── TeacherDashboard.jsx
 │    └── Profile.jsx
 ├── api/
 │    ├── auth.js
 │    ├── course.js
 │    ├── project.js
 │    └── agent.js
 ├── utils/
 │    ├── request.js
 │    └── jwt.js
 ├── App.jsx
 └── main.jsx


⸻

🧠 Claude 任务目标

请根据以上文档，生成一个完整的 React + Express + MongoDB 项目初始化结构，包括：
	1.	前端（React）
	•	主页面框架
	•	课程页与画布编程页的路由
	•	Blockly 集成示例（如自定义积木和执行逻辑）
	•	登录注册页（JWT）
	2.	后端（Node + Express）
	•	API路由（用户、课程、项目、Agent）
	•	MongoDB 数据模型（使用 Mongoose）
	•	Agent执行接口（可连接Claude/OpenAI API）
	3.	示例演示：
	•	一个“图像识别画板”Agent 示例
	•	使用固定Prompt的 Claude API 调用演示（POST /api/agents/run）

⸻

🚀 最终输出目标

Claude 输出内容包括：
	•	完整的项目文件夹结构
	•	关键文件示例代码（React组件、API路由、Mongoose模型）
	•	一份 README.md，介绍安装、运行步骤与依赖说明
