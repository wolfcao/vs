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
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">欢迎回来</h2>
          <p className="text-center text-blue-100">登录您的账号继续使用</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-6 animate-fadeIn">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                用户名
              </label>
              <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${isUsernameFocused ? 'ring-2 ring-blue-500' : 'border-2 border-gray-200 hover:border-gray-300'}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 focus:outline-none text-gray-900"
                  placeholder="请输入用户名"
                  disabled={isLoading || authLoading}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setIsUsernameFocused(false)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  密码
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  忘记密码？
                </a>
              </div>
              <div className={`relative rounded-lg overflow-hidden transition-all duration-300 ${isPasswordFocused ? 'ring-2 ring-blue-500' : 'border-2 border-gray-200 hover:border-gray-300'}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 focus:outline-none text-gray-900"
                  placeholder="••••••••"
                  disabled={isLoading || authLoading}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">或</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                还没有账号？ 
                <button 
                  onClick={() => navigate('/register')} 
                  className="ml-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  立即注册
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;