import React, { useState } from 'react';
import { useHabit } from '../contexts/HabitContext';

const Profile: React.FC = () => {
  const { user, updateUser } = useHabit();
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // 创建图片预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setAvatarPreview(previewUrl);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async () => {
    try {
      // 更新用户信息
      await updateUser({
        name,
        avatar: avatarPreview || avatar,
        file
      });
      setIsEditing(false);
      setAvatarPreview(null);
      setFile(null);
    } catch (error) {
      // Error handled by state management
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">个人中心</h2>
          
          {/* 用户头像和基本信息 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img
                src={avatarPreview || avatar}
                alt="用户头像"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            
            {isEditing ? (
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="输入用户名"
                />
              </div>
            ) : (
              <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setAvatarPreview(null);
                    setFile(null);
                  }}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                编辑信息
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 个人信息卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">账户信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">用户ID</span>
              <span className="text-slate-700 font-medium">{user.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">注册时间</span>
              <span className="text-slate-700 font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
