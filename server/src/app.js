const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { syncCoursesToDB } = require('./controllers/courseController');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();

// CORS 配置
const corsOptions = {
  origin: [
    'http://localhost:5432',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供课程资源（PPT、视频等）
app.use('/courses', express.static(path.join(__dirname, '../public/courses')));

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to witdot Education AI Platform API',
    version: '1.0.0',
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/ai', require('./routes/ai'));  // AI 助教路由
app.use('/api/records', require('./routes/records'));  // 学习记录路由
// app.use('/api/projects', require('./routes/projects'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);

  // 同步课程数据到数据库
  await syncCoursesToDB();
});

module.exports = app;
