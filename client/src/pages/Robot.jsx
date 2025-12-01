import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BlocklyEditor from '@/components/blockly/BlocklyEditor';
import { robotToolbox } from '@/blockly/toolbox';
import { javascriptGenerator } from 'blockly/javascript';
import axios from 'axios';
import { useToast } from '@/components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 机器人画板页面
 * 学生可以使用 Blockly 控制虚拟机器人移动和执行任务
 */
export default function Robot() {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 });
  const [robotDirection, setRobotDirection] = useState('north'); // north, east, south, west
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [blocksJson, setBlocksJson] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation', 'code', 'log'
  const [executionLog, setExecutionLog] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);

  // 默认的 Blockly 模板（机器人控制）
  const defaultBlocks = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'io_show_message',
          id: 'start_block',
          x: 50,
          y: 50,
          inputs: {
            MESSAGE: {
              shadow: {
                type: 'text_value',
                id: 'start_message',
                fields: {
                  TEXT: '机器人开始执行任务！'
                }
              }
            }
          }
        },
        {
          type: 'loop_repeat',
          id: 'repeat_block',
          x: 50,
          y: 150,
          fields: {
            TIMES: '4'
          },
          inputs: {
            DO: {
              block: {
                type: 'logic_if_simple',
                id: 'if_block',
                inputs: {
                  CONDITION: {
                    block: {
                      type: 'robot_detect_obstacle',
                      id: 'detect_block'
                    }
                  },
                  DO: {
                    block: {
                      type: 'robot_turn_right',
                      id: 'turn_block'
                    }
                  }
                }
              }
            }
          }
        },
        {
          type: 'robot_move_forward',
          id: 'final_move',
          x: 50,
          y: 250
        },
        {
          type: 'robot_say',
          id: 'say_block',
          x: 50,
          y: 320,
          inputs: {
            TEXT: {
              shadow: {
                type: 'text_value',
                id: 'final_message',
                fields: {
                  TEXT: '任务完成！'
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

  // 机器人移动函数
  const robotMoveForward = () => {
    setRobotPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (robotDirection) {
        case 'north':
          newY = Math.max(prev.y - 1, -10);
          break;
        case 'east':
          newX = Math.min(prev.x + 1, 10);
          break;
        case 'south':
          newY = Math.min(prev.y + 1, 10);
          break;
        case 'west':
          newX = Math.max(prev.x - 1, -10);
          break;
      }

      const newPosition = { x: newX, y: newY };
      setMoveHistory(prev => [...prev, newPosition]);
      addLog(`机器人向前移动到：(${newX}, ${newY})`, 'info');
      return newPosition;
    });
  };

  const robotMoveBackward = () => {
    setRobotPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (robotDirection) {
        case 'north':
          newY = Math.min(prev.y + 1, 10);
          break;
        case 'east':
          newX = Math.max(prev.x - 1, -10);
          break;
        case 'south':
          newY = Math.max(prev.y - 1, -10);
          break;
        case 'west':
          newX = Math.min(prev.x + 1, 10);
          break;
      }

      const newPosition = { x: newX, y: newY };
      setMoveHistory(prev => [...prev, newPosition]);
      addLog(`机器人向后移动到：(${newX}, ${newY})`, 'info');
      return newPosition;
    });
  };

  const robotTurnLeft = () => {
    setRobotDirection(prev => {
      const directions = ['north', 'west', 'south', 'east'];
      const currentIndex = directions.indexOf(prev);
      const newDirection = directions[(currentIndex + 1) % 4];
      addLog(`机器人左转，现在朝向：${getDirectionText(newDirection)}`, 'info');
      return newDirection;
    });
  };

  const robotTurnRight = () => {
    setRobotDirection(prev => {
      const directions = ['north', 'east', 'south', 'west'];
      const currentIndex = directions.indexOf(prev);
      const newDirection = directions[(currentIndex + 1) % 4];
      addLog(`机器人右转，现在朝向：${getDirectionText(newDirection)}`, 'info');
      return newDirection;
    });
  };

  const robotSay = (text) => {
    addLog(`机器人说：${text}`, 'info');
    setResult(text);
  };

  const robotDetectObstacle = () => {
    // 模拟障碍物检测（边界检测）
    const hasObstacle =
      (robotDirection === 'north' && robotPosition.y <= -9) ||
      (robotDirection === 'south' && robotPosition.y >= 9) ||
      (robotDirection === 'east' && robotPosition.x >= 9) ||
      (robotDirection === 'west' && robotPosition.x <= -9) ||
      Math.random() < 0.3; // 30% 随机障碍物

    addLog(`检测障碍物：${hasObstacle ? '有' : '无'}`, 'info');
    return hasObstacle;
  };

  const getDirectionText = (direction) => {
    const directionMap = {
      north: '北',
      east: '东',
      south: '南',
      west: '西'
    };
    return directionMap[direction] || direction;
  };

  const getRobotIcon = (direction) => {
    const iconMap = {
      north: '⬆️',
      east: '➡️',
      south: '⬇️',
      west: '⬅️'
    };
    return iconMap[direction] || '⬆️';
  };

  // 运行 Blockly Agent
  const handleRunAgent = async () => {
    if (!blocksJson) {
      warning('请先在画布上创建积木逻辑');
      return;
    }

    setIsRunning(true);
    setResult('');
    setExecutionLog([]);
    setActiveTab('simulation');
    setMoveHistory([]);
    setRobotPosition({ x: 0, y: 0 });
    setRobotDirection('north');
    addLog('开始执行机器人控制程序...', 'info');

    try {
      // 执行环境：提供自定义函数供 Blockly 生成的代码调用
      const executionContext = {
        robotMoveForward,
        robotMoveBackward,
        robotTurnLeft,
        robotTurnRight,
        robotSay,
        robotDetectObstacle,
        getUploadedImage: () => '',
        recognizeImage: async (imageData, prompt) => '模拟图像识别结果',
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
        },
        // 语音功能（机器人也可能需要）
        speechToText: async () => {
          addLog('语音识别（机器人功能）', 'info');
          return '语音命令';
        },
        textToSpeech: async (text) => {
          addLog(`机器人语音播报：${text}`, 'info');
          return Promise.resolve();
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
      addLog('机器人任务完成！', 'success');

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
    const projectName = prompt('请输入项目名称', '机器人控制程序');
    if (!projectName) return;

    try {
      const response = await axios.post(`${API_URL}/projects`, {
        title: projectName,
        description: '使用积木控制虚拟机器人移动和执行任务',
        category: 'robot',
        blocksJson
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 保存成功后，更新当前项目状态并修改 URL
      const savedProject = response.data.project;
      setCurrentProject(savedProject);
      window.history.replaceState(null, '', `/canvas/robot?projectId=${savedProject._id}`);

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
                🤖 机器人画板
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
                disabled={isRunning}
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
                ) : '▶️ 运行机器人'}
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            💡 提示：使用积木控制虚拟机器人移动和执行任务。查看下方的机器人模拟区域。
          </p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 顶部：模拟和结果显示区 */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 机器人模拟区域 */}
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                机器人模拟
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">位置:</span>
                <span className="font-medium">({robotPosition.x}, {robotPosition.y})</span>
                <span className="mx-2">|</span>
                <span className="text-gray-600">朝向:</span>
                <span className="font-medium">{getDirectionText(robotDirection)}</span>
              </div>
            </div>

            <div className="p-4">
              {/* 网格地图 */}
              <div className="relative w-full h-96 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* 绘制网格 */}
                <div className="absolute inset-0 grid grid-cols-21 grid-rows-21">
                  {Array.from({ length: 441 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-gray-100"
                      style={{
                        backgroundColor:
                          (i % 21 === 10 || Math.floor(i / 21) === 10) ? '#e5e7eb' : 'transparent'
                      }}
                    />
                  ))}
                </div>

                {/* 机器人轨迹 */}
                {moveHistory.map((pos, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-50"
                    style={{
                      left: `${(pos.x + 10) * 4.5}%`,
                      top: `${(pos.y + 10) * 4.5}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}

                {/* 机器人图标 */}
                <div
                  className="absolute text-2xl transition-all duration-300 ease-in-out"
                  style={{
                    left: `${(robotPosition.x + 10) * 4.5}%`,
                    top: `${(robotPosition.y + 10) * 4.5}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {isRunning && (
                    <div className="absolute -inset-1 bg-green-400 rounded-full animate-ping"/>
                  )}
                  <span className="relative">{getRobotIcon(robotDirection)}</span>
                </div>

                {/* 坐标标签 */}
                <div className="absolute top-0 left-1/2 text-xs text-gray-500 -translate-x-1/2 bg-white px-1">Y</div>
                <div className="absolute left-0 top-1/2 text-xs text-gray-500 -translate-y-1/2 bg-white px-1">X</div>
              </div>

              {/* 控制说明 */}
              <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                <p className="font-medium mb-1">🎯 控制说明：</p>
                <ul className="space-y-1">
                  <li>• 机器人在一个 21x21 的网格环境中移动</li>
                  <li>• 使用积木控制机器人前进、后退、左转、右转</li>
                  <li>• 蓝色轨迹显示机器人走过的路径</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tab 区域 */}
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            {/* Tab 导航 */}
            <div className="flex border-b bg-gray-50">
              {[
                { id: 'simulation', label: '📊 运行状态', icon: '📊' },
                { id: 'code', label: '💻 生成代码', icon: '💻' },
                { id: 'log', label: '📋 执行日志', icon: '📋' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 font-medium transition-all ${
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
            <div className="p-4 h-96 overflow-auto">
              {/* 运行状态 Tab */}
              {activeTab === 'simulation' && (
                <div className="animate-fadeIn">
                  {result ? (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 animate-slideInUp">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🤖</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">机器人状态</h3>
                          <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-6xl mb-4 animate-bounce">🤖</div>
                      <p className="text-lg">运行机器人控制程序后，状态将显示在这里</p>
                    </div>
                  )}
                </div>
              )}

              {/* 代码 Tab */}
              {activeTab === 'code' && (
                <div className="animate-fadeIn">
                  {generatedCode ? (
                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto h-full">
                      <pre className="text-green-400 text-sm font-mono">{generatedCode}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-400">
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
                    <div className="space-y-2 h-full overflow-auto">
                      {executionLog.map((log, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-2 rounded-lg text-sm ${
                            log.type === 'error' ? 'bg-red-50 text-red-800' :
                            log.type === 'success' ? 'bg-green-50 text-green-800' :
                            'bg-blue-50 text-blue-800'
                          } animate-slideInLeft`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">{log.timestamp}</span>
                          <span className="flex-1">{log.message}</span>
                          {log.type === 'error' && '❌'}
                          {log.type === 'success' && '✅'}
                          {log.type === 'info' && 'ℹ️'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-lg">执行日志将显示在这里</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            {isRunning && (
              <span className="flex items-center gap-2 text-green-600 animate-pulse">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-ping"></span>
                机器人运行中...
              </span>
            )}
          </div>

          <div style={{ height: '600px' }} className="overflow-hidden relative">
            <BlocklyEditor
              initialBlocks={currentProject ? currentProject.blocksJson : JSON.stringify(defaultBlocks)}
              toolbox={robotToolbox}
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