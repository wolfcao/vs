import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { ArrowRight, Flame, CheckCircle2, Clock } from "lucide-react";

const Dashboard: React.FC = () => {
  const { myActiveHabits, user } = useHabit();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "created">('active');

  // Filter habits by status
  const activeHabits = myActiveHabits.filter(habit => habit.status === 'active');
  const pendingHabits = myActiveHabits.filter(habit => habit.status === 'pending');
  // Filter habits created by current user
  const createdHabits = myActiveHabits.filter(habit => habit.habitSnapshot?.authorId === user?.id);

  // Determine which habits to display based on active tab
  const displayedHabits = activeTab === 'active' ? activeHabits : 
                         activeTab === 'pending' ? pendingHabits : 
                         createdHabits;

  if (!myActiveHabits || myActiveHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-textSecondary" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">无活跃小队</h3>
        <p className="text-textSecondary max-w-sm mb-6">
          你还没有加入任何习惯小队。去广场寻找你的小队吧！
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primaryHover ghibli-btn hover:shadow-lg hover:translate-y-[-2px] active:scale-95"
        >
          探索习惯
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text">我的习惯小队</h2>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-text'}`}
          >
            已加入 ({activeHabits.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-text'}`}
          >
            申请中 ({pendingHabits.length})
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`py-3 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'created' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-text'}`}
          >
            我创建的 ({createdHabits.length})
          </button>
        </div>
      </div>

      {displayedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            {activeTab === 'active' ? (
              <CheckCircle2 className="w-8 h-8 text-textSecondary" />
            ) : activeTab === 'pending' ? (
              <Clock className="w-8 h-8 text-textSecondary" />
            ) : (
              <Flame className="w-8 h-8 text-textSecondary" />
            )}
          </div>
          <h3 className="text-xl font-bold text-text mb-2">
            {activeTab === 'active' ? '无已加入小队' : 
             activeTab === 'pending' ? '无申请中小队' : 
             '无创建的小队'}
          </h3>
          <p className="text-textSecondary max-w-sm mb-6">
            {activeTab === 'active' 
              ? '你还没有加入任何习惯小队。去广场寻找你的小队吧！' 
              : activeTab === 'pending' 
              ? '你没有任何待处理的小队申请。' 
              : '你还没有创建任何习惯小队。去创建一个新的习惯挑战吧！'}
          </p>
          {(activeTab === 'active' || activeTab === 'created') && (
            <button
              onClick={() => navigate(activeTab === 'created' ? "/create" : "/marketplace")}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primaryHover ghibli-btn hover:shadow-lg hover:translate-y-[-2px] active:scale-95"
            >
              {activeTab === 'created' ? '创建习惯' : '探索习惯'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {displayedHabits.map((active) => {
            const completedCount = Object.values(active.myLogs || {}).filter(
              (l) => l.isCompleted
            ).length;
            const totalTasks = active.habitSnapshot?.dailyTasks?.length || 0;
            const progress = 
              totalTasks > 0
                ? Math.round((completedCount / totalTasks) * 100)
                : 0;

            return (
              <div
                key={active.id}
                onClick={() => navigate(`/detail/${active.id}`)}
                className="ghibli-card rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        {active.habitSnapshot?.title || "未命名习惯"}
                      </h3>
                      {active.status === 'pending' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          待审核
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 space-x-2 text-sm text-textSecondary">
                      <span>
                        Day {active.currentDay} of {
                          active.habitSnapshot?.durationDays || 0
                        }
                      </span>
                      <span className="w-1 h-1 bg-border rounded-full"></span>
                      <span>
                        Start: {active.habitSnapshot?.dailyStartTime || "00:00"}
                      </span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {active.members?.map((m, i) => (
                      <img
                        key={i}
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                        title={m.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-textSecondary mb-1">
                    <span>今日进度</span>
                    <span
                      className={progress === 100 ? "text-success" : "text-text"}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                  {active.status === 'pending' ? '查看申请状态' : '进入小队房间'} {
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
