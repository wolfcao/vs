import React, { useState, useEffect } from "react";
import { useHabit } from "../contexts/HabitContext";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Clock,
  Edit2,
  Users,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ActiveHabit, SubTask } from "../types";
import { activeHabitApi } from "../services/api";

const formatTime = (seconds: number) => {
  // Ensure seconds is a valid number
  const validSeconds = isNaN(seconds) ? 0 : seconds;
  const m = Math.floor(validSeconds / 60);
  const s = validSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const HabitDetail: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const { myActiveHabits, toggleTimer, completeTask, requestTimeChange, approveJoinRequest, rejectJoinRequest, refreshContext } = useHabit();
  const { user: authUser } = useAuth();
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [isProcessingChange, setIsProcessingChange] = useState(false);
  const [activeHabit, setActiveHabit] = useState<ActiveHabit | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active habit detail from API if not found in initial myActiveHabits
  useEffect(() => {
    const fetchActiveHabitDetail = async () => {
      if (!habitId) {
        setError("习惯ID无效");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First try to find in existing myActiveHabits
        const existingHabit = myActiveHabits.find((h) => h.id === habitId);
        if (existingHabit) {
          setActiveHabit(existingHabit);
          setIsLoading(false);
          return;
        }

        // If not found, fetch from API directly
        // Fetching active habit detail from API
        const fetchedHabit = await activeHabitApi.getById(habitId);
        setActiveHabit(fetchedHabit);
      } catch (err) {
        // Error handled by state management
        setError("无法获取习惯详情");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveHabitDetail();
  }, [habitId]);

  // Update activeHabit when myActiveHabits changes (e.g., when timer updates)
  useEffect(() => {
    if (habitId && !isLoading) {
      const existingHabit = myActiveHabits.find((h) => h.id === habitId);
      if (existingHabit) {
        setActiveHabit(existingHabit);
      }
    }
  }, [habitId, myActiveHabits, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <RefreshCw className="h-16 w-16 text-primary animate-spin" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            加载习惯详情中...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !activeHabit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {error || "习惯未找到"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || "抱歉，您访问的习惯不存在或已被删除。"}
          </p>
          <button
            onClick={() => {
              refreshContext();
              navigate("/dashboard");
            }}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 mt-4"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  const handleTimeChangeRequest = async () => {
    if (!newTime) return;
    setIsProcessingChange(true);
    await requestTimeChange(activeHabit.id, newTime);
    setIsProcessingChange(false);
    setIsEditTimeModalOpen(false);
  };

  const isAllTasksDone =
    activeHabit.habitSnapshot?.dailyTasks?.every(
      (t) => activeHabit.myLogs[t.id]?.isCompleted
    ) || false;

  // Check if current user is the creator of the habit
  const isCreator = authUser?.id === activeHabit.habitSnapshot?.authorId;

  // Mock pending requests (in real app, this would come from the backend)
  const pendingRequests = [
    { id: '1', userId: 'user3', name: '张三', avatar: 'https://i.pravatar.cc/150?img=3', requestTime: '2025-12-19 14:30' },
    { id: '2', userId: 'user4', name: '李四', avatar: 'https://i.pravatar.cc/150?img=4', requestTime: '2025-12-19 15:45' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <button onClick={() => navigate("/dashboard")} className="text-textSecondary hover:text-text">
          返回
        </button>
        <span className="text-border">/</span>
        <span className="text-textSecondary">小队房间</span>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-32 h-32 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-text relative z-10">
          {activeHabit.habitSnapshot?.title || "未命名习惯"}
        </h1>
        <p className="text-textSecondary text-sm mt-1 relative z-10 max-w-lg">
          {activeHabit.habitSnapshot?.description || ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-4 relative z-10">
          <div className="flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 mr-2" />
            开始时间: {activeHabit.habitSnapshot?.dailyStartTime || "00:00"}
            {activeHabit.hasModifiedTimeToday !== true && (
              <button
                onClick={() => {
                  setNewTime(
                    activeHabit.habitSnapshot?.dailyStartTime || "00:00"
                  );
                  setIsEditTimeModalOpen(true);
                }}
                className="ml-2 p-1 hover:bg-primary/20 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center bg-secondary text-text px-3 py-1.5 rounded-lg text-sm font-medium">
            <Users className="w-4 h-4 mr-2" />
            {activeHabit.members?.length || 0} 成员
          </div>
        </div>
      </div>

      {/* Two Columns: My Tasks vs Team Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: My Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">今日任务</h2>
            {isAllTasksDone && (
              <span className="bg-success/2 text-success-500 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                任务完成
              </span>
            )}
          </div>

          <div className="space-y-3">
            {activeHabit.habitSnapshot?.dailyTasks?.map((task) => {
              const log = activeHabit.myLogs?.[task.id] || {
                elapsedSeconds: 0,
                isCompleted: false,
                isRunning: false,
              };
              const isDone = log?.isCompleted;
              const minTimeReached =
                log.elapsedSeconds >= task.minDurationMinutes * 60;

              return (
                <div
                  key={task.id}
                  className={`bg-surface border rounded-xl p-4 transition-all ${
                    isDone
                      ? "border-success/3 bg-success/50"
                      : "border-border200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className={`font-semibold ${
                          isDone ? "text-success-600" : "text-gray-800"
                        }`}
                      >
                        {task.name}
                      </h3>
                      <div className="text-xs text-textSecondary flex items-center">
                        最低要求: {task.minDurationMinutes} 分钟
                      </div>
                    </div>
                    <div className="text-2xl font-mono font-medium text-gray-700">
                      {formatTime(log.elapsedSeconds)}
                    </div>
                  </div>

                  {/* Controls */}
                  {!isDone && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTimer(activeHabit.id, task.id)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg font-medium transition-colors ${
                          log.isRunning
                            ? "bg-warning/2 text-warning hover:bg-warning/30"
                            : "bg-primary-600 text-white hover:bg-primaryHover"
                        }`}
                      >
                        {log.isRunning ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" /> 暂停计时
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {log.elapsedSeconds > 0 ? "继续" : "开始计时"}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => completeTask(activeHabit.id, task.id)}
                        disabled={!minTimeReached || log.isRunning} // Must pause to finish? Or can finish while running? Let's say needs pause or running is fine but min time req.
                        className={`px-4 py-2 rounded-lg font-medium border flex items-center ${
                          minTimeReached
                            ? "border-success-600 text-success-600 hover:bg-success/15 cursor-pointer"
                            : "border-border200 text-textSecondary cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {isDone && (
                    <div className="w-full py-2 bg-success/2 text-success-500 rounded-lg flex items-center justify-center font-medium">
                      <CheckCircle className="w-5 h-5 mr-2" /> 已完成
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Team Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">小队进度</h2>
          <div className="bg-surface rounded-xl border border-border200 p-4 space-y-6">
            {activeHabit.members?.map((member, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    className="w-10 h-10 rounded-full bg-secondary object-cover"
                    alt={member.name}
                  />
                  {member.status === "completed" && (
                    <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5 border-2 border-surface">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-text">
                      {member.name}
                    </span>
                    <span className="text-textSecondary text-xs">
                      {member.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${member.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ghibli-card bg-info/10 border border-info/300 p-4 rounded-xl">
            <h4 className="text-info font-semibold text-sm mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" /> 小队激励
            </h4>
            <p className="text-info/80 text-xs leading-relaxed">
              "坚持不是追求完美，而是拒绝放弃。" <br /> 继续加油，团队！
            </p>
          </div>

          {/* Pending Join Requests (Only for creator) */}
          {isCreator && pendingRequests.length > 0 && (
            <div className="bg-surface rounded-xl border border-border200 p-4 space-y-4">
              <h2 className="text-lg font-bold text-text">待处理的加入请求</h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.avatar}
                        className="w-10 h-10 rounded-full bg-secondary object-cover"
                        alt={request.name}
                      />
                      <div>
                        <div className="font-medium text-text text-sm">
                          {request.name}
                        </div>
                        <div className="text-textSecondary text-xs">
                          {request.requestTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            await approveJoinRequest(activeHabit.id, request.userId);
                            alert(`已同意 ${request.name} 的加入请求`);
                          } catch (error) {
                            alert(`同意请求失败：${error instanceof Error ? error.message : '未知错误'}`);
                          }
                        }}
                        className="px-3 py-1 bg-success/20 text-success text-xs font-medium rounded-lg hover:bg-success/30 transition-colors"
                      >
                        同意
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await rejectJoinRequest(activeHabit.id, request.userId);
                            alert(`已拒绝 ${request.name} 的加入请求`);
                          } catch (error) {
                            alert(`拒绝请求失败：${error instanceof Error ? error.message : '未知错误'}`);
                          }
                        }}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modification Modal */}
      {isEditTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="ghibli-card bg-surface rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-text mb-2">
              请求调整时间
            </h3>
            <p className="text-textS-condaryt-sm mb-4">
              您每天可以调整一次开始时间。需要所有团队成员批准。
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slxte-700 mb-1">
                新的开始时间
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full border border-border300 rounded-lg p-2.5 focus:ring-2 focus:ripr-marygo-500 outline-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditTimeModalOpen(false)}
                className="flex-1 py-2.5 border border-border300 textxtlate-700 font-medium rounded-lg hoecondarylate-50"
              >
                取消
              </button>
              <button
                onClick={handleTimeChangeRequest}
                disabled={isProcessingChange}
                className="flex-1 py-2.5 bg-prdmary600 text-white font-medium rounded-lg hover:pr-maryHover0 flex items-center justify-center disabled:opacity-70"
              >
                {isProcessingChange ? "请求中..." : "提交请求"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitDetail;