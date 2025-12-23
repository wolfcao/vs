import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Camera,
  LogOut,
  User,
  Mail,
  Shield,
  Edit3,
  Check,
  X,
  Award,
  Flame,
  Calendar,
  Star,
  Copy,
  Venus,
  Mars,
  Circle,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUser, myActiveHabits } = useHabit();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(
    user.gender
  );
  const [avatar, setAvatar] = useState(user.avatar);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setAvatarPreview(previewUrl);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateUser({
        name,
        email,
        gender,
        avatar: avatarPreview || avatar,
        file,
      });
      setIsEditing(false);
      setAvatarPreview(null);
      setFile(null);
    } catch (error) {
      console.error("更新失败", error);
    }
  };

  const activeSquadsCount = myActiveHabits?.length || 0;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="ghibli-card bg-surface shadow-2xl overflow-hidden relative border-none">
        {/* 顶部艺术背景 */}
        <div className="h-40 bg-gradient-to-r from-primary via-blue-400 to-indigo-400 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* 头像区域 - 解决错位的关键是绝对定位 */}
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div className="relative group">
              <img
                src={avatarPreview || avatar}
                alt="Profile"
                className="w-32 h-32 rounded-[2.5rem] object-cover border-8 border-white shadow-xl bg-white transition-transform duration-300 group-hover:scale-105"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 等级标签 - 放置在蓝色背景区域内 */}
          <div className="absolute bottom-4 left-[180px] md:left-[200px]">
            <span className="text-[10px] bg-white/80 text-primary px-3 py-1 rounded-full border border-white/50 flex items-center gap-1 font-bold shadow-md">
              <Star className="w-3 h-3 fill-current" /> LV.1 冒险者
            </span>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="pt-20 px-8 md:px-12 pb-12">
          {/* 昵称与操作区 - 采用 Flex 布局并固定最小高度防止错位 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 min-h-[100px]">
            <div className="flex-1 space-y-6">
              {isEditing ? (
                <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                  {/* 昵称表单 */}
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className="ghibli-input text-2xl py-6 px-6 pr-24 block w-full rounded-2xl border-2 border-border/50 focus:border-primary transition-all group-focus-within:pt-7"
                      placeholder="请输入昵称"
                      autoFocus
                    />
                    <label className="absolute left-4 top-3 text-textSecondary font-black text-xs uppercase tracking-widest transition-all group-focus-within:top-2 group-focus-within:text-primary pointer-events-none opacity-0 group-focus-within:opacity-100">
                      昵称
                    </label>
                  </div>

                  {/* 邮箱表单 */}
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ghibli-input text-2xl py-6 px-6 pr-24 block w-full rounded-2xl border-2 border-border/50 focus:border-primary transition-all group-focus-within:pt-7"
                      placeholder="请输入邮箱"
                    />
                    <label className="absolute left-4 top-3 text-textSecondary font-black text-xs uppercase tracking-widest transition-all group-focus-within:top-2 group-focus-within:text-primary pointer-events-none opacity-0 group-focus-within:opacity-100">
                      邮箱
                    </label>
                  </div>

                  {/* 性别选择 */}
                  <div className="w-full px-[30px]">
                    <div className="flex justify-center gap-8">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={gender === "male"}
                          onChange={() => setGender("male")}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="font-medium group-hover:text-primary transition-colors">
                          男
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={gender === "female"}
                          onChange={() => setGender("female")}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="font-medium group-hover:text-primary transition-colors">
                          女
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-text ghibli-title">
                      {user.name}
                    </h1>
                    {user.gender && (
                      <div className="flex items-center gap-1 text-textSecondary">
                        {user.gender === "male" && (
                          <Mars className="w-5 h-5 text-blue-500" />
                        )}
                        {user.gender === "female" && (
                          <Venus className="w-5 h-5 text-pink-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-textSecondary font-medium flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" /> {user.email || "未绑定邮箱"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setEmail(user.email);
                      setGender(user.gender);
                      setAvatarPreview(null);
                    }}
                    className="ghibli-btn ghibli-btn-secondary px-6 py-3 rounded-2xl font-bold bg-secondary hover:bg-border transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> 取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="ghibli-btn px-8 py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> 保存
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ghibli-btn px-8 py-3 rounded-2xl group flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  编辑资料
                </button>
              )}
            </div>
          </div>

          {/* 统计数据网格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-[2rem] text-center group hover:bg-primary/10 transition-colors">
              <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-text">
                {activeSquadsCount}
              </div>
              <div className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1">
                活跃小队
              </div>
            </div>

            <div className="bg-success/5 border-2 border-success/20 p-6 rounded-[2rem] text-center group hover:bg-success/10 transition-colors">
              <div className="bg-success text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-text">0</div>
              <div className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1">
                获得勋章
              </div>
            </div>

            <div className="bg-warning/5 border-2 border-warning/20 p-6 rounded-[2rem] text-center group hover:bg-warning/10 transition-colors">
              <div className="bg-warning text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-text">1</div>
              <div className="text-[10px] text-textSecondary font-black uppercase tracking-widest mt-1">
                注册天数
              </div>
            </div>
          </div>

          {/* 账户详情区域 */}
          <div className="mt-12 space-y-4">
            <h3 className="text-lg font-black text-text flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" /> 账户安全
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 bg-background/50 rounded-2xl border-2 border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-textSecondary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest">
                      登录用户名
                    </p>
                    <p className="font-bold text-text">{user.username}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">
                  正常使用中
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-background/50 rounded-2xl border-2 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-textSecondary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest">
                      用户识别 ID
                    </p>
                    <p className="font-mono text-xs text-textSecondary">
                      {String(user.id).slice(0, 24)}...
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-textSecondary">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 底部登出区域 */}
          <div className="mt-12 pt-8 border-t-2 border-dashed border-border flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-10 py-4 bg-red-50 text-red-500 font-black rounded-full border-2 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 shadow-sm"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              安全退出账号
            </button>
            <p className="text-[10px] text-textSecondary mt-6 font-bold uppercase tracking-[0.2em]">
              Habit Squad v1.0.4 • 伴你同行
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
