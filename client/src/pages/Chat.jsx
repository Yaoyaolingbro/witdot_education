import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatMessage from '../components/ai/ChatMessage';
import * as conversationsAPI from '../api/conversations';

/**
 * 小问同学对话页面
 * 类似 Claude 的完整对话界面，支持历史记录和新建对话
 */
export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 从 URL 参数获取对话 ID
  const conversationIdFromUrl = searchParams.get('id');

  // 加载所有对话历史
  const loadConversations = async () => {
    try {
      const data = await conversationsAPI.getAllConversations();
      setConversations(data);
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
  };

  // 初始化：加载对话列表
  useEffect(() => {
    loadConversations();
  }, []);

  // 加载或创建当前对话
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoadingHistory(true);

        let conversation;
        if (conversationIdFromUrl) {
          // 加载指定的对话
          conversation = await conversationsAPI.getConversation(conversationIdFromUrl);
        } else {
          // 创建或获取默认全局对话
          conversation = await conversationsAPI.getOrCreateConversation('global');
          // 更新 URL
          setSearchParams({ id: conversation._id });
        }

        setCurrentConversationId(conversation._id);

        // 加载历史消息
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages.map(m => ({
            role: m.role,
            content: m.content,
          })));
        } else {
          // 显示欢迎消息
          setMessages([
            {
              role: 'assistant',
              content: '你好！我是小问，你的AI学习助手。有什么问题可以问我哦！'
            }
          ]);
        }
      } catch (error) {
        console.error('初始化对话失败:', error);
        setMessages([
          {
            role: 'assistant',
            content: '你好！我是小问，你的AI学习助手。有什么问题可以问我哦！'
          }
        ]);
      } finally {
        setLoadingHistory(false);
      }
    };

    initConversation();
  }, [conversationIdFromUrl]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 新建对话
  const handleNewChat = async () => {
    try {
      // 创建新对话
      const newConversation = await conversationsAPI.createConversation('global');
      await loadConversations();

      // 导航到新对话
      setSearchParams({ id: newConversation._id });
    } catch (error) {
      console.error('创建新对话失败:', error);
      alert('创建新对话失败，请重试');
    }
  };

  // 切换对话
  const handleSwitchConversation = (conversationId) => {
    setSearchParams({ id: conversationId });
  };

  // 删除对话
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();

    if (!confirm('确定要删除这个对话吗？')) {
      return;
    }

    try {
      await conversationsAPI.deleteConversation(conversationId);
      await loadConversations();

      // 如果删除的是当前对话，创建新对话
      if (conversationId === currentConversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('删除对话失败:', error);
      alert('删除对话失败，请重试');
    }
  };

  // 发送消息（流式响应）
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 验证对话ID
    if (!currentConversationId) {
      alert('对话未初始化，请刷新页面重试');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 保存用户消息
    try {
      await conversationsAPI.addMessage(currentConversationId, 'user', userMessage.content);
    } catch (error) {
      console.error('保存用户消息失败:', error);
      // 继续执行，即使保存失败也要获取AI回复
    }

    // 添加占位消息用于流式更新
    const placeholderMessage = {
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3210/api';

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
            type: 'homepage',
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
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    lastMessage.content = assistantContent;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('解析流式数据失败:', e);
            }
          }
        }
      }

      // 完成流式传输，移除 isStreaming 标记
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          delete lastMessage.isStreaming;
        }
        return newMessages;
      });

      // 保存 AI 回复（只在有内容时保存）
      if (assistantContent && assistantContent.trim()) {
        try {
          await conversationsAPI.addMessage(currentConversationId, 'assistant', assistantContent);
        } catch (error) {
          console.error('保存AI回复失败:', error);
          // 即使保存失败，也不影响用户看到的消息
        }
      }

      // 刷新对话列表（更新时间戳）
      await loadConversations();

    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          lastMessage.content = '抱歉，发生了错误。请稍后重试。';
          delete lastMessage.isStreaming;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 格式化时间
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return '昨天';
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 获取对话标题（使用第一条用户消息）
  const getConversationTitle = (conversation) => {
    const firstUserMessage = conversation.messages?.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return '新对话';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧历史记录侧边栏 */}
      <aside className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white flex flex-col`}>
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              小问同学
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">新建对话</span>
          </button>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">还没有对话记录</p>
              <p className="text-xs mt-2">点击"新建对话"开始聊天</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation._id}
                onClick={() => handleSwitchConversation(conversation._id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  conversation._id === currentConversationId
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      conversation._id === currentConversationId ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {getConversationTitle(conversation)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(conversation.updatedAt)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(conversation._id, e)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-50 rounded transition-opacity"
                    title="删除对话"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 右侧对话区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!showHistory && (
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">小问同学</h1>
              <p className="text-xs text-gray-500">AI 学习助手</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="返回首页"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8 px-6">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    isStreaming={message.isStreaming}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="输入消息...（按 Enter 发送，Shift + Enter 换行）"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute bottom-3 right-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title="发送消息"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              小问可能会出错。请核实重要信息。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
