import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import Logo from './Logo';

const Login: React.FC = () => {
  const { user, login, isLoading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 同步认证上下文的错误状态
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // 当用户认证成功时，立即导航到习惯广场
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/marketplace', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(credentials);
      // 导航将由上面的useEffect处理
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ghibli-grass-bg p-4">
      <div className="max-w-md w-full ghibli-card p-8">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h2 className="text-3xl font-bold text-center ghibli-title text-primary mb-6">登录</h2>

        {error && (
          <div className="bg-red-100 border-3 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 ghibli-border">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-3 border-3 border-primary/30 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary transition-all ghibli-btn hover:shadow-md"
              placeholder="请输入用户名"
              disabled={isLoading || authLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-3 border-3 border-primary/30 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary transition-all ghibli-btn hover:shadow-md"
              placeholder="••••••••"
              disabled={isLoading || authLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full ghibli-btn hover:shadow-lg hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || authLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                登录中...
              </div>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            还没有账号？ <button onClick={() => navigate('/register')} className="text-primary hover:text-primaryHover font-medium transition-colors ghibli-btn hover:shadow-md">立即注册</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;