🧠 witdot Education AI Platform — Intelligent Agent Learning System

项目简介 / Project Introduction

本项目旨在构建一个集 AI通识教育、画布编程（Canvas Coding）和智能体实验（Agent Lab） 于一体的教育智能社区网站，面向中小学及教师群体，提供可视化AI编程学习环境、课程管理与创作分享功能。平台核心理念是：让学生通过“搭积木”式的可视化编程方式，理解人工智能的工作原理，并能自主构建智能体（agent）进行交互与实验。

⸻

🌐 技术架构 / Tech Stack Overview

模块	技术栈	功能说明
前端	React + Vite + TailwindCSS + Blockly (or Scratch GUI)	页面渲染、课程交互界面、可视化编程模块
后端	Node.js + Express + MongoDB (Mongoose)	用户、课程、AI agent 数据管理与API服务
AI 模块	Claude / OpenAI API / HuggingFace	生成式对话、智能Agent决策与提示生成
文件存储	MongoDB GridFS / OSS	用户作品与编程项目保存
登录与鉴权	JWT + OAuth2	用户登录与权限控制


⸻

🧩 核心功能模块 / Core Modules

1. AI通识课程（AI Literacy Course）

目标用户： 小学（1–6年级）、初中学生
教学目标： 让学生理解人工智能的概念、算法基础与现实应用。

功能点：
	•	📚 课程中心：按年级划分（1-3年级、4-6年级、初中）
	•	🎓 “走进AI系列课”：图文+互动形式课程，可直接接入AI对话演示
	•	🧠 AI互动实验：基于 Claude/ChatGPT 的可控演示（如“AI识图”“语音识别演示”）
	•	📈 学习进度追踪：MongoDB 存储用户学习状态与分数
	•	🗂️ 教师端管理：课程发布、题目批改、作品展示

⸻

2. 画布编程课程（Canvas Coding Module）

简介：
为学生提供类似 Scratch 的可视化编程环境，用积木模块来实现简单的 AI agent 行为逻辑。支持教师选择不同主题画板。

功能分类：

模块类型	示例功能	技术实现
a. 图像识别画板	上传图片 → 模型分类 → 结果可视化	Blockly + REST API 调用图像识别模型
b. 语音助手画板	语音输入 → 语义识别 → 播报回复	Web Speech API + Claude Prompt 模拟
c. 机器人画板	控制虚拟机器人移动/交互	Canvas + Blockly 自定义Block指令

其他特点：
	•	🧱 支持 Blockly / Microsoft PXT / OpenBlock 等模块
	•	💾 项目保存至 MongoDB（代码块JSON + 用户ID）
	•	🔁 “固定Agent” 模式：可加载预设逻辑的Agent（例如“图像识别助手”）
	•	🚀 演示模式：学生点击“运行”后，Agent 执行逻辑动画化呈现

⸻

3. 智能体实验室（AI Agent Lab）

目标：
为学生提供一个“沙盒”环境，使用画布编程创建自己的智能体。

功能特性：
	•	🔍 Agent定义：名称、任务描述、输入输出类型
	•	🧩 逻辑拼搭：基于Blockly模块编辑任务流程（如识别 → 处理 → 输出）
	•	🧠 内置AI模块调用（Claude/OpenAI接口）
	•	🧾 Agent日志：展示运行过程、输出结果
	•	📤 导出功能：可导出JSON结构或分享链接

⸻

4. 教学管理与数据统计

面向教师用户的后台功能：
	•	课程发布、编辑、删除
	•	学生账号与作业管理
	•	作业批改系统（支持自动评分 + 教师评语）
	•	课程参与统计与成绩报表（基于 MongoDB 聚合）

⸻

5. 用户与作品系统
	•	用户注册 / 登录（JWT）
	•	用户角色：学生 / 教师 / 管理员
	•	学生可：
	•	参与课程学习
	•	使用画布创建编程作品
	•	上传项目封面、保存作品
	•	教师可：
	•	查看学生作品
	•	审核、点赞、留言
	•	MongoDB 存储结构示例：



⸻

⚙️ API 概要设计（简略）

Endpoint	Method	Description
/api/auth/register	POST	用户注册
/api/auth/login	POST	登录认证（JWT）
/api/courses	GET	获取所有课程
/api/projects	GET/POST	获取或保存学生编程作品
/api/agents/run	POST	执行 Agent 逻辑（调用 AI 模型）
/api/teachers/stats	GET	教师端数据统计


⸻

🎨 UI/UX 功能建议
	•	左侧导航栏：智能体 / 课程 / 实验室 / 我的作品
	•	画布编辑器：左侧积木分类 + 中间画布 + 右侧实时预览
	•	课程界面：章节目录 + 可交互AI演示 + 测试题
	•	作品展示页：学生作品画廊（支持点赞、评论）

⸻
