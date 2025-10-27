import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import LearningStats from '../components/stats/LearningStats';
import * as recordsAPI from '../api/records';
import * as coursesAPI from '../api/courses';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // 从 localStorage 获取用户信息
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userInfo);

      // 获取学习统计
      const statsData = await recordsAPI.getStudyStats();
      setStats(statsData);

      // 获取所有学习记录
      const records = await recordsAPI.getAllRecords();

      // 获取最近学习的课程（最多5个）
      const recentRecords = records
        .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
        .slice(0, 5);

      setRecentCourses(recentRecords);
    } catch (error) {
      console.error('获取个人信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeLevelLabel = (gradeLevel) => {
    const labels = {
      '1-3': '小学低年级',
      '4-6': '小学高年级',
      '7-9': '初中',
    };
    return labels[gradeLevel] || '未设置';
  };

  const getRoleLabel = (role) => {
    return role === 'teacher' ? '教师' : '学生';
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">加载中...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
        <p className="text-gray-600 mt-2">查看你的学习进度和成就</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 用户信息卡片 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            {/* 用户头像 */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.username || '用户'}</h2>
              <p className="text-sm text-gray-600">{user?.email || ''}</p>
            </div>

            {/* 用户信息 */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">角色</span>
                <span className="text-sm font-medium text-gray-900">
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              {user?.role === 'student' && user?.grade && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">年级</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getGradeLevelLabel(user?.grade)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">加入时间</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                    : '未知'}
                </span>
              </div>
            </div>

            {/* 快捷链接 */}
            <div className="mt-6 space-y-2">
              <Link
                to="/my-projects"
                className="block w-full px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors text-center font-medium text-sm"
              >
                我的作品
              </Link>
              <Link
                to="/courses"
                className="block w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-center font-medium text-sm"
              >
                浏览课程
              </Link>
            </div>
          </div>
        </div>

        {/* 右侧 - 学习数据 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 学习统计 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">学习统计</h2>
            <LearningStats stats={stats} />
          </div>

          {/* 最近学习的课程 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">最近学习</h3>

            {recentCourses.length > 0 ? (
              <div className="space-y-3">
                {recentCourses.map((record) => (
                  <Link
                    key={record._id}
                    to={`/courses/${record.courseId._id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {record.courseId?.title || '未知课程'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          最后学习：
                          {new Date(record.lastAccessedAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* 进度条 */}
                      <div className="ml-4 flex items-center gap-3">
                        <div className="w-24">
                          <div className="text-xs text-gray-600 text-right mb-1">
                            {record.progress}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${record.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* 完成标记 */}
                        {record.isCompleted && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">还没有开始学习课程</p>
                <Link
                  to="/courses"
                  className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  开始学习
                </Link>
              </div>
            )}
          </div>

          {/* 学习成就（未来扩展） */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">学习成就</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 成就徽章示例 */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-xs text-gray-600">首次完成</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.completedCourses > 0 ? '已获得' : '未获得'}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-xs text-gray-600">学习之星</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.completedCourses >= 3 ? '已获得' : '未获得'}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">🚀</div>
                <div className="text-xs text-gray-600">进步神速</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.completedCourses >= 5 ? '已获得' : '未获得'}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">💎</div>
                <div className="text-xs text-gray-600">学习达人</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats?.completedCourses >= 10 ? '已获得' : '未获得'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
