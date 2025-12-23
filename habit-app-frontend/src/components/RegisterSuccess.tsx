import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">🎉 注册成功！</h2>
          <p className="text-center text-blue-100">欢迎加入习惯星球</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">您的账户已创建成功</h3>
            <p className="text-gray-600 text-lg">
              现在您可以登录并开始您的习惯养成之旅
            </p>
          </div>
          
          <div className="space-y-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:translate-y-0 transition-all duration-300 text-lg"
            >
              🚀 前往登录
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>欢迎加入我们的社区！让我们一起培养好习惯，成就更好的自己。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;