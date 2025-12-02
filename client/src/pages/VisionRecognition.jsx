import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BlocklyEditor from '@/components/blockly/BlocklyEditor';
import { javascriptGenerator } from 'blockly/javascript';
import * as visionAPI from '@/api/vision';

/**
 * AI 视觉识别页面
 * 使用 Blockly 积木进行图像识别实验
 */
export default function VisionRecognition() {
  const navigate = useNavigate();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [executionLog, setExecutionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('result');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 工具箱配置
  const toolboxConfig = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🔍 Vision 功能',
        colour: 270,
        contents: [
          { kind: 'block', type: 'vision_camera_capture' },
          { kind: 'block', type: 'vision_recognize_object' },
          { kind: 'block', type: 'vision_recognize_scene' },
          { kind: 'block', type: 'vision_recognize_text' },
          { kind: 'block', type: 'vision_when_detected' }
        ]
      },
      {
        kind: 'category',
        name: '📤 输入输出',
        colour: 160,
        contents: [
          { kind: 'block', type: 'io_upload_image' },
          { kind: 'block', type: 'io_display_result' },
          { kind: 'block', type: 'io_show_message' }
        ]
      },
      {
        kind: 'category',
        name: '🔄 逻辑控制',
        colour: 210,
        contents: [
          { kind: 'block', type: 'logic_if_else' },
          { kind: 'block', type: 'logic_wait' },
          { kind: 'block', type: 'logic_compare_text' }
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
          type: 'io_display_result',
          x: 50,
          y: 50,
          inputs: {
            RESULT: {
              block: {
                type: 'vision_recognize_object',
                inputs: {
                  IMAGE: {
                    block: { type: 'io_upload_image' }
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

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // 处理图片文件
  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setUploadedImage(base64);
      setImageBase64(base64.split(',')[1]);
      addLog('图片上传成功', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 拖拽处理
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // 启动摄像头
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        addLog('摄像头已启动', 'success');
      }
    } catch (error) {
      alert('无法访问摄像头');
      addLog('摄像头启动失败', 'error');
    }
  };

  // 从摄像头拍照
  const captureFromCamera = async () => {
    if (!videoRef.current || !isCameraActive) {
      await startCamera();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current?.videoWidth || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg');
    setUploadedImage(base64);
    setImageBase64(base64.split(',')[1]);
    addLog('照片拍摄成功', 'success');

    return base64.split(',')[1];
  };

  // 执行 Blockly 代码
  const handleRunCode = async () => {
    if (!generatedCode) {
      alert('请先构建积木程序');
      return;
    }

    setIsRunning(true);
    setExecutionLog([]);
    setResult('');
    addLog('开始执行程序...', 'info');

    // 执行上下文
    const executionContext = {
      getUploadedImage: () => {
        if (!imageBase64) {
          throw new Error('请先上传图片');
        }
        return imageBase64;
      },

      captureFromCamera: async () => {
        addLog('正在拍摄照片...', 'info');
        return await captureFromCamera();
      },

      visionRecognizeObject: async (imageData) => {
        addLog('正在识别物体...', 'info');
        const response = await visionAPI.recognizeObject(imageData);
        addLog('物体识别完成', 'success');
        return response.data.result;
      },

      visionRecognizeScene: async (imageData) => {
        addLog('正在识别场景...', 'info');
        const response = await visionAPI.recognizeScene(imageData);
        addLog('场景识别完成', 'success');
        return response.data.scene;
      },

      visionRecognizeText: async (imageData) => {
        addLog('正在识别文字...', 'info');
        const response = await visionAPI.recognizeText(imageData);
        addLog('文字识别完成', 'success');
        return response.data.text;
      },

      displayResult: (content) => {
        setResult(content);
        addLog('结果已显示', 'success');
      },

      wait: (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))
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
              <h1 className="text-2xl font-bold text-gray-900">图像识别实验室</h1>
              <p className="text-sm text-gray-500">拖拽积木，让 AI 识别图片内容</p>
            </div>
          </div>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isRunning
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
            }`}
          >
            {isRunning ? '执行中...' : '▶️ 运行程序'}
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
          {/* Image Upload Area */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">📷 图片输入</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="max-h-40 mx-auto rounded" />
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">点击或拖拽图片到此处</p>
                  <p className="text-sm text-gray-400 mt-2">支持 JPG、PNG 格式</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={startCamera}
              className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              📷 使用摄像头
            </button>
          </div>

          {/* Hidden Video for Camera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`${isCameraActive ? 'block' : 'hidden'} w-full max-h-40 object-cover`}
          />

          {/* Results Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-gray-200">
              {['result', 'code', 'log'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'result' ? '📊 结果' : tab === 'code' ? '💻 代码' : '📝 日志'}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'result' && (
                <div className="prose max-w-none">
                  {result ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-green-900 mb-2">识别结果</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center mt-10">运行程序后，结果将显示在这里</p>
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
    </div>
  );
}
