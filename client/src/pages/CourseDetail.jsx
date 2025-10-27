import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import * as coursesAPI from '../api/courses';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getCourseById(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course detail:', err);
      setError('加载课程详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
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

  if (error || !course) {
    return (
      <Container>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || '课程不存在'}</p>
        </div>
        <Link to="/courses" className="text-primary-600 hover:underline mt-4 inline-block">
          ← 返回课程列表
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      {/* 返回链接 */}
      <Link to="/courses" className="text-primary-600 hover:underline mb-6 inline-block">
        ← 返回课程列表
      </Link>

      {/* 课程头部信息 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white mb-8">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-white/90 text-lg mb-6">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-white/20 rounded-full">
                {getGradeLevelLabel(course.gradeLevel)}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                {getDifficultyLabel(course.difficulty)}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full">
                {course.lessons?.length || 0} 个章节
              </span>
              {course.duration > 0 && (
                <span className="px-3 py-1 bg-white/20 rounded-full">{course.duration} 分钟</span>
              )}
            </div>
          </div>

          {/* 学习目标 */}
          {course.objectives && course.objectives.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg
                  className="w-6 h-6 text-primary-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                学习目标
              </h2>
              <ul className="space-y-2">
                {course.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="text-primary-500 font-bold mr-3">{index + 1}.</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 课程章节列表 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <svg
                className="w-6 h-6 text-primary-600 mr-2"
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
              课程章节
            </h2>

            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <Link
                      key={lesson.lessonId}
                      to={`/courses/${course.courseId}/lessons/${lesson.lessonId}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start">
                        {/* 章节序号 */}
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold mr-4">
                          {lesson.order}
                        </div>

                        {/* 章节信息 */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {lesson.duration > 0 && <span>{lesson.duration} 分钟</span>}
                            {lesson.videoUrl && (
                              <span className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                视频
                              </span>
                            )}
                            {lesson.pptUrl && (
                              <span className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                PPT
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 箭头 */}
                        <div className="flex-shrink-0 ml-4">
                          <svg
                            className="w-5 h-5 text-gray-400"
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
            ) : (
              <p className="text-gray-600 text-center py-8">暂无章节内容</p>
            )}
          </div>
    </Container>
  );
}
