import React from "react";
import { useNavigate } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { Users, Clock, Calendar } from "lucide-react";

interface MarketplaceProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({
  searchTerm = "",
  onSearchChange,
}) => {
  const { marketplaceHabits, myActiveHabits, joinHabit, user } = useHabit();
  const navigate = useNavigate();

  const getCategoryChinese = (category: string): string => {
    switch (category) {
      case "learning":
        return "学习";
      case "health":
        return "健康";
      case "productivity":
        return "生产力";
      default:
        return "其他";
    }
  };

  // Filter habits based on search term
  const filteredHabits = marketplaceHabits.filter((habit) => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = habit.title.toLowerCase().includes(searchLower);
    const descriptionMatch = habit.description
      .toLowerCase()
      .includes(searchLower);
    const authorMatch = habit.authorId
      ?.toString()
      .toLowerCase()
      .includes(searchLower);
    return titleMatch || descriptionMatch || authorMatch;
  });

  // Check habit status for current user
  const getHabitStatus = (habitId: string) => {
    const activeHabit = myActiveHabits.find(
      (habit) =>
        habit.habitSnapshot?.id === habitId ||
        habit.habitDefinitionId === habitId
    );
    if (!activeHabit) return "available";

    // Check if current user is actually in the members list
    const currentUserMember = activeHabit.members?.find(
      (member) => member.userId === user?.id
    );
    if (!currentUserMember) return "available";

    // Check approval status
    if (currentUserMember.approvalStatus === 1) {
      return activeHabit.status;
    } else if (currentUserMember.approvalStatus === 0) {
      return "pending";
    } else if (currentUserMember.approvalStatus === -1) {
      return "rejected";
    }

    return activeHabit.status;
  };

  // Check if user created this habit
  const isUserCreator = (habit: any) => {
    return habit.authorId === user?.id;
  };

  const handleJoin = async (id: string) => {
    try {
      const result = await joinHabit(id);
      if (result?.id) {
        alert("申请已提交！请等待创建人的同意。");
        navigate(`/detail/${result.id}`);
      } else {
        alert("加入习惯失败，请稍后重试。");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "加入习惯失败";
      alert(`加入习惯失败：${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Marketplace Header */}
      <div className="py-6 px-4 md:px-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">习惯广场</h2>
          <p className="text-base text-textSecondary">
            寻找小队，一起开始你的习惯之旅。
          </p>
        </div>

        {/* Search Results Info - Only show when no results */}
        {searchTerm && filteredHabits.length === 0 && (
          <div className="mt-4 text-center text-textSecondary">
            <p className="text-base">没有找到匹配的习惯</p>
            <button
              onClick={() => onSearchChange && onSearchChange("")}
              className="mt-2 text-base text-primary hover:text-primaryHover font-medium ghibli-btn hover:shadow-md transition-all duration-300"
            >
              清除搜索
            </button>
          </div>
        )}
      </div>

      <div className="px-4 md:px-6">
        {/* Search Results Count */}
        {searchTerm && filteredHabits.length > 0 && (
          <p className="text-base text-textSecondary mb-4">
            找到 {filteredHabits.length} 个相关习惯
          </p>
        )}
      </div>

      <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 pb-20">
        {filteredHabits.map((habit) => {
          const status = getHabitStatus(habit.id);
          const isCreator = isUserCreator(habit);

          // Determine card style based on status
          let cardClass =
            "ghibli-card min-w-[320px] max-w-sm transition-all duration-300 hover:translate-y-[-4px] rounded-xl overflow-hidden";
          if (isCreator) {
            cardClass +=
              " bg-primary/5 border-2 border-primary shadow-md hover:shadow-2xl";
          } else if (status === "active") {
            cardClass +=
              " bg-success/5 border-2 border-success shadow-md hover:shadow-2xl";
          } else if (status === "pending") {
            cardClass +=
              " bg-warning/5 border-2 border-warning shadow-md hover:shadow-2xl";
          } else {
            cardClass +=
              " bg-surface border border-border shadow-md hover:shadow-xl";
          }

          return (
            <div key={habit.id} className={cardClass}>
              <div className="p-6 md:p-7 relative">
                {/* Status Badge and Author Info */}
                <div
                  className={`flex items-center mb-4 ${
                    isCreator || status === "active" || status === "pending"
                      ? "justify-between"
                      : "justify-start"
                  }`}
                >
                  {/* Check if there are any status badges */}
                  {isCreator || status === "active" || status === "pending" ? (
                    <>
                      <div className="flex items-center space-x-2">
                        {isCreator && (
                          <div className="bg-primary text-white text-xs font-bold px-4 py-1 uppercase tracking-wider rounded-full inline-block">
                            我创建的
                          </div>
                        )}
                        {!isCreator && status === "active" && (
                          <div className="bg-success text-white text-xs font-bold px-4 py-1 uppercase tracking-wider rounded-full inline-block">
                            已加入
                          </div>
                        )}
                        {!isCreator && status === "pending" && (
                          <div className="bg-warning text-white text-xs font-bold px-4 py-1 uppercase tracking-wider rounded-full inline-block">
                            申请中
                          </div>
                        )}
                      </div>

                      {/* Author Info - Right aligned when there are status badges */}
                      <div className="flex items-center text-text text-sm font-medium space-x-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{habit.authorName}</span>
                      </div>
                    </>
                  ) : (
                    /* Author Info - Left aligned when no status badges */
                    <div className="flex items-center text-text text-sm font-medium space-x-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{habit.authorName}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    {habit.categories?.map((category) => (
                      <span
                        key={category}
                        className="ghibli-tag text-sm bg-primary text-white"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center text-textSecondary text-sm font-medium px-3 py-1 rounded-full border border-border">
                      <Clock className="w-4 h-4 mr-1 text-primary" />
                      每日 {habit.dailyStartTime}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-text mb-3">
                  {habit.title}
                </h3>
                <p className="text-textSecondary text-base mb-6 leading-relaxed">
                  {habit.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-base text-text px-4 py-2 rounded-lg border border-border">
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">
                      需要{habit.requiredTeamSize}人团队
                    </span>
                  </div>
                  <div className="flex items-center text-base text-text px-4 py-2 rounded-lg border border-border">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">
                      {habit.durationDays}天挑战
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-start gap-3 mb-6 p-4 rounded-lg border border-border h-[130px] overflow-hidden">
                  <p className="text-sm font-bold text-text flex items-center">
                    <span className="mr-2">📋</span>
                    每日任务
                  </p>
                  <div className="flex flex-col justify-start gap-2 min-h-0">
                    {habit.dailyTasks?.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center text-base text-text"
                      >
                        <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                        {task.name}{" "}
                        <span className="text-textSecondary ml-1">
                          ({task.minDurationMinutes}分钟)
                        </span>
                      </div>
                    ))}
                    {habit.dailyTasks && habit.dailyTasks.length > 2 && (
                      <div className="flex items-center text-base text-textSecondary italic">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                        还有更多任务...
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {isCreator ? (
                  <button
                    onClick={() => {
                      // Find the active habit and navigate to detail
                      const activeHabit = myActiveHabits.find(
                        (h) => h.habitSnapshot?.id === habit.id
                      );
                      if (activeHabit) {
                        navigate(`/detail/${activeHabit.id}`);
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="w-full py-4 bg-primary hover:bg-primaryHover text-white text-lg font-bold rounded-full transition-all ghibli-btn hover:shadow-2xl hover:translate-y-[-2px] active:scale-95"
                  >
                    👑 查看我的小队
                  </button>
                ) : status === "active" ? (
                  <button
                    onClick={() => {
                      // Find the active habit and navigate to detail
                      const activeHabit = myActiveHabits.find(
                        (h) => h.habitSnapshot?.id === habit.id
                      );
                      if (activeHabit) {
                        navigate(`/detail/${activeHabit.id}`);
                      }
                    }}
                    className="w-full py-4 bg-success hover:bg-success/90 text-white text-lg font-bold rounded-full transition-all ghibli-btn hover:shadow-2xl hover:translate-y-[-2px] active:scale-95"
                  >
                    ✅ 已加入，查看详情
                  </button>
                ) : status === "pending" ? (
                  <button
                    onClick={() => {
                      // Find the active habit and navigate to detail
                      const activeHabit = myActiveHabits.find(
                        (h) => h.habitSnapshot?.id === habit.id
                      );
                      if (activeHabit) {
                        navigate(`/detail/${activeHabit.id}`);
                      }
                    }}
                    className="w-full py-4 bg-warning hover:bg-warning/90 text-white text-lg font-bold rounded-full transition-all ghibli-btn hover:shadow-2xl hover:translate-y-[-2px] active:scale-95"
                  >
                    ⏳ 申请中，查看状态
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(habit.id)}
                    className="w-full py-4 bg-primary hover:bg-primaryHover text-white text-lg font-bold rounded-full transition-all ghibli-btn hover:shadow-2xl hover:translate-y-[-2px] active:scale-95"
                  >
                    🚀 加入小队并开始
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
