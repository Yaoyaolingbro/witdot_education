import { useState } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../common/Toast';

/**
 * 互动练习题组件
 * 支持选择题和填空题
 * 适合小学生使用的友好界面
 */
export default function QuizComponent({ quiz, onSubmit, onClose }) {
  const { warning } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无测验题目
      </div>
    );
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  /**
   * 处理答案选择
   */
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  /**
   * 下一题
   */
  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  /**
   * 上一题
   */
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  /**
   * 提交测验
   */
  const handleSubmit = () => {
    // 检查是否所有题目都已作答
    const unanswered = questions.findIndex((_, index) => !answers[index]);
    if (unanswered !== -1) {
      warning(`还有第 ${unanswered + 1} 题未作答哦！`);
      setCurrentQuestion(unanswered);
      return;
    }

    // 计算得分
    let correctCount = 0;
    let totalPoints = 0;

    questions.forEach((question, index) => {
      totalPoints += question.points || 1;
      if (answers[index] === question.answer) {
        correctCount += question.points || 1;
      }
    });

    const result = {
      score: correctCount,
      totalPoints,
      percentage: Math.round((correctCount / totalPoints) * 100),
    };

    setScore(result);
    setSubmitted(true);

    // 将答案数组传递给父组件
    const answerArray = questions.map((_, index) => answers[index] || '');
    onSubmit?.(answerArray, result);
  };

  /**
   * 重新测验
   */
  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  // 当前题目
  const question = questions[currentQuestion];
  const userAnswer = answers[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  // 如果已提交，显示结果页面
  if (submitted && score) {
    const passed = score.percentage >= 60;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* 结果标题 */}
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${passed ? 'animate-bounce' : ''}`}>
            {passed ? '🎉' : '💪'}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
            {passed ? '太棒了！测验通过！' : '继续加油！'}
          </h3>
          <p className="text-gray-600">
            你答对了 {score.score} / {score.totalPoints} 分
          </p>
        </div>

        {/* 得分显示 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {score.percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-1">准确率</div>
            </div>
            <div className="text-4xl text-gray-300">|</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {answeredCount}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600 mt-1">完成题目</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            再测一次
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors font-medium"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  // 测验进行中
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* 头部 - 进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            📝 互动测验
          </h3>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          已答题：{answeredCount} / {totalQuestions}
        </div>
      </div>

      {/* 题目内容 */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {currentQuestion + 1}
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-800 leading-relaxed">
              {question.question}
            </p>
            {question.points > 1 && (
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                {question.points} 分
              </span>
            )}
          </div>
        </div>

        {/* 选择题 */}
        {question.type === 'choice' && question.options && (
          <div className="space-y-3 ml-11">
            {question.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = userAnswer === option;

              return (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(currentQuestion, option)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                      {optionLabel}.
                    </span>
                    <span className={isSelected ? 'text-blue-900' : 'text-gray-700'}>
                      {option}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* 填空题 */}
        {question.type === 'fill' && (
          <div className="ml-11">
            <input
              type="text"
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
              placeholder="请输入答案..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-base"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 提示：请仔细思考后填写答案
            </p>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          ← 上一题
        </button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              下一题 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium"
            >
              提交答案 ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

QuizComponent.propTypes = {
  quiz: PropTypes.shape({
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        question: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['choice', 'fill']).isRequired,
        options: PropTypes.arrayOf(PropTypes.string), // 选择题选项
        answer: PropTypes.string.isRequired, // 正确答案
        points: PropTypes.number, // 分值
      })
    ).isRequired,
  }).isRequired,
  onSubmit: PropTypes.func, // 提交回调 (answers, result) => void
  onClose: PropTypes.func, // 关闭回调
};
