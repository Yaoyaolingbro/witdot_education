import { Link } from 'react-router-dom';

/**
 * 画布编程主页
 * 展示所有可用的编程画板
 */
export default function CanvasCoding() {
  const canvasOptions = [
    {
      id: 'image-recognition',
      title: '🖼️ 图像识别画板',
      description: '上传图片，使用 AI 识别图片内容',
      badge: '固定 Agent',
      badgeColor: 'bg-purple-100 text-purple-700',
      path: '/canvas/image-recognition',
      difficulty: '⭐ 入门',
      features: [
        '学习图像识别原理',
        '体验 AI 视觉能力',
        '可视化编程实践'
      ],
      available: true
    },
    {
      id: 'voice-assistant',
      title: '🎤 语音助手画板',
      description: '创建自己的语音对话助手',
      badge: '即将推出',
      badgeColor: 'bg-gray-100 text-gray-500',
      path: '/canvas/voice-assistant',
      difficulty: '⭐⭐ 进阶',
      features: [
        '语音识别技术',
        'AI 对话生成',
        '语音合成体验'
      ],
      available: false
    },
    {
      id: 'robot',
      title: '🤖 机器人画板',
      description: '控制虚拟机器人移动和执行任务',
      badge: '即将推出',
      badgeColor: 'bg-gray-100 text-gray-500',
      path: '/canvas/robot',
      difficulty: '⭐⭐⭐ 高级',
      features: [
        '机器人控制逻辑',
        '动画编程',
        '复杂任务设计'
      ],
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎨 画布编程
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            使用可视化编程积木，创建你自己的 AI 智能体（Agent）
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm text-purple-700 font-medium">
            <span className="text-lg">✨</span>
            <span>让AI编程变得简单有趣</span>
          </div>
        </div>

        {/* 快速入门指南 */}
        <div className="max-w-4xl mx-auto mb-12 bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 animate-slideIn">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>什么是画布编程？</span>
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            画布编程是一种用拖拽积木的方式来编程的方法，就像搭积木一样简单！
            你可以用这些积木来创建各种有趣的 AI 程序，比如图像识别、语音助手等。
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-3xl">1️⃣</span>
              <div>
                <p className="font-semibold text-gray-800">选择画板</p>
                <p className="text-sm text-gray-600">选择一个你感兴趣的项目</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-3xl">2️⃣</span>
              <div>
                <p className="font-semibold text-gray-800">拖拽积木</p>
                <p className="text-sm text-gray-600">用积木搭建你的程序</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors">
              <span className="text-3xl">3️⃣</span>
              <div>
                <p className="font-semibold text-gray-800">运行测试</p>
                <p className="text-sm text-gray-600">看看你的 AI 程序效果</p>
              </div>
            </div>
          </div>
        </div>

        {/* 画板选项卡片 */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {canvasOptions.map((canvas, index) => (
            <div
              key={canvas.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                canvas.available
                  ? 'border-purple-200 hover:border-purple-400 hover:scale-105 cursor-pointer hover:-translate-y-1'
                  : 'border-gray-200 opacity-75'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-2 ${canvas.available ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' : 'bg-gray-300'}`} />
              <div className="p-6">
                {/* 标题和徽章 */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {canvas.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${canvas.badgeColor}`}>
                    {canvas.badge}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 mb-4 leading-relaxed">{canvas.description}</p>

                {/* 难度 */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {canvas.difficulty}
                  </span>
                </div>

                {/* 特性列表 */}
                <ul className="space-y-2 mb-6">
                  {canvas.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                {canvas.available ? (
                  <Link
                    to={canvas.path}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    开始创作 →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full text-center px-4 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    敬请期待
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 我的项目入口 */}
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/my-projects"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-all font-medium border-2 border-gray-200 hover:border-purple-400 transform hover:scale-105"
          >
            <span className="text-2xl">📁</span>
            <span>查看我的作品</span>
            <span className="text-purple-600">→</span>
          </Link>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
