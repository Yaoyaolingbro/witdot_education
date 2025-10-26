import client from './client';

// 用户注册
export const register = async (userData) => {
  try {
    const response = await client.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '注册失败' };
  }
};

// 用户登录
export const login = async (credentials) => {
  try {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '登录失败' };
  }
};

// 获取当前用户信息
export const getProfile = async () => {
  try {
    const response = await client.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '获取用户信息失败' };
  }
};

// 更新用户信息
export const updateProfile = async (userData) => {
  try {
    const response = await client.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: '更新失败' };
  }
};
