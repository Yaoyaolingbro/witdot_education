import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BlocklyEditor from '@/components/blockly/BlocklyEditor';
import { voiceAssistantToolbox } from '@/blockly/toolbox';
import { javascriptGenerator } from 'blockly/javascript';
import axios from 'axios';
import { useToast } from '@/components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 语音助手画板页面
 * 类似天猫精灵/小爱同学的网页版智能音箱体验
 */
export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [blocksJson, setBlocksJson] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('result'); // 'result', 'code', 'log'
  const [executionLog, setExecutionLog] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // 新增：语音助手状态
  const [assistantStatus, setAssistantStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [conversationHistory, setConversationHistory] = useState([]); // 对话历史

  // refs - 使用 ref 来避免闭包问题
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const isRunningRef = useRef(false); // 全局运行标志位

  // 默认的 Blockly 模板（语音助手）
  const defaultBlocks = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'io_show_message',
          id: 'welcome_block',
          x: 50,
          y: 50,
          inputs: {
            MESSAGE: {
              block: {
                type: 'voice_text_to_speech',
                id: 'tts_block',
                inputs: {
                  TEXT: {
                    shadow: {
                      type: 'text_value',
                      id: 'welcome_text',
                      fields: {
                        TEXT: '欢迎使用语音助手！请对我说说话吧。'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          type: 'logic_if_simple',
          id: 'if_block',
          x: 50,
          y: 150,
          inputs: {
            CONDITION: {
              block: {
                type: 'voice_speech_to_text',
                id: 'stt_block'
              }
            },
            DO: {
              block: {
                type: 'io_display_result',
                id: 'display_block',
                inputs: {
                  RESULT: {
                    block: {
                      type: 'ai_text_generate',
                      id: 'ai_block',
                      inputs: {
                        PROMPT: {
                          shadow: {
                            type: 'text_value',
                            id: 'prompt_block',
                            fields: {
                              TEXT: '用户说了一些话，请给出一个友好的回复'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  };

  // 加载项目（如果 URL 中有 projectId）
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  // 加载项目
  const loadProject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const project = response.data.project;
      setCurrentProject(project);
      setBlocksJson(project.blocksJson);
    } catch (error) {
      console.error('Failed to load project:', error);
      showError('加载项目失败');
    }
  };

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, { timestamp, message, type }]);
  };

  // 添加对话消息到历史
  const addMessage = (role, content) => {
    const newMessage = { role, content, timestamp: new Date().toLocaleTimeString() };
    setConversationHistory(prev => [...prev, newMessage]);
    return newMessage;
  };

  // 开始语音识别（自动监听）
  const startListening = () => {
    // 检查是否应该继续运行
    if (!isRunningRef.current) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog('浏览器不支持语音识别，请使用 Chrome 浏览器', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setAssistantStatus('listening');
    addLog('正在监听，请说话...', 'info');

    recognition.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      setTranscript(userText);
      setIsListening(false);
      addLog(`语音识别结果：${userText}`, 'success');
      addMessage('user', userText);

      // 检查是否仍在运行
      if (!isRunningRef.current) return;

      // 获取 AI 回复并播放
      await processUserInput(userText);
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setIsListening(false);

      let errorMsg = '语音识别出错';
      if (event.error === 'no-speech') {
        errorMsg = '没有检测到语音';
        // 没有检测到语音时，如果仍在运行，重新开始监听
        if (isRunningRef.current) {
          addLog('没有检测到语音，继续监听...', 'info');
          setTimeout(() => startListening(), 500);
          return;
        }
      } else if (event.error === 'audio-capture') {
        errorMsg = '无法访问麦克风，请检查权限';
      } else if (event.error === 'not-allowed') {
        errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许';
      } else if (event.error === 'aborted') {
        // 用户主动停止，不需要提示错误
        return;
      }

      addLog(errorMsg, 'error');
      setAssistantStatus('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      setIsListening(false);
      setAssistantStatus('idle');
      addLog('启动语音识别失败', 'error');
    }
  };

  // 处理用户输入：调用 AI 并播放回复
  const processUserInput = async (userText) => {
    if (!isRunningRef.current) return;

    setAssistantStatus('thinking');
    addLog('AI 正在思考...', 'info');

    try {
      // 调用 AI 接口
      const response = await axios.post(`${API_URL}/ai/text-generate`, {
        prompt: `用户说："${userText}"，请用友好、简洁的语言回复（适合语音朗读，不超过100字）`
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!isRunningRef.current) return;

      const aiReply = response.data.result;
      addLog(`AI 回复：${aiReply}`, 'success');
      addMessage('assistant', aiReply);
      setResult(aiReply);

      // 播放 AI 回复（播放完成后会自动开启监听）
      await speakText(aiReply);

    } catch (error) {
      console.error('AI 请求失败:', error);
      addLog('AI 暂时无法回复，请稍后再试', 'error');
      setAssistantStatus('idle');

      // 即使 AI 出错，也继续监听
      if (isRunningRef.current) {
        setTimeout(() => startListening(), 1000);
      }
    }
  };

  // 语音合成播放文字（播放完成后自动开启监听）
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        addLog('浏览器不支持语音合成', 'error');
        // 即使不支持语音，也继续监听
        if (isRunningRef.current) {
          setTimeout(() => startListening(), 500);
        }
        resolve();
        return;
      }

      // 取消之前的语音
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      synthesisRef.current = utterance;

      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 尝试使用中文语音
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      setAssistantStatus('speaking');
      addLog(`正在播放语音：${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`, 'info');

      // 关键：语音播放结束后，自动开启监听
      utterance.onend = () => {
        addLog('语音播放完成', 'success');
        resolve();

        // 检查标志位，如果仍在运行，自动开启麦克风
        if (isRunningRef.current) {
          setAssistantStatus('listening');
          setTimeout(() => startListening(), 300);
        } else {
          setAssistantStatus('idle');
        }
      };

      utterance.onerror = (event) => {
        console.error('语音合成错误:', event);
        addLog('语音播放出错', 'error');
        resolve();

        // 即使语音出错，也继续监听
        if (isRunningRef.current) {
          setTimeout(() => startListening(), 500);
        } else {
          setAssistantStatus('idle');
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // 停止语音助手
  const stopAssistant = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setAssistantStatus('idle');
    setIsListening(false);

    // 停止语音识别
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // 停止语音合成
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    addLog('语音助手已停止', 'info');
  };

  // 启动语音助手
  const startAssistant = async () => {
    isRunningRef.current = true;
    setIsRunning(true);
    setResult('');
    setExecutionLog([]);
    setConversationHistory([]);
    setActiveTab('result');
    addLog('开始执行语音助手...', 'info');

    // 播放欢迎语，播放完成后会自动开启监听
    await speakText('你好！我是语音助手，请问有什么可以帮你的？');
  };

  // 机器人相关功能（模拟）
  const robotMoveForward = () => {
    addLog('机器人向前移动', 'info');
    console.log('🤖 机器人向前移动');
  };

  const robotMoveBackward = () => {
    addLog('机器人向后移动', 'info');
    console.log('🤖 机器人向后移动');
  };

  const robotTurnLeft = () => {
    addLog('机器人左转', 'info');
    console.log('🤖 机器人左转');
  };

  const robotTurnRight = () => {
    addLog('机器人右转', 'info');
    console.log('🤖 机器人右转');
  };

  const robotSay = (text) => {
    addLog(`机器人说：${text}`, 'info');
    console.log(`🤖 机器人说：${text}`);
  };

  const robotDetectObstacle = () => {
    addLog('检测障碍物', 'info');
    return Math.random() > 0.5; // 50% 概率检测到障碍物
  };

  // 运行/停止语音助手
  const handleRunAgent = async () => {
    if (isRunning) {
      stopAssistant();
    } else {
      await startAssistant();
    }
  };

  // 保存项目
  const handleSaveProject = async () => {
    if (!blocksJson) {
      warning('没有可保存的内容');
      return;
    }

    // 如果是更新已有项目
    if (currentProject) {
      try {
        await axios.put(`${API_URL}/projects/${currentProject._id}`, {
          title: currentProject.title,
          description: currentProject.description,
          blocksJson
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        success('保存成功！');
      } catch (error) {
        console.error('保存失败:', error);
        showError('保存失败，请重试');
      }
      return;
    }

    // 创建新项目
    const projectName = prompt('请输入项目名称', '语音助手');
    if (!projectName) return;

    try {
      const response = await axios.post(`${API_URL}/projects`, {
        title: projectName,
        description: '使用积木构建语音对话助手',
        category: 'voiceAssistant',
        blocksJson
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 保存成功后，更新当前项目状态并修改 URL
      const savedProject = response.data.project;
      setCurrentProject(savedProject);
      window.history.replaceState(null, '', `/canvas/voice-assistant?projectId=${savedProject._id}`);

      success('保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 顶部操作栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/canvas')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                ← 返回
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎤 语音助手画板
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                AI Agent 示例
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProject}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:shadow-md transition-all font-medium"
              >
                💾 保存项目
              </button>
              <button
                onClick={handleRunAgent}
                className={`px-6 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105 ${
                  isRunning
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {isRunning ? '⏹️ 停止助手' : '▶️ 运行助手'}
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            💡 提示：拖拽积木来构建你的语音对话助手。点击"运行助手"来测试功能。
          </p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 顶部：结果显示区 - 带 Tab */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border overflow-hidden">
          {/* Tab 导航 */}
          <div className="flex border-b bg-gray-50">
            {[
              { id: 'result', label: '📺 对话结果', icon: '📺' },
              { id: 'code', label: '💻 生成代码', icon: '💻' },
              { id: 'log', label: '📋 执行日志', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div className="p-6 min-h-[200px]">
            {/* 结果 Tab */}
            {activeTab === 'result' && (
              <div className="animate-fadeIn">
                {/* 状态指示器 */}
                {isRunning && (
                  <div className={`mb-4 p-4 rounded-xl flex items-center gap-4 ${
                    assistantStatus === 'listening' ? 'bg-blue-50 border-2 border-blue-300' :
                    assistantStatus === 'thinking' ? 'bg-yellow-50 border-2 border-yellow-300' :
                    assistantStatus === 'speaking' ? 'bg-green-50 border-2 border-green-300' :
                    'bg-gray-50 border-2 border-gray-300'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      assistantStatus === 'listening' ? 'bg-blue-100 animate-pulse' :
                      assistantStatus === 'thinking' ? 'bg-yellow-100 animate-spin-slow' :
                      assistantStatus === 'speaking' ? 'bg-green-100 animate-bounce' :
                      'bg-gray-100'
                    }`}>
                      {assistantStatus === 'listening' && '🎤'}
                      {assistantStatus === 'thinking' && '🤔'}
                      {assistantStatus === 'speaking' && '🔊'}
                      {assistantStatus === 'idle' && '😴'}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${
                        assistantStatus === 'listening' ? 'text-blue-700' :
                        assistantStatus === 'thinking' ? 'text-yellow-700' :
                        assistantStatus === 'speaking' ? 'text-green-700' :
                        'text-gray-700'
                      }`}>
                        {assistantStatus === 'listening' && '正在监听...'}
                        {assistantStatus === 'thinking' && 'AI 正在思考...'}
                        {assistantStatus === 'speaking' && '正在说话...'}
                        {assistantStatus === 'idle' && '准备就绪'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assistantStatus === 'listening' && '请对着麦克风说话'}
                        {assistantStatus === 'thinking' && '请稍等片刻'}
                        {assistantStatus === 'speaking' && '正在播放语音回复'}
                        {assistantStatus === 'idle' && '等待开始对话'}
                      </p>
                    </div>
                    {assistantStatus === 'listening' && (
                      <div className="ml-auto flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-blue-500 rounded-full animate-soundwave"
                            style={{
                              height: `${20 + Math.random() * 20}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 对话历史 */}
                {conversationHistory.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {conversationHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-4 rounded-xl animate-slideInUp ${
                          msg.role === 'user'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-2xl">
                          {msg.role === 'user' ? '🧑' : '🤖'}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">
                              {msg.role === 'user' ? '你' : '助手'}
                            </span>
                            <span className="text-xs text-gray-500">{msg.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4 animate-bounce">🎤</div>
                    <p className="text-lg">点击"运行助手"开始语音对话</p>
                    <p className="text-sm mt-2">我会听你说话，并用语音回复你</p>
                  </div>
                )}
              </div>
            )}

            {/* 代码 Tab */}
            {activeTab === 'code' && (
              <div className="animate-fadeIn">
                {generatedCode ? (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[400px]">
                    <pre className="text-green-400 text-sm font-mono">{generatedCode}</pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">💻</div>
                    <p className="text-lg">在画布上创建积木后，生成的代码将显示在这里</p>
                  </div>
                )}
              </div>
            )}

            {/* 日志 Tab */}
            {activeTab === 'log' && (
              <div className="animate-fadeIn">
                {executionLog.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-auto">
                    {executionLog.map((log, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          log.type === 'error' ? 'bg-red-50 text-red-800' :
                          log.type === 'success' ? 'bg-green-50 text-green-800' :
                          'bg-blue-50 text-blue-800'
                        } animate-slideInLeft`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                        <span className="flex-1">{log.message}</span>
                        {log.type === 'error' && '❌'}
                        {log.type === 'success' && '✅'}
                        {log.type === 'info' && 'ℹ️'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg">执行日志将显示在这里</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Blockly 编辑器 */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              积木编程区
            </h2>
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
              拖拽积木到工作区
            </span>
            {isListening && (
              <span className="flex items-center gap-2 text-red-600 animate-pulse">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                正在听语音...
              </span>
            )}
          </div>

          <div style={{ height: '600px' }}>
            <BlocklyEditor
              initialBlocks={currentProject ? currentProject.blocksJson : JSON.stringify(defaultBlocks)}
              toolbox={voiceAssistantToolbox}
              onWorkspaceChange={setBlocksJson}
              onCodeGenerate={setGeneratedCode}
              readOnly={false}
            />
          </div>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }

        .animate-soundwave {
          animation: soundwave 0.5s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}