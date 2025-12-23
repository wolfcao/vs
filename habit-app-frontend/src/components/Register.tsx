import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterCredentials } from '../types';
import Logo from './Logo';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    password: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { register, isLoading: authLoading, error: authError, isJustRegistered } = useAuth();

  // 同步认证上下文的错误状态
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // 注册成功后跳转到注册成功页面
  useEffect(() => {
    if (isJustRegistered) {
      navigate('/register-success');
    }
  }, [isJustRegistered, navigate]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));

    // 验证密码
    if (name === 'password') {
      if (value.length < 6) {
        setPasswordError('密码长度至少需要6个字符');
      } else {
        setPasswordError(null);
      }
    }

    // 验证用户名
    if (name === 'username') {
      if (value.length < 3) {
        setUsernameError('用户名长度至少需要3个字符');
      } else if (value.length > 50) {
        setUsernameError('用户名长度不能超过50个字符');
      } else {
        setUsernameError(null);
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 验证密码
    if (credentials.password.length < 6) {
      setPasswordError('密码长度至少需要6个字符');
      setIsLoading(false);
      return;
    }

    // 验证用户名
    if (credentials.username.length < 3 || credentials.username.length > 50) {
      setUsernameError('用户名长度需要在3-50个字符之间');
      setIsLoading(false);
      return;
    }

    try {
      await register(credentials);
      // 注册成功后，AuthContext会自动处理重定向
    } catch (err) {
      setError('注册失败，请稍后再试');
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
          <h2 className="text-3xl font-bold text-center text-white mb-2">创建账号</h2>
          <p className="text-center text-blue-100">开启您的习惯养成之旅</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-6 transition-all duration-300">
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
                登录名
              </label>
              <div className="relative rounded-lg overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17 10a7 7 0 11-14 0 7 7 0 0114 0zm-7-4a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
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
                  placeholder="请输入登录名"
                  disabled={isLoading || authLoading}
                />
              </div>
              {usernameError && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {usernameError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                登录密码
              </label>
              <div className="relative rounded-lg overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
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
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                姓名(或别名)
              </label>
              <div className="relative rounded-lg overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={credentials.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 focus:outline-none text-gray-900"
                  placeholder="您的姓名或昵称"
                  disabled={isLoading || authLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading || !!passwordError || !!usernameError}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  注册中...
                </div>
              ) : (
                '创建账号'
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
                已有账号？ 
                <button 
                  onClick={() => navigate('/login')} 
                  className="ml-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;