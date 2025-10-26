import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // 登录
      login: (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
        // 保存 token 到 localStorage
        localStorage.setItem('token', token);
      },

      // 注册（注册成功后自动登录）
      register: (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('token', token);
      },

      // 登出
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
      },

      // 更新用户信息
      updateUser: (userData) => {
        set({
          user: { ...get().user, ...userData },
        });
      },

      // 设置加载状态
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // 从 token 恢复用户信息
      restoreAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ token, isLoading: true });
          try {
            // 调用 API 获取用户信息
            const response = await fetch('http://localhost:3000/api/auth/profile', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              set({
                user: data.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Token 无效，清除
              get().logout();
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('恢复认证失败:', error);
            get().logout();
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partiallyPersist: true,
    }
  )
);

export default useAuthStore;
