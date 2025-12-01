import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BlocklyEditor from '@/components/blockly/BlocklyEditor';
import { imageRecognitionToolbox } from '@/blockly/toolbox';
import { javascriptGenerator } from 'blockly/javascript';
import axios from 'axios';
import { useToast } from '@/components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 图像识别画板页面
 * 学生可以上传图片，使用 Blockly 构建图像识别 Agent
 */
export default function ImageRecognition() {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [blocksJson, setBlocksJson] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('result'); // 'result', 'code', 'log'
  const [executionLog, setExecutionLog] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 默认的 Blockly 模板（图像识别固定 Agent）
  const defaultBlocks = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'io_display_result',
          id: 'display_block',
          x: 50,
          y: 50,
          inputs: {
            RESULT: {
              block: {
                type: 'ai_image_recognition',
                id: 'ai_block',
                inputs: {
                  IMAGE: {
                    block: {
                      type: 'io_upload_image',
                      id: 'upload_block'
                    }
                  },
                  PROMPT: {
                    shadow: {
                      type: 'text_value',
                      id: 'prompt_block',
                      fields: {
                        TEXT: '请详细描述这张图片的内容，用小学生能理解的语言'
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

  // 处理图片上传
  const handleImageUpload = (file) => {
    if (!file) return;

    // 限制文件大小为 5MB
    if (file.size > 5 * 1024 * 1024) {
      warning('图片大小不能超过 5MB');
      return;
    }

    // 限制文件类型
    if (!file.type.startsWith('image/')) {
      warning('只能上传图片文件');
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);

      // 转换为 base64（去掉 data:image/xxx;base64, 前缀）
      const base64 = event.target.result.split(',')[1];
      setImageBase64(base64);
      addLog('图片上传成功', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 文件输入change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleImageUpload(file);
  };

  // 拖拽处理
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleImageUpload(file);
  };

  // 运行 Blockly Agent
  const handleRunAgent = async () => {
    if (!uploadedImage) {
      warning('请先上传图片');
      return;
    }

    if (!blocksJson) {
      warning('请先在画布上创建积木逻辑');
      return;
    }

    setIsRunning(true);
    setResult('');
    setExecutionLog([]);
    setActiveTab('result');
    addLog('开始执行 Agent...', 'info');

    try {
      // 执行环境：提供自定义函数供 Blockly 生成的代码调用
      const executionContext = {
        getUploadedImage: () => {
          addLog('获取上传的图片', 'info');
          return imageBase64;
        },
        recognizeImage: async (imageData, prompt) => {
          addLog(`调用 AI 识别图片，提示词: ${prompt}`, 'info');
          const response = await axios.post(`${API_URL}/ai/image-recognition`, {
            imageBase64: imageData,
            prompt
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          addLog('AI 识别完成', 'success');
          return response.data.result;
        },
        displayResult: (content) => {
          addLog('显示结果', 'info');
          setResult(content);
        },
        wait: (seconds) => {
          addLog(`等待 ${seconds} 秒...`, 'info');
          return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        },
        getUserInput: async (message) => {
          addLog(`请求用户输入: ${message}`, 'info');
          return prompt(message) || '';
        },
        generateText: async (prompt) => {
          addLog(`调用 AI 生成文本: ${prompt}`, 'info');
          const response = await axios.post(`${API_URL}/ai/text-generate`, {
            prompt
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          addLog('文本生成完成', 'success');
          return response.data.result;
        }
      };

      // 使用 AsyncFunction 执行生成的代码
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeCode = new AsyncFunction(
        ...Object.keys(executionContext),
        generatedCode
      );

      // 执行代码
      await executeCode(...Object.values(executionContext));
      addLog('执行完成', 'success');

    } catch (error) {
      console.error('执行失败:', error);
      const errorMsg = `执行失败: ${error.message || '未知错误'}`;
      setResult(errorMsg);
      addLog(errorMsg, 'error');
    } finally {
      setIsRunning(false);
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
    const projectName = prompt('请输入项目名称', '图像识别助手');
    if (!projectName) return;

    try {
      const response = await axios.post(`${API_URL}/projects`, {
        title: projectName,
        description: '使用 AI 识别图片内容',
        category: 'imageRecognition',
        blocksJson
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 保存成功后，更新当前项目状态并修改 URL
      const savedProject = response.data.project;
      setCurrentProject(savedProject);
      window.history.replaceState(null, '', `/canvas/image-recognition?projectId=${savedProject._id}`);

      success('保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      showError('保存失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 顶部操作栏 */}
      <div className="bg-white border-b shadow-sm sticky top-0" style={{ zIndex: 9999 }}>
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
                🖼️ 图像识别画板
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
                disabled={isRunning || !uploadedImage}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    运行中...
                  </span>
                ) : '▶️ 运行 Agent'}
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            💡 提示：上传图片后，点击"运行 Agent"让 AI 识别图片内容。你可以修改提示词来改变识别方式。
          </p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 顶部：识别结果显示区 - 带 Tab */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border overflow-hidden">
          {/* Tab 导航 */}
          <div className="flex border-b bg-gray-50">
            {[
              { id: 'result', label: '📺 识别结果', icon: '📺' },
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
                {result ? (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 animate-slideInUp">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">🤖</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">AI 识别结果</h3>
                        <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">{result}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4 animate-bounce">🎯</div>
                    <p className="text-lg">运行 Agent 后，AI 识别结果将显示在这里</p>
                    <p className="text-sm mt-2">上传图片并点击"运行 Agent"开始</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：Blockly 编辑器 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🧩</span>
                  积木编程区
                </h2>
                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                  拖拽积木到工作区
                </span>
              </div>

              <div style={{ height: '600px' }} className="w-full flex relative overflow-hidden">
              <div className="flex-1 min-w-0 relative overflow-hidden">
                <BlocklyEditor
                  initialBlocks={currentProject ? currentProject.blocksJson : JSON.stringify(defaultBlocks)}
                  toolbox={imageRecognitionToolbox}
                  onWorkspaceChange={setBlocksJson}
                  onCodeGenerate={setGeneratedCode}
                  readOnly={false}
                />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：图片上传 */}
          <div className="space-y-6">
            {/* 图片上传区 */}
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📤</span>
                  上传图片
                </h2>
              </div>

              <div className="p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* 拖拽上传区域 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-5xl mb-3">{isDragging ? '⬇️' : '🖼️'}</div>
                  <p className="text-gray-600 font-medium mb-2">
                    {isDragging ? '松开以上传' : '点击或拖拽图片到这里'}
                  </p>
                  <p className="text-xs text-gray-400">支持 JPG、PNG 等格式，最大 5MB</p>
                </div>

                {uploadedImage && (
                  <div className="mt-4 animate-fadeIn">
                    <p className="text-sm text-gray-600 mb-2 font-medium">预览：</p>
                    <div className="relative group">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full rounded-lg border-2 border-purple-200 shadow-md transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setImageBase64('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 使用提示 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                使用提示
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>1️⃣</span>
                  <span>上传一张你想识别的图片</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2️⃣</span>
                  <span>可以修改积木中的提示词</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3️⃣</span>
                  <span>点击"运行 Agent"查看结果</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>4️⃣</span>
                  <span>在日志中查看执行过程</span>
                </li>
              </ul>
            </div>
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
