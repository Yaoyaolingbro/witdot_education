import PropTypes from 'prop-types';

/**
 * 聊天消息组件
 * 显示用户或 AI 的单条消息
 */
export default function ChatMessage({ role, content, isStreaming }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-purple-50 text-gray-800 border border-purple-100'
        }`}
      >
        {/* 消息角色标识 */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-sm">
              🤖
            </div>
            <span className="text-xs font-semibold text-purple-700">小智</span>
          </div>
        )}

        {/* 消息内容 */}
        <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'} whitespace-pre-wrap`}>
          {content}
          {/* 打字机光标 */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-purple-600 animate-pulse"></span>
          )}
        </div>

        {/* 时间戳（非流式消息显示） */}
        {!isStreaming && (
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  role: PropTypes.oneOf(['user', 'assistant']).isRequired,
  content: PropTypes.string.isRequired,
  isStreaming: PropTypes.bool,
};
