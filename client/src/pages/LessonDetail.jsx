import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import PPTViewer from '../components/PPTViewer';
import * as coursesAPI from '../api/courses';
import * as recordsAPI from '../api/records';

export default function LessonDetail() {
  const { courseId, lessonId } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPPTViewer, setShowPPTViewer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completingStatus, setCompletingStatus] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchLessonDetail();
    fetchProgressStatus();

    // 记录开始学习时间
    startTimeRef.current = new Date();

    // 页面卸载时记录学习时长
    return () => {
      if (startTimeRef.current) {
        const endTime = new Date();
        recordStudyTime(startTimeRef.current, endTime);
      }
    };
  }, [courseId, lessonId]);

  const fetchLessonDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getLessonById(courseId, lessonId);
      setLessonData(response.data);
    } catch (err) {
      console.error('Error fetching lesson detail:', err);
      setError('加载章节详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressStatus = async () => {
    try {
      const record = await recordsAPI.getCourseProgress(courseId);
      const completed = record.completedSections.some(
        id => id.toString() === lessonId
      );
      setIsCompleted(completed);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const recordStudyTime = async (startTime, endTime) => {
    try {
      await recordsAPI.recordStudyTime(courseId, lessonId, startTime, endTime);
    } catch (err) {
      console.error('Error recording study time:', err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setCompletingStatus(true);
      await recordsAPI.markSectionComplete(courseId, lessonId);
      setIsCompleted(true);

      // 显示成功提示
      alert('恭喜你完成了这一章节！');
    } catch (err) {
      console.error('Error marking complete:', err);
      alert('标记完成失败，请稍后重试');
    } finally {
      setCompletingStatus(false);
    }
  };

  // 将相对路径转换为完整的后端 URL
  const getFullResourceUrl = (relativePath) => {
    if (!relativePath) return null;
    const apiBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return apiBaseUrl + relativePath;
  };

  const handleOpenPPT = () => {
    if (lessonData?.lesson?.pptUrl) {
      setShowPPTViewer(true);
    }
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

  if (error || !lessonData) {
    return (
      <Container>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || '章节不存在'}</p>
        </div>
        <Link to={`/courses/${courseId}`} className="text-primary-600 hover:underline mt-4 inline-block">
          ← 返回课程详情
        </Link>
      </Container>
    );
  }

  const { course, lesson } = lessonData;

  return (
    <Container>
      {/* 面包屑导航 */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/courses" className="hover:text-primary-600">
          课程中心
        </Link>
        <span className="mx-2">›</span>
        <Link to={`/courses/${course.courseId}`} className="hover:text-primary-600">
          {course.title}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{lesson.title}</span>
      </div>

      {/* 章节标题 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
            {lesson.order}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        </div>
        {lesson.description && <p className="text-gray-600 mt-2 ml-11">{lesson.description}</p>}
      </div>

      {/* 视频播放器 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {lesson.videoUrl ? (
          <div className="relative aspect-video bg-black">
            <video
              controls
              className="w-full h-full"
              poster="/video-placeholder.jpg"
            >
              <source src={getFullResourceUrl(lesson.videoUrl)} type="video/mp4" />
              您的浏览器不支持视频播放。
            </video>
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p>暂无视频内容</p>
            </div>
          </div>
        )}

        {/* 视频下方的 PPT 按钮 */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {lesson.pptUrl ? (
            <button
              onClick={handleOpenPPT}
              className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              打开课程 PPT
            </button>
          ) : (
            <p className="text-gray-500 text-sm">暂无 PPT 资料</p>
          )}
        </div>
      </div>

      {/* 章节内容 */}
      {lesson.content && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">课程内容</h2>
          <div className="prose prose-primary max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Link
          to={`/courses/${course.courseId}`}
          className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回课程目录
        </Link>

        <div className="flex items-center gap-4">
          {/* 学习时长提示 */}
          {lesson.duration > 0 && (
            <div className="text-sm text-gray-500 flex items-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              课时时长：{lesson.duration} 分钟
            </div>
          )}

          {/* 完成状态或完成按钮 */}
          {isCompleted ? (
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center">
              <svg
                className="w-5 h-5 mr-2"
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
              已完成
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={completingStatus}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {completingStatus ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  标记中...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
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
                  标记为完成
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* PPT 在线查看器 */}
      {showPPTViewer && lessonData?.lesson?.pptUrl && (
        <PPTViewer
          pptUrl={lessonData.lesson.pptUrl}
          title={lessonData.lesson.title}
          onClose={() => setShowPPTViewer(false)}
        />
      )}
    </Container>
  );
}
