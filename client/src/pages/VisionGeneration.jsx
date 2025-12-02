import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlocklyEditor from '@/components/blockly/BlocklyEditor';
import { javascriptGenerator } from 'blockly/javascript';
import * as visionAPI from '@/api/vision';

/**
 * AI 创意生图页面
 * 使用 Blockly 积木进行 AI 绘画创作
 */
export default function VisionGeneration() {
  const navigate = useNavigate();

  const [generatedImages, setGeneratedImages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [executionLog, setExecutionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery');
  const [currentPrompt, setCurrentPrompt] = useState('');

  // 工具箱配置
  const toolboxConfig = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🎨 AI 生图',
        colour: 270,
        contents: [
          {
            kind: 'block',
            type: 'vision_generate_image',
            inputs: {
              PROMPT: {
                shadow: {
                  type: 'text_value',
                  fields: { TEXT: '可爱的小狗在草地上奔跑' }
                }
              }
            }
          }
        ]
      },
      {
        kind: 'category',
        name: '📤 输入输出',
        colour: 160,
        contents: [
          { kind: 'block', type: 'vision_display_image' },
          { kind: 'block', type: 'io_get_input' },
          { kind: 'block', type: 'io_show_message' }
        ]
      },
      {
        kind: 'category',
        name: '🔄 逻辑控制',
        colour: 210,
        contents: [
          { kind: 'block', type: 'loop_repeat' },
          { kind: 'block', type: 'logic_wait' }
        ]
      },
      {
        kind: 'category',
        name: '📝 文本',
        colour: 160,
        contents: [
          { kind: 'block', type: 'text_value' },
          { kind: 'block', type: 'text_join_simple' }
        ]
      }
    ]
  };

  // 默认积木
  const defaultBlocks = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'vision_display_image',
          x: 50,
          y: 50,
          inputs: {
            IMAGE: {
              block: {
                type: 'vision_generate_image',
                fields: { SIZE: '512x512' },
                inputs: {
                  PROMPT: {
                    shadow: {
                      type: 'text_value',
                      fields: { TEXT: '可爱的柴犬宇航员在太空漂浮' }
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

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, { message, type, timestamp }]);
  };

  // 执行 Blockly 代码
  const handleRunCode = async () => {
    if (!generatedCode) {
      alert('请先构建积木程序');
      return;
    }

    setIsRunning(true);
    setExecutionLog([]);
    addLog('开始执行程序...', 'info');

    // 执行上下文
    const executionContext = {
      visionGenerateImage: async (prompt, size = '512x512') => {
        addLog(`正在生成图片: "${prompt}"`, 'info');
        setCurrentPrompt(prompt);

        try {
          const response = await visionAPI.generateImage(prompt, { size });
          const imageData = response.data;

          addLog('图片生成成功', 'success');
          addLog(`原始提示词: ${imageData.originalPrompt}`, 'info');
          addLog(`优化后: ${imageData.enhancedPrompt}`, 'info');

          return `data:image/png;base64,${imageData.imageBase64}`;
        } catch (error) {
          addLog(`生图失败: ${error.message}`, 'error');
          throw error;
        }
      },

      displayImage: (imageBase64) => {
        setGeneratedImages(prev => [
          {
            id: Date.now(),
            src: imageBase64,
            prompt: currentPrompt,
            timestamp: new Date().toLocaleString()
          },
          ...prev
        ]);
        addLog('图片已添加到画廊', 'success');
      },

      getUserInput: async (message) => {
        const input = prompt(message);
        if (input) {
          addLog(`用户输入: ${input}`, 'info');
        }
        return input || '';
      },

      wait: (seconds) => {
        addLog(`等待 ${seconds} 秒...`, 'info');
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
      }
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeCode = new AsyncFunction(
        ...Object.keys(executionContext),
        generatedCode
      );

      await executeCode(...Object.values(executionContext));
      addLog('程序执行完成', 'success');
    } catch (error) {
      console.error('Execution error:', error);
      addLog(`执行错误: ${error.message}`, 'error');
      alert(`执行错误: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 删除图片
  const handleDeleteImage = (id) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  // 下载图片
  const handleDownloadImage = (src, prompt) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ai-art-${prompt.slice(0, 20)}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm" style={{ zIndex: 9999 }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/ai-vision')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 创意生图</h1>
              <p className="text-sm text-gray-500">用文字描述，让 AI 为你创作艺术作品</p>
            </div>
          </div>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isRunning
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isRunning ? '生成中...' : '🎨 开始创作'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Blockly Editor */}
        <div className="w-1/2 border-r border-gray-200 bg-white">
          <BlocklyEditor
            toolbox={toolboxConfig}
            initialBlocks={JSON.stringify(defaultBlocks)}
            onCodeGenerate={setGeneratedCode}
            className="h-full"
          />
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['gallery', 'code', 'log'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'gallery' ? '🖼️ 画廊' : tab === 'code' ? '💻 代码' : '📝 日志'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                {generatedImages.length > 0 ? (
                  generatedImages.map((image) => (
                    <div key={image.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <img src={image.src} alt={image.prompt} className="w-full h-auto" />
                      <div className="p-4">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>提示词:</strong> {image.prompt}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">{image.timestamp}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadImage(image.src, image.prompt)}
                            className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded transition-colors text-sm"
                          >
                            📥 下载
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors text-sm"
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 mt-20">
                    <p className="text-lg mb-2">🎨</p>
                    <p>运行程序后，生成的图片将显示在这里</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'code' && (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                {generatedCode || '// 积木生成的代码将显示在这里'}
              </pre>
            )}

            {activeTab === 'log' && (
              <div className="space-y-2">
                {executionLog.length > 0 ? (
                  executionLog.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded text-sm ${
                        log.type === 'error'
                          ? 'bg-red-50 text-red-700'
                          : log.type === 'success'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <span className="font-mono text-xs text-gray-500">[{log.timestamp}]</span>{' '}
                      {log.message}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-10">执行日志将显示在这里</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
