# PPT 打开功能修复报告

## 🔍 问题诊断

### 原始问题
用户在课程页面点击"打开 PPT"按钮后，无法正常打开 PPT 文件。

### 根本原因
前端使用的是**相对路径** `/courses/...`，但由于：
- 前端运行在 `http://localhost:5432`
- 后端（静态文件服务）运行在 `http://localhost:3210`

浏览器会将相对路径解析为前端地址，导致访问失败。

## ✅ 修复方案

### 1. 修改前端代码
在 `client/src/pages/LessonDetail.jsx` 中添加 URL 转换函数：

```javascript
// 将相对路径转换为完整的后端 URL
const getFullResourceUrl = (relativePath) => {
  if (!relativePath) return null;
  const apiBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  return apiBaseUrl + relativePath;
};
```

### 2. 更新 PPT 打开逻辑
```javascript
const handleOpenPPT = () => {
  if (lessonData?.lesson?.pptUrl) {
    const pptFullUrl = getFullResourceUrl(lessonData.lesson.pptUrl);
    console.log('打开 PPT:', pptFullUrl);
    window.open(pptFullUrl, '_blank');
  }
};
```

### 3. 更新视频 URL
```javascript
<source src={getFullResourceUrl(lesson.videoUrl)} type="video/mp4" />
```

## 📊 URL 转换示例

### 转换前（错误）
- 配置文件: `/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx`
- 浏览器解析: `http://localhost:5432/courses/...` ❌ （前端服务器，文件不存在）

### 转换后（正确）
- 环境变量: `VITE_API_URL=http://localhost:3210/api`
- 去除 `/api`: `http://localhost:3210`
- 拼接路径: `http://localhost:3210/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx` ✅

## 🧪 测试步骤

### 1. 重启前端服务器
代码已修改，需要重启前端以应用更改：

```bash
# 在前端终端按 Ctrl+C 停止
# 然后重新启动
cd client
npm run dev
```

### 2. 测试 PPT 打开功能

1. 访问课程列表：http://localhost:5432/courses
2. 点击"AI 通识教育课程"
3. 点击任意章节，例如"创造你的机器人伙伴"
4. 点击页面下方的"打开课程 PPT"按钮
5. **查看浏览器控制台**（F12），应该看到：
   ```
   打开 PPT: http://localhost:3210/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx
   ```
6. PPT 文件应该在新窗口打开或开始下载

### 3. 后端验证（已通过）
```bash
curl -I "http://localhost:3210/courses/ai-literacy-primary-high/ppts/02-AI悄悄陪伴的一天.pptx"
# 返回: HTTP/1.1 200 OK ✅
```

## 🔧 故障排查

### 问题 1: PPT 仍然无法打开

**检查项**:
1. 确认后端服务器正在运行
2. 确认前端服务器已重启
3. 打开浏览器控制台（F12）查看：
   - Console 标签：查看打印的 URL
   - Network 标签：查看请求状态

**调试命令**:
```bash
# 测试后端静态文件访问
curl -I http://localhost:3210/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx
```

### 问题 2: URL 格式错误

**检查环境变量**:
```bash
cat client/.env
# 应该看到: VITE_API_URL=http://localhost:3210/api
```

### 问题 3: 中文文件名问题

浏览器会自动对 URL 进行编码，中文字符会转换为 `%E6%82%84...` 格式，这是正常的。

**测试**:
```bash
# 手动测试 URL 编码后的访问
curl -I "http://localhost:3210/courses/ai-literacy-primary-high/ppts/01-%E5%88%9B%E9%80%A0%E4%BD%A0%E7%9A%84%E6%9C%BA%E5%99%A8%E4%BA%BA%E4%BC%99%E4%BC%B4.pptx"
```

## 📝 配置文件检查

### JSON 配置（正确）
`server/data/courses/ai-literacy-primary-high.json`:
```json
{
  "lessons": [
    {
      "lessonId": "lesson-01",
      "pptUrl": "/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx",
      "videoUrl": "/courses/ai-literacy-primary-high/videos/lesson-01.mp4"
    }
  ]
}
```

路径应该：
- ✅ 以 `/courses/` 开头
- ✅ 使用实际的文件名（包括中文）
- ❌ 不要使用完整 URL（如 `http://localhost:3210/...`）

### Express 静态配置（正确）
`server/src/app.js`:
```javascript
app.use('/courses', express.static(path.join(__dirname, '../public/courses')));
```

## 🎯 预期结果

### 成功的表现
1. 点击"打开课程 PPT"按钮
2. 浏览器控制台显示完整 URL
3. 新窗口打开 PPT 文件或开始下载
4. 文件大小符合预期（例如：61 MB）

### 浏览器行为
- **Chrome/Edge**: 通常会直接下载 .pptx 文件
- **Firefox**: 可能会弹出下载对话框
- **Safari**: 可能会尝试在浏览器中打开（但 .pptx 不支持）

## 📊 完整的 URL 映射表

| 章节 | 配置路径 | 完整 URL |
|------|---------|---------|
| 第1章 | `/courses/.../01-创造你的机器人伙伴.pptx` | `http://localhost:3210/courses/.../01-创造你的机器人伙伴.pptx` |
| 第2章 | `/courses/.../02-AI悄悄陪伴的一天.pptx` | `http://localhost:3210/courses/.../02-AI悄悄陪伴的一天.pptx` |
| ... | ... | ... |

## ✅ 修复总结

1. **根本问题**: 跨端口资源访问
2. **解决方案**: 前端拼接完整后端 URL
3. **实现方式**: 使用环境变量 + URL 转换函数
4. **适用范围**: PPT 和视频文件都已修复

---

**修复完成时间**: 2025-10-26
**修改文件**: `client/src/pages/LessonDetail.jsx`
**测试状态**: 后端访问验证通过 ✅
**下一步**: 重启前端并测试
