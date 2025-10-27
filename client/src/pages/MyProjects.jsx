import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../components/common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 我的项目页面
 * 显示用户保存的所有 Blockly 项目
 */
export default function MyProjects() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部', icon: '📁' },
    { id: 'imageRecognition', name: '图像识别', icon: '🖼️' },
    { id: 'voiceAssistant', name: '语音助手', icon: '🎤' },
    { id: 'robot', name: '机器人', icon: '🤖' }
  ];

  // 获取项目列表
  const fetchProjects = async (category = '') => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const url = category && category !== 'all'
        ? `${API_URL}/projects?category=${category}`
        : `${API_URL}/projects`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('加载项目失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(selectedCategory);
  }, [selectedCategory]);

  // 删除项目
  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!confirm(`确定要删除项目"${projectTitle}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 刷新列表
      fetchProjects(selectedCategory);
      success('删除成功');
    } catch (err) {
      console.error('Failed to delete project:', err);
      showError('删除失败，请重试');
    }
  };

  // 加载项目到对应画板
  const handleLoadProject = (project) => {
    const categoryPaths = {
      imageRecognition: '/canvas/image-recognition',
      voiceAssistant: '/canvas/voice-assistant',
      robot: '/canvas/robot'
    };

    const path = categoryPaths[project.category];
    if (path) {
      // 通过 URL 参数传递项目 ID，让画板页面加载
      navigate(`${path}?projectId=${project._id}`);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取分类图标
  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '📁';
  };

  // 获取分类名称
  const getCategoryName = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              📁 我的作品
            </h1>
            <Link
              to="/canvas"
              className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition"
            >
              ← 返回画布编程
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            查看和管理你创建的所有项目
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* 项目列表 */}
        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  还没有作品
                </h3>
                <p className="text-gray-600 mb-6">
                  去画布编程创建你的第一个项目吧！
                </p>
                <Link
                  to="/canvas"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-medium"
                >
                  开始创作
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* 项目封面 */}
                    <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">
                      {getCategoryIcon(project.category)}
                    </div>

                    {/* 项目信息 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800 flex-1">
                          {project.title}
                        </h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {getCategoryName(project.category)}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="text-xs text-gray-500 mb-4">
                        更新于 {formatDate(project.updatedAt)}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadProject(project)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-medium text-sm"
                        >
                          打开
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id, project.title)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
