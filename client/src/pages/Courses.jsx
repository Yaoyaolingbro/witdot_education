import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import * as coursesAPI from '../api/courses';
import * as recordsAPI from '../api/records';
import useAuthStore from '../store/useAuthStore';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState({});  // 学习记录，key 为 courseId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    gradeLevel: '',
    category: '',
  });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchRecords();
    }
  }, [filter, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        isPublished: true,
        ...(filter.gradeLevel && { gradeLevel: filter.gradeLevel }),
        ...(filter.category && { category: filter.category }),
      };
      const response = await coursesAPI.getCourses(params);
      setCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('加载课程失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const allRecords = await recordsAPI.getAllRecords();
      // 转换为对象，key 为 courseId
      const recordsMap = {};
      allRecords.forEach(record => {
        recordsMap[record.courseId._id || record.courseId] = record;
      });
      setRecords(recordsMap);
    } catch (err) {
      console.error('Error fetching records:', err);
      // 不显示错误，静默失败
    }
  };

  const getProgressInfo = (courseId) => {
    const record = records[courseId];
    if (!record) {
      return { progress: 0, completed: 0, total: 0 };
    }
    const course = courses.find(c => c.courseId === courseId);
    const total = course?.lessons?.length || 0;
    const completed = record.completedSections.length;
    const progress = record.progress || 0;
    return { progress, completed, total };
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    };
    return labels[difficulty] || difficulty;
  };

  const getGradeLevelLabel = (gradeLevel) => {
    const labels = {
      '1-3': '小学低年级',
      '4-6': '小学高年级',
      '7-9': '初中',
    };
    return labels[gradeLevel] || gradeLevel;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      ai_literacy: 'AI 通识',
      canvas_coding: '画布编程',
    };
    return labels[category] || category;
  };

  return (
    <Container>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">课程中心</h1>
        <p className="text-gray-600">探索 AI 的奇妙世界，开启智能编程之旅</p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">年级</label>
            <select
              value={filter.gradeLevel}
              onChange={(e) => setFilter({ ...filter, gradeLevel: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部年级</option>
              <option value="1-3">小学低年级</option>
              <option value="4-6">小学高年级</option>
              <option value="7-9">初中</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">分类</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部分类</option>
              <option value="ai_literacy">AI 通识</option>
              <option value="canvas_coding">画布编程</option>
            </select>
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">加载中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 课程列表 */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">暂无课程</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Link
              key={course.courseId}
              to={`/courses/${course.courseId}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                {/* 课程封面 */}
                <div className="w-full md:w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-white"
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
                  )}
                </div>

                {/* 课程信息 */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                  {/* 标签 */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded">
                      {getCategoryLabel(course.category)}
                    </span>
                    <span className="text-gray-500">{getGradeLevelLabel(course.gradeLevel)}</span>
                    <span className="text-gray-500">{course.lessons?.length || 0} 个章节</span>
                    {course.duration > 0 && (
                      <span className="text-gray-500">{course.duration} 分钟</span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {getDifficultyLabel(course.difficulty)}
                    </span>
                  </div>

                  {/* 学习目标（可选显示） */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 font-medium">学习目标：</p>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {course.objectives.slice(0, 2).map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                        {course.objectives.length > 2 && (
                          <li className="text-gray-500 italic">
                            还有 {course.objectives.length - 2} 个学习目标...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* 学习进度条 */}
                  {user && (() => {
                    const { progress, completed, total } = getProgressInfo(course.courseId);
                    if (progress > 0) {
                      return (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">学习进度</span>
                            <span className="font-medium text-primary-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            已完成 {completed} / {total} 个章节
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* 箭头图标 */}
                <div className="hidden md:flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
