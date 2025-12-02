import { Link } from 'react-router-dom';

/**
 * AI 视觉工坊主页
 * 展示图像识别实验室和 AI 创意生图两大功能模块
 */
export default function AiVisionHome() {
  const visionModules = [
    {
      id: 'image-lab',
      title: '图像识别实验室',
      emoji: '🔍',
      description: '上传图片，让 AI 识别图中的物体、文字、场景',
      badge: '百度 AI',
      badgeColor: 'bg-blue-100 text-blue-700',
      path: '/ai-vision/image-lab',
      difficulty: '⭐ 入门',
      features: [
        '通用物体识别',
        '文字识别 OCR',
        '人脸检测分析',
        '场景与地标识别'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      available: false // TODO: 后端接口完成后改为 true
    },
    {
      id: 'ai-art',
      title: 'AI 创意生图',
      emoji: '🎨',
      description: '输入文字描述，AI 为你生成独一无二的创意图像',
      badge: '本地 SD',
      badgeColor: 'bg-purple-100 text-purple-700',
      path: '/ai-vision/ai-art',
      difficulty: '⭐⭐ 进阶',
      features: [
        '文生图创作',
        '多种艺术风格',
        '图片尺寸自定义',
        '作品保存分享'
      ],
      gradient: 'from-purple-500 to-pink-500',
      available: false // TODO: 后端接口完成后改为 true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            👁️ AI 视觉工坊
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            从识别世界到创造世界，AI 助你实现想象
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm text-indigo-700 font-medium">
            <span className="text-lg">🚀</span>
            <span>探索 AI 视觉的无限可能</span>
          </div>
        </div>

        {/* 功能介绍卡片 */}
        <div className="max-w-4xl mx-auto mb-12 bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 animate-slideIn">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span>什么是 AI 视觉工坊？</span>
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            AI 视觉工坊是一个让你体验人工智能视觉能力的互动平台。
            你可以上传图片让 AI 识别其中的内容，也可以用文字描述让 AI 为你创作独特的图像作品！
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors">
              <span className="text-3xl">🔍</span>
              <div>
                <p className="font-semibold text-gray-800">图像识别</p>
                <p className="text-sm text-gray-600">让 AI 看懂图片中的一切</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-3xl">🎨</span>
              <div>
                <p className="font-semibold text-gray-800">AI 生图</p>
                <p className="text-sm text-gray-600">用想象力创造视觉作品</p>
              </div>
            </div>
          </div>
        </div>

        {/* 功能模块卡片 */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {visionModules.map((module, index) => (
            <div
              key={module.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                module.available
                  ? 'border-indigo-200 hover:border-indigo-400 hover:scale-105 cursor-pointer hover:-translate-y-1'
                  : 'border-gray-200 opacity-85'
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`h-3 bg-gradient-to-r ${module.gradient}`} />
              <div className="p-6">
                {/* 标题和徽章 */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">{module.emoji}</span>
                    <span>{module.title}</span>
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${module.badgeColor}`}>
                    {module.badge}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 mb-4 leading-relaxed">{module.description}</p>

                {/* 难度 */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {module.difficulty}
                  </span>
                </div>

                {/* 特性列表 */}
                <ul className="space-y-2 mb-6">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                {module.available ? (
                  <Link
                    to={module.path}
                    className={`block w-full text-center px-4 py-3 bg-gradient-to-r ${module.gradient} text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105`}
                  >
                    开始体验 →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full text-center px-4 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    即将上线
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 技术说明 */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span>技术亮点</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔗</div>
              <p className="font-medium text-gray-800">百度 AI 接口</p>
              <p className="text-sm text-gray-600">业界领先的图像识别能力</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🖥️</div>
              <p className="font-medium text-gray-800">本地 SD 模型</p>
              <p className="text-sm text-gray-600">稳定扩散模型本地部署</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="font-medium text-gray-800">数据安全</p>
              <p className="text-sm text-gray-600">图片数据本地处理</p>
            </div>
          </div>
        </div>
      </div>

      {/* 动画样式 */}
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
