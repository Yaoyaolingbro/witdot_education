import Container from '../components/layout/Container';

export default function CanvasCoding() {
  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8">画布编程</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">图像识别画板</h3>
          <p className="text-gray-600 text-sm">
            上传图片，让 AI 帮你识别内容
          </p>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer opacity-60">
          <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">语音助手画板</h3>
          <p className="text-gray-600 text-sm">
            即将推出
          </p>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer opacity-60">
          <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">机器人画板</h3>
          <p className="text-gray-600 text-sm">
            即将推出
          </p>
        </div>
      </div>
    </Container>
  );
}
