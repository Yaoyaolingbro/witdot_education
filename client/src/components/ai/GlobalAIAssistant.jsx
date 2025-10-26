import { useState } from 'react';
import AIAssistant from './AIAssistant';

/**
 * 全局 AI 助教容器
 * 包含悬浮按钮和对话框
 */
export default function GlobalAIAssistant() {
  const [showAssistant, setShowAssistant] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      {/* 悬浮按钮 */}
      {!showAssistant && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* 提示气泡 */}
          {isHovering && (
            <div className="absolute bottom-full right-0 mb-4 animate-bounce-slow">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap text-sm font-medium relative">
                有问题问我吧！
                {/* 小箭头 */}
                <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-700"></div>
              </div>
            </div>
          )}

          {/* 主按钮 */}
          <button
            onClick={() => setShowAssistant(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative group"
            title="打开 AI 助教"
          >
            {/* 外圈光晕 */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-pulse-slow"></div>

            {/* 按钮主体 */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-full shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group-hover:scale-110 animate-float">
              {/* 机器人表情 */}
              <div className="text-4xl transform group-hover:scale-110 transition-transform">
                🤖
              </div>

              {/* 小光点装饰 */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-80 animate-ping-slow"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-purple-200 rounded-full opacity-60"></div>
            </div>

            {/* 消息提示徽章（可选，显示未读消息数） */}
            {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              3
            </div> */}
          </button>
        </div>
      )}

      {/* AI 助教对话框 */}
      {showAssistant && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl animate-slide-up">
          <AIAssistant
            type="homepage"
            onClose={() => setShowAssistant(false)}
          />
        </div>
      )}

      {/* 自定义动画样式 */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
