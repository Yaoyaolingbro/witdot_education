import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';
import * as conversationsAPI from '../../api/conversations';

/**
 * AI 助教组件
 * 提供 AI 对话界面
 */
export default function AIAssistant({
  type = 'homepage',  // 'homepage' | 'course' | 'canvas'
  courseId = null,
  lessonId = null,
  courseContent = null,
  onClose = null,
  className = ''
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 初始化：加载或创建对话
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoadingHistory(true);

        // 根据类型确定对话参数
        let conversationType = 'global';
        if (type === 'course' && courseId) {
          conversationType = lessonId ? 'lesson' : 'course';
        }

        // 获取或创建对话
        const conversation = await conversationsAPI.getOrCreateConversation(
          conversationType,
          courseId,
          lessonId
        );

        setConversationId(conversation._id);

        // 加载历史消息
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages.map(m => ({
            role: m.role,
            content: m.content,
          })));
        } else {
          // 没有历史消息，显示欢迎消息
          setMessages([
            {
              role: 'assistant',
              content: type === 'homepage'
                ? '你好！我是小智，你的AI学习助手。有什么问题可以问我哦！'
                : '你好！我是课程小助手，有不懂的地方可以问我！'
            }
          ]);
        }
      } catch (error) {
        console.error('初始化对话失败:', error);
        // 失败时显示默认欢迎消息
        setMessages([
          {
            role: 'assistant',
            content: '你好！我是小智，你的AI学习助手。有什么问题可以问我哦！'
          }
        ]);
      } finally {
        setLoadingHistory(false);
      }
    };

    initConversation();
  }, [type, courseId, lessonId]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 发送消息（使用流式响应）
  const handleSend = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 保存用户消息到对话历史
    try {
      await conversationsAPI.addMessage(conversationId, 'user', userMessage.content);
    } catch (error) {
      console.error('保存用户消息失败:', error);
    }

    // 添加一个占位消息用于流式更新
    const placeholderMessage = {
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3210/api';

      // 使用流式 API
      const response = await fetch(
        `${apiUrl}/ai/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            question: userMessage.content,
            type,
            courseId,
            lessonId,
            context: courseContent,
            conversationHistory: messages
              .filter(m => m.role !== 'system' && !m.isStreaming)
              .slice(-10)
              .map(m => ({ role: m.role, content: m.content }))
          })
        }
      );

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // 流式结束，保存AI回复到对话历史
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.isStreaming) {
                  delete lastMessage.isStreaming;

                  // 保存AI消息到对话历史
                  conversationsAPI.addMessage(conversationId, 'assistant', lastMessage.content)
                    .catch(err => console.error('保存AI消息失败:', err));
                }
                return newMessages;
              });
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                streamedText += parsed.text;

                // 更新最后一条消息
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isStreaming) {
                    lastMessage.content = streamedText;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 助教错误:', error);

      // 移除占位消息，添加错误消息
      const errorMessage = {
        role: 'assistant',
        content: error.message || '抱歉，我暂时无法回答。请稍后再试。'
      };

      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isStreaming);
        return [...newMessages, errorMessage];
      });

      // 保存错误消息到对话历史
      try {
        await conversationsAPI.addMessage(conversationId, 'assistant', errorMessage.content);
      } catch (err) {
        console.error('保存错误消息失败:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷问题
  const quickQuestions = type === 'homepage'
    ? [
        '什么是人工智能？',
        'AI能做什么？',
        '如何学习编程？'
      ]
    : [
        '我不懂，请帮我讲解',
        '能举个例子吗？',
        '这个怎么用？'
      ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  // 键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg border border-purple-100 ${className}`}>
      {/* 标题栏 */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {type === 'homepage' ? 'AI 学习助手 - 小智' : '课程小助手'}
            </h3>
            <p className="text-xs text-purple-100">有问题随时问我！</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-700 rounded-full p-1 transition-colors"
            title="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 聊天记录区 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {/* 加载历史消息 */}
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">加载对话历史...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} {...msg} />
            ))}

            {/* 加载动画 */}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">小智正在思考...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 快捷问题 */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-600 mb-2">💡 你可以这样问：</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-full transition-colors border border-purple-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题...（按 Enter 发送）"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <div className="w-6 h-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* 提示文字 */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          小智会尽力帮助你，但如果遇到很难的问题，记得问老师哦！
        </p>
      </div>
    </div>
  );
}

AIAssistant.propTypes = {
  type: PropTypes.oneOf(['homepage', 'course', 'canvas']),
  courseId: PropTypes.string,
  lessonId: PropTypes.string,
  courseContent: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
};
