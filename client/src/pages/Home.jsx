import Container from '../components/layout/Container';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 text-white">
        <Container className="py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <span className="text-sm font-medium">🚀 开启 AI 学习之旅</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              欢迎来到 witdot
              <br />
              <span className="text-primary-100">AI 教育平台</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-50 leading-relaxed">
              通过可视化编程学习 AI，培养计算思维，让每个孩子都能理解人工智能
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses" className="btn bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                开始学习
              </Link>
              <Link to="/canvas" className="btn border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-6 py-3 text-lg">
                画布编程
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">平台特色</h2>
          <p className="text-gray-600 text-lg">三大核心功能，助力 AI 学习</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card text-center hover:shadow-lg transition-shadow group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI 通识课程</h3>
            <p className="text-gray-600 leading-relaxed">
              系统化的 AI 知识学习，适合不同年龄段的学生，从基础到进阶
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card text-center hover:shadow-lg transition-shadow group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">画布编程</h3>
            <p className="text-gray-600 leading-relaxed">
              通过可视化编程创建你的 AI 智能体，轻松实现创意想法
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card text-center hover:shadow-lg transition-shadow group">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI 助教</h3>
            <p className="text-gray-600 leading-relaxed">
              随时获得 AI 助教的帮助和指导，解答学习中的疑问
            </p>
          </div>
        </div>
      </Container>

      {/* Stats Section */}
      <div className="bg-white border-y border-gray-200">
        <Container className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">在线学生</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">精品课程</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100+</div>
              <div className="text-gray-600">项目作品</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600">满意度</div>
            </div>
          </div>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-50 to-primary-50">
        <Container className="py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">开始你的 AI 学习之旅</h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            加入 witdot 平台，探索人工智能的奥秘，成为未来的 AI 创造者
          </p>
          <Link to="/register" className="btn btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-xl transition-all inline-block">
            立即注册，免费开始
          </Link>
        </Container>
      </div>
    </div>
  );
}
