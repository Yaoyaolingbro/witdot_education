# 静态资源目录说明

## 📂 目录结构

```
server/public/courses/
└── ai-literacy-primary-high/           # AI 通识课程资源
    ├── ppts/                           # PPT 文件目录
    │   ├── 01-创造你的机器人伙伴.pptx
    │   ├── 02-AI悄悄陪伴的一天.pptx
    │   ├── 03-电脑如何一眼认出猫.pptx
    │   ├── 04-动手教AI看图识物.pptx
    │   ├── 05-语音识别揭秘.pptx
    │   ├── 06-开口即魔法：语音AI实战.pptx
    │   ├── 07-AI机器人全能感官秀.pptx
    │   ├── 08-给小车装上AI大脑.pptx
    │   └── 10-AI未来号：梦想与底线.pptx
    └── videos/                         # 视频文件目录（待添加）
        ├── lesson-01.mp4
        ├── lesson-02.mp4
        └── ...
```

## 🌐 访问路径

### PPT 文件
- **服务器端路径**: `server/public/courses/ai-literacy-primary-high/ppts/`
- **访问 URL**: `http://localhost:3210/courses/ai-literacy-primary-high/ppts/文件名.pptx`

**示例**:
```
http://localhost:3210/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx
```

### 视频文件
- **服务器端路径**: `server/public/courses/ai-literacy-primary-high/videos/`
- **访问 URL**: `http://localhost:3210/courses/ai-literacy-primary-high/videos/文件名.mp4`

**示例**:
```
http://localhost:3210/courses/ai-literacy-primary-high/videos/lesson-01.mp4
```

## 📝 如何添加新课程资源

### 步骤 1: 创建课程文件夹
```bash
mkdir -p server/public/courses/新课程ID/ppts
mkdir -p server/public/courses/新课程ID/videos
```

### 步骤 2: 添加文件
将 PPT 和视频文件放入相应的目录：
```bash
cp 你的PPT文件.pptx server/public/courses/新课程ID/ppts/
cp 你的视频文件.mp4 server/public/courses/新课程ID/videos/
```

### 步骤 3: 更新课程配置
在 `server/data/courses/` 中创建或更新课程配置文件，确保路径正确：
```json
{
  "lessonId": "lesson-01",
  "videoUrl": "/courses/新课程ID/videos/lesson-01.mp4",
  "pptUrl": "/courses/新课程ID/ppts/01-课程名称.pptx"
}
```

## 🔧 技术实现

### Express 静态文件配置
在 `server/src/app.js` 中：
```javascript
app.use('/courses', express.static(path.join(__dirname, '../public/courses')));
```

这个配置的含义：
- URL 路径 `/courses` 映射到服务器目录 `server/public/courses`
- 浏览器访问 `/courses/xxx` 会自动从 `server/public/courses/xxx` 提供文件

## 📦 文件大小统计

当前 PPT 文件总大小: **122 MB**

各文件大小：
- 01-创造你的机器人伙伴.pptx: 61 MB
- 02-AI悄悄陪伴的一天.pptx: 7.5 MB
- 03-电脑如何一眼认出猫.pptx: 6.8 MB
- 04-动手教AI看图识物.pptx: 7.6 MB
- 05-语音识别揭秘.pptx: 8.2 MB
- 06-开口即魔法：语音AI实战.pptx: 7.5 MB
- 07-AI机器人全能感官秀.pptx: 7.8 MB
- 08-给小车装上AI大脑.pptx: 7.7 MB
- 10-AI未来号：梦想与底线.pptx: 8.4 MB

## ⚠️ 注意事项

1. **CORS 配置**: 静态文件会继承 Express 的 CORS 设置，前端可以直接访问
2. **文件命名**: 建议使用英文命名或确保服务器支持中文文件名
3. **视频格式**: 推荐使用 mp4 格式，兼容性最好
4. **文件大小**: 注意视频文件大小，建议单个文件不超过 100 MB
5. **备份**: 建议定期备份 `public/courses` 目录

## 🎥 添加视频文件

当你准备好视频文件后，按以下步骤添加：

```bash
# 1. 复制视频文件到对应目录
cp lesson-01.mp4 server/public/courses/ai-literacy-primary-high/videos/

# 2. 验证文件
ls -lh server/public/courses/ai-literacy-primary-high/videos/

# 3. 重启服务器（如果需要）
cd server && npm run dev
```

视频文件会自动通过静态文件服务提供，前端可以直接在 `<video>` 标签中使用。

## 🔗 前端使用方式

### 视频播放
```jsx
<video controls>
  <source src="/courses/ai-literacy-primary-high/videos/lesson-01.mp4" type="video/mp4" />
</video>
```

### PPT 下载/打开
```jsx
<a
  href="/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx"
  target="_blank"
>
  打开 PPT
</a>
```

或使用 JavaScript:
```javascript
window.open('/courses/ai-literacy-primary-high/ppts/01-创造你的机器人伙伴.pptx', '_blank');
```
