import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center ghibli-grass-bg p-4">
      <div className="max-w-md w-full ghibli-card p-8">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h2 className="text-3xl font-bold text-center ghibli-title text-success mb-4">🎉 注册成功！</h2>
        <p className="text-center text-gray-700 mb-10 text-lg">
          您的账户已成功创建，请登录以继续使用我们的应用
        </p>
        
        <div className="flex flex-col space-y-6">
          <button
            onClick={() => navigate('/login')}
            className="w-full ghibli-btn-success hover:shadow-lg hover:translate-y-[-2px] active:scale-95 text-lg py-4"
          >
            🚀 前往登录
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>欢迎加入习惯小队！让我们一起培养好习惯，探索更美好的世界。</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;