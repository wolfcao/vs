import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterCredentials } from '../types';
import Logo from './Logo';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    username: '',
    email: '',
    password: '',
    avatar: '',
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
    <div className="min-h-screen flex items-center justify-center ghibli-grass-bg p-4">
      <div className="max-w-md w-full ghibli-card p-8">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h2 className="text-3xl font-bold text-center ghibli-title text-primary mb-6">注册</h2>

        {error && (
          <div className="bg-red-100 border-3 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 ghibli-border">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-3 border-3 border-primary/30 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary transition-all ghibli-btn hover:shadow-md"
              placeholder="您的真实姓名"
              disabled={isLoading || authLoading}
            />
          </div>

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
              placeholder="请输入登录用户名"
              disabled={isLoading || authLoading}
            />
            {usernameError && (
              <p className="text-red-500 text-xs mt-1">{usernameError}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-3 border-3 border-primary/30 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary transition-all ghibli-btn hover:shadow-md"
              placeholder="your@example.com"
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
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
              头像URL (可选)
            </label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={credentials.avatar}
              onChange={handleInputChange}
              className="w-full px-5 py-3 border-3 border-primary/30 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary transition-all ghibli-btn hover:shadow-md"
              placeholder="https://i.pravatar.cc/150?img=1"
              disabled={isLoading || authLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading || !!passwordError || !!usernameError}
            className="w-full ghibli-btn hover:shadow-lg hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || authLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                注册中...
              </div>
            ) : (
              '注册'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            已有账号？ <button onClick={() => navigate('/login')} className="text-primary hover:text-primaryHover font-medium transition-colors ghibli-btn hover:shadow-md">立即登录</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;