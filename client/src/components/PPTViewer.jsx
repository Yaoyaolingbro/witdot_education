import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * PPT 在线预览组件
 * 由于浏览器限制，提供多种查看方案
 */
export default function PPTViewer({ pptUrl, title, onClose }) {
  const [viewMode, setViewMode] = useState('google-docs'); // 'google-docs' | 'office-online' | 'download'
  const [loading, setLoading] = useState(true);

  // 获取完整的 PPT URL
  const getFullPPTUrl = () => {
    if (!pptUrl) return '';

    // 如果已经是完整 URL，直接返回
    if (pptUrl.startsWith('http')) {
      return pptUrl;
    }

    // 否则拼接后端地址
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3210';
    return apiBaseUrl + pptUrl;
  };

  // Google Docs Viewer URL
  const getGoogleDocsViewerUrl = () => {
    const fullUrl = getFullPPTUrl();
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  // Office Online Viewer URL
  const getOfficeViewerUrl = () => {
    const fullUrl = getFullPPTUrl();
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
  };

  const handleDownload = () => {
    const fullUrl = getFullPPTUrl();
    window.open(fullUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* 头部工具栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">{title || 'PPT 预览'}</h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* 查看方式选择 */}
            <div className="flex items-center space-x-2 text-sm border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('google-docs')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'google-docs'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Google 预览
              </button>
              <button
                onClick={() => setViewMode('office-online')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'office-online'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Office 预览
              </button>
            </div>

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              下载 PPT
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2"
              title="关闭"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* PPT 预览区域 */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">加载中...</p>
                <p className="text-sm text-gray-500 mt-2">首次加载可能需要较长时间</p>
              </div>
            </div>
          )}

          {viewMode === 'google-docs' && (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={getGoogleDocsViewerUrl()}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800 max-w-2xl">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  使用 Google Docs Viewer 预览 | 本地开发环境可能无法使用，建议下载查看
                </p>
              </div>
            </div>
          )}

          {viewMode === 'office-online' && (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={getOfficeViewerUrl()}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={title}
              />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800 max-w-2xl">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Office Online 需要公网 URL | 本地环境 (localhost) 无法使用，请下载查看
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示和说明 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 使用提示</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>本地开发</strong>：在线预览功能受限，建议<strong className="text-primary-600">直接下载</strong>后使用 Office/WPS 查看</li>
                <li>• <strong>生产环境</strong>：部署到服务器后，在线预览功能可正常使用</li>
                <li>• <strong>最佳体验</strong>：下载到本地，使用 PowerPoint 或 WPS 打开，可查看完整动画效果</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                直接下载 PPT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PPTViewer.propTypes = {
  pptUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
