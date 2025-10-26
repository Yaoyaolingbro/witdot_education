const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请先登录',
      });
    }

    // 验证 token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
    );

    // 将用户信息添加到请求对象
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token 已过期，请重新登录',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token 无效',
    });
  }
};

module.exports = authMiddleware;
