import PropTypes from 'prop-types';

/**
 * 学习数据可视化组件
 * 显示学习统计数据，包括进度、时长、完成课程等
 */
export default function LearningStats({ stats }) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无学习数据
      </div>
    );
  }

  const {
    totalCourses = 0,
    completedCourses = 0,
    totalTimeSpent = 0,
    averageProgress = 0,
  } = stats;

  // 格式化学习时长
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`;
  };

  // 计算完成率
  const completionRate = totalCourses > 0
    ? Math.round((completedCourses / totalCourses) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 学习课程数 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">学习课程</span>
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900">{totalCourses}</div>
          <div className="text-xs text-blue-600 mt-1">
            已完成 {completedCourses} 门
          </div>
        </div>

        {/* 完成率 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">完成率</span>
            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900">{completionRate}%</div>
          <div className="text-xs text-green-600 mt-1">
            平均进度 {averageProgress}%
          </div>
        </div>

        {/* 学习时长 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">学习时长</span>
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900">{formatTime(totalTimeSpent)}</div>
          <div className="text-xs text-purple-600 mt-1">
            累计学习时间
          </div>
        </div>

        {/* 学习成就 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">学习成就</span>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900">{completedCourses}</div>
          <div className="text-xs text-orange-600 mt-1">
            已获得证书
          </div>
        </div>
      </div>

      {/* 进度圆环图 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">整体进度</h3>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 圆环图 */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              {/* 背景圆环 */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              {/* 进度圆环 */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${averageProgress * 5.03} ${500 - averageProgress * 5.03}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* 渐变定义 */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* 中心文字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900">{averageProgress}%</div>
              <div className="text-sm text-gray-600">平均进度</div>
            </div>
          </div>

          {/* 进度说明 */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">已完成</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{completedCourses} 门课程</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">学习中</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {totalCourses - completedCourses} 门课程
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">总学习时长</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatTime(totalTimeSpent)}</span>
            </div>

            {/* 鼓励语 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                {averageProgress < 30 && '🌱 刚刚开始，加油！每一步都是进步！'}
                {averageProgress >= 30 && averageProgress < 60 && '🚀 进步很大！继续保持这个势头！'}
                {averageProgress >= 60 && averageProgress < 90 && '⭐ 做得非常棒！马上就要完成了！'}
                {averageProgress >= 90 && '🎉 太厉害了！你已经是学习之星！'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 学习趋势（简化版） */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">学习建议</h3>

        <div className="space-y-3">
          {totalCourses === 0 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">开始你的学习之旅</p>
                <p className="text-xs text-gray-600">从课程中心选择感兴趣的课程开始学习吧！</p>
              </div>
            </div>
          )}

          {totalCourses > 0 && completedCourses === 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">坚持学习</p>
                <p className="text-xs text-gray-600">完成第一门课程，为自己建立信心！</p>
              </div>
            </div>
          )}

          {completedCourses > 0 && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">继续前进</p>
                <p className="text-xs text-gray-600">你已经完成了 {completedCourses} 门课程，继续探索更多知识！</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

LearningStats.propTypes = {
  stats: PropTypes.shape({
    totalCourses: PropTypes.number,
    completedCourses: PropTypes.number,
    totalTimeSpent: PropTypes.number,
    averageProgress: PropTypes.number,
  }),
};
