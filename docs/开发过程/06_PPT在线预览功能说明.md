# PPT 在线预览功能说明

## 🎯 功能概述

已实现 PPT 在线预览功能，用户点击"打开课程 PPT"按钮后，会在网页中直接打开 PPT 查看器，而不是下载文件。

## 📦 实现方案

### 组件架构
创建了专门的 `PPTViewer` 组件（`client/src/components/PPTViewer.jsx`），支持：
- ✅ 全屏模态框预览
- ✅ 内嵌预览模式（适用于本地开发）
- ✅ Office Online 预览模式（适用于生产环境）
- ✅ 下载功能
- ✅ 响应式设计

### 三种查看模式

#### 1. 内嵌预览模式（推荐用于本地开发）
- 使用 iframe 直接嵌入 PPT 文件
- 优点：无需外部服务，适合本地开发
- 缺点：浏览器对 .pptx 文件的原生支持有限

#### 2. Office Online 预览模式（推荐用于生产环境）
- 使用 Microsoft Office Online Viewer
- URL 格式：`https://view.officeapps.live.com/op/embed.aspx?src=<PPT_URL>`
- 优点：完整的 PPT 功能支持、动画、切换效果
- 缺点：需要公网可访问的 URL

#### 3. 下载模式
- 保留原有的下载功能
- 用户可以下载后用本地 Office/WPS 打开

## 🎨 用户界面

### PPT 查看器特性
```
┌─────────────────────────────────────────────────┐
│  PPT 预览  [内嵌预览] [Office在线]  [下载] [✕]  │ ← 工具栏
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│               PPT 内容显示区域                   │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  💡 提示：如果预览无法正常显示...                │ ← 底部提示
└─────────────────────────────────────────────────┘
```

### 功能按钮
1. **内嵌预览** - 本地开发推荐
2. **Office 在线** - 生产环境推荐（需要公网 URL）
3. **下载按钮** - 下载 PPT 到本地
4. **关闭按钮** - 关闭查看器

## 🚀 使用方法

### 用户操作流程
1. 访问课程页面：http://localhost:5432/courses
2. 点击课程进入课程详情
3. 点击任意章节进入学习页面
4. 点击"打开课程 PPT"按钮
5. **PPT 查看器会以全屏模态框形式弹出**
6. 可以：
   - 切换查看模式
   - 下载 PPT
   - 关闭查看器继续学习

### 开发者使用
在任何组件中使用 PPTViewer：

```jsx
import PPTViewer from '../components/PPTViewer';

function MyComponent() {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <>
      <button onClick={() => setShowViewer(true)}>
        查看 PPT
      </button>

      {showViewer && (
        <PPTViewer
          pptUrl="/courses/xxx/ppts/xxx.pptx"
          title="PPT 标题"
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}
```

## 📁 文件结构

```
client/src/
├── components/
│   └── PPTViewer.jsx          # PPT 查看器组件（新增）
└── pages/
    └── LessonDetail.jsx       # 章节详情页（已更新）
```

### 关键代码修改

#### LessonDetail.jsx
```jsx
import PPTViewer from '../components/PPTViewer';

// 添加状态
const [showPPTViewer, setShowPPTViewer] = useState(false);

// 修改按钮处理
const handleOpenPPT = () => {
  setShowPPTViewer(true);
};

// 渲染查看器
{showPPTViewer && (
  <PPTViewer
    pptUrl={lessonData.lesson.pptUrl}
    title={lessonData.lesson.title}
    onClose={() => setShowPPTViewer(false)}
  />
)}
```

## 🔧 技术细节

### Props 接口
```typescript
interface PPTViewerProps {
  pptUrl: string;      // PPT 文件 URL（相对或绝对路径）
  title?: string;      // PPT 标题
  onClose: () => void; // 关闭回调函数
}
```

### URL 处理
PPTViewer 组件会自动处理 URL：
- 如果是相对路径（如 `/courses/...`），会自动拼接后端地址
- 如果是完整 URL（如 `http://...`），直接使用

```javascript
const getFullPPTUrl = () => {
  if (pptUrl.startsWith('http')) {
    return pptUrl; // 已经是完整 URL
  }
  // 拼接后端地址
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');
  return apiBaseUrl + pptUrl;
};
```

### 查看模式实现

#### 内嵌预览
```jsx
<iframe
  src={getFullPPTUrl()}
  className="w-full h-full"
  title={title}
/>
```

#### Office Online 预览
```jsx
<iframe
  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`}
  className="w-full h-full"
  title={title}
/>
```

## ⚠️ 注意事项

### 本地开发环境限制

1. **Office Online Viewer 限制**
   - 需要公网可访问的 URL
   - `localhost` 和内网 IP 无法使用
   - 仅适用于生产环境

2. **浏览器兼容性**
   - 不同浏览器对 .pptx 文件的支持不同
   - Chrome：可能直接下载
   - Firefox：可能弹出下载对话框
   - Safari：可能尝试在浏览器中打开（但支持有限）

3. **推荐方案**
   - **本地开发**：使用"内嵌预览"或"下载"功能
   - **生产环境**：使用"Office 在线"模式

## 🌐 生产环境部署

### 步骤 1: 确保 PPT 文件可公网访问
```bash
# 部署后端静态文件
# 确保 https://你的域名.com/courses/... 可访问
```

### 步骤 2: 更新环境变量
```bash
# 生产环境 .env
VITE_API_URL=https://api.你的域名.com/api
```

### 步骤 3: 使用 Office Online 模式
用户可以在 PPT 查看器中切换到"Office 在线"模式，获得完整的 PPT 预览体验。

## 🧪 测试步骤

### 1. 重启前端服务器
```bash
cd client
npm run dev
```

### 2. 测试查看功能
1. 访问 http://localhost:5432/courses
2. 进入"AI 通识教育课程"
3. 点击第一章"创造你的机器人伙伴"
4. 点击"打开课程 PPT"按钮
5. 验证：
   - ✅ 全屏模态框弹出
   - ✅ 工具栏按钮正常
   - ✅ 可以切换查看模式
   - ✅ 下载按钮正常工作
   - ✅ 关闭按钮可以关闭查看器

### 3. 测试不同模式
- **内嵌预览**：测试 iframe 是否加载
- **Office 在线**：查看提示信息（本地环境会显示警告）
- **下载**：测试文件是否正常下载

## 🐛 故障排查

### 问题 1: PPT 查看器无法打开
**检查**:
- 控制台是否有报错
- `showPPTViewer` 状态是否正确切换
- PPTViewer 组件是否正确导入

### 问题 2: PPT 内容无法显示
**原因**: 浏览器不支持直接预览 .pptx 文件

**解决方案**:
1. 使用"下载"功能
2. 生产环境使用"Office 在线"模式
3. 考虑将 PPT 转换为 PDF 格式

### 问题 3: Office Online 无法使用
**原因**: 需要公网可访问的 URL

**解决方案**:
- 本地开发：使用"内嵌预览"或"下载"
- 生产环境：确保 PPT 文件部署到公网

## 🔮 未来优化方向

1. **PDF 转换**
   - 后端将 PPT 转换为 PDF
   - 浏览器原生支持 PDF 预览
   - 兼容性更好

2. **图片预览**
   - 将 PPT 每一页转换为图片
   - 创建图片轮播查看器
   - 加载速度更快

3. **缓存优化**
   - 缓存已查看的 PPT
   - 减少重复加载

4. **进度记录**
   - 记录用户查看到第几页
   - 下次打开自动跳转

## 📊 对比表

| 功能 | 原方案（下载） | 新方案（在线预览） |
|------|--------------|------------------|
| 用户体验 | 需要下载，打开本地软件 | 直接在网页中查看 |
| 加载速度 | 下载完整文件 | 在线加载 |
| 离线使用 | ✅ 支持 | ❌ 需要网络 |
| 移动端 | ❌ 可能无法打开 | ✅ 网页预览 |
| 占用空间 | 占用本地存储 | 无需本地存储 |
| 动画效果 | ✅ 完整支持 | ⚠️ 取决于预览方式 |

---

**版本**: v0.5.0
**更新时间**: 2025-10-26
**状态**: ✅ 已完成并测试
