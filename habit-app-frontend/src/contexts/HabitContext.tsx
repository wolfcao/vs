import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  HabitDefinition,
  ActiveHabit,
  User,
  TeamSize,
  SubTask,
} from "../types";
import {
  getCurrentUser,
  updateCurrentUser,
  habitDefinitionApi,
  activeHabitApi,
} from "../services/api";

interface UpdateUserParams {
  name: string;
  avatar: string;
  file?: File | null;
}

interface HabitContextType {
  user: User;
  marketplaceHabits: HabitDefinition[];
  myActiveHabits: ActiveHabit[];
  isLoading: boolean;
  addHabitToMarketplace: (
    habit: Omit<HabitDefinition, "id" | "authorId" | "createdAt" | "authorName">
  ) => Promise<HabitDefinition>;
  joinHabit: (habitId: string) => Promise<ActiveHabit | undefined>;
  toggleTimer: (activeHabitId: string, subTaskId: string) => Promise<any>;
  completeTask: (activeHabitId: string, subTaskId: string) => Promise<any>;
  requestTimeChange: (
    activeHabitId: string,
    newTime: string
  ) => Promise<boolean>;
  refreshContext: () => Promise<void>;
  updateUser: (params: UpdateUserParams) => Promise<void>;
  approveJoinRequest: (activeHabitId: string, userId: string) => Promise<boolean>;
  rejectJoinRequest: (activeHabitId: string, userId: string) => Promise<boolean>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>({
    id: "",
    name: "加载中...",
    username: "",
    email: "",
    avatar: "",
    is_active: true,
    deleted_at: null,
  });
  const [marketplaceHabits, setMarketplaceHabits] = useState<HabitDefinition[]>(
    []
  );
  const [myActiveHabits, setMyActiveHabits] = useState<ActiveHabit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // 并行加载所有初始数据
        const [currentUser, habits, activeHabits] = await Promise.all([
          getCurrentUser(),
          habitDefinitionApi.getAll(),
          activeHabitApi.getAll(),
        ]);

        setUser(currentUser);
        setMarketplaceHabits(habits);
        setMyActiveHabits(activeHabits);
      } catch (error) {
        // Error handled by state management
        // 加载失败时可以使用本地存储的数据作为后备
        const storedHabits = localStorage.getItem("squad_market_habits");
        if (storedHabits) {
          setMarketplaceHabits(JSON.parse(storedHabits));
        }

        const storedActive = localStorage.getItem("squad_active_habits");
        if (storedActive) {
          setMyActiveHabits(JSON.parse(storedActive));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save changes
  useEffect(() => {
    if (marketplaceHabits.length > 0) {
      localStorage.setItem(
        "squad_market_habits",
        JSON.stringify(marketplaceHabits)
      );
    }
  }, [marketplaceHabits]);

  useEffect(() => {
    localStorage.setItem("squad_active_habits", JSON.stringify(myActiveHabits));
  }, [myActiveHabits]);

  // Timer simulation (run every second to update elapsed time for running tasks)
  useEffect(() => {
    const interval = setInterval(() => {
      setMyActiveHabits((prev) => {
        let anyChanged = false;
        const updatedHabits = prev.map((habit) => {
          let habitChanged = false;
          const newLogs = { ...habit.myLogs };

          // Add null checks to prevent errors
          if (habit.habitSnapshot?.dailyTasks) {
            habit.habitSnapshot.dailyTasks.forEach((task) => {
              const log = newLogs[task.id];
              if (log && log.isRunning) {
                // Simply update elapsed
                newLogs[task.id] = {
                  ...log,
                  elapsedSeconds: log.elapsedSeconds + 1,
                };
                habitChanged = true;
              }
            });
          }

          if (habitChanged) {
            anyChanged = true;
            return { ...habit, myLogs: newLogs };
          }
          return habit;
        });

        // Only return updated habits if something actually changed
        return anyChanged ? updatedHabits : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addHabitToMarketplace = async (
    data: Omit<HabitDefinition, "id" | "authorId" | "createdAt" | "authorName">
  ) => {
    try {
      const newHabit = await habitDefinitionApi.create(data);
      setMarketplaceHabits((prev) => [newHabit, ...prev]);
      return newHabit;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  const joinHabit = async (habitId: string) => {
    try {
      const newActiveHabit = await activeHabitApi.join(habitId);
      setMyActiveHabits((prev) => [newActiveHabit, ...prev]);
      return newActiveHabit;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  const toggleTimer = async (activeHabitId: string, subTaskId: string) => {
    try {
      const updatedLog = await activeHabitApi.toggleTimer(
        activeHabitId,
        subTaskId
      );

      setMyActiveHabits((prev) =>
        prev.map((h) => {
          if (h.id !== activeHabitId) return h;

          return {
            ...h,
            myLogs: {
              ...h.myLogs,
              [subTaskId]: updatedLog,
            },
          };
        })
      );

      return updatedLog;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  const completeTask = async (activeHabitId: string, subTaskId: string) => {
    try {
      const updatedLog = await activeHabitApi.completeTask(
        activeHabitId,
        subTaskId
      );

      setMyActiveHabits((prev) =>
        prev.map((h) => {
          if (h.id !== activeHabitId) return h;

          return {
            ...h,
            myLogs: {
              ...h.myLogs,
              [subTaskId]: updatedLog,
            },
          };
        })
      );

      return updatedLog;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  const requestTimeChange = async (
    activeHabitId: string,
    newTime: string
  ): Promise<boolean> => {
    try {
      const success = await activeHabitApi.requestTimeChange(
        activeHabitId,
        newTime
      );

      if (success) {
        // 更新本地状态
        setMyActiveHabits((prev) =>
          prev.map((h) => {
            if (h.id !== activeHabitId) return h;

            const updatedSnapshot = {
              ...h.habitSnapshot,
              dailyStartTime: newTime,
            };

            return {
              ...h,
              habitSnapshot: updatedSnapshot,
              hasModifiedTimeToday: true,
            };
          })
        );
      }

      return success;
    } catch (error) {
      // Error handled by state management
      return false;
    }
  };

  const refreshContext = async () => {
    try {
      setIsLoading(true);

      // 从API重新加载所有数据
      const [habits, activeHabits] = await Promise.all([
        habitDefinitionApi.getAll(),
        activeHabitApi.getAll(),
      ]);

      setMarketplaceHabits(habits);
      setMyActiveHabits(activeHabits);
    } catch (error) {
      // Error handled by state management
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (params: UpdateUserParams) => {
    try {
      let avatarUrl = params.avatar;

      // 如果有文件上传，处理文件上传逻辑
      if (params.file) {
        // 在实际项目中，这里应该调用文件上传API
        // 由于是模拟环境，我们使用FileReader将文件转换为Base64字符串
        const reader = new FileReader();
        avatarUrl = await new Promise((resolve) => {
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(params.file!);
        });
      }

      // 更新本地用户状态
      setUser((prevUser) => ({
        ...prevUser,
        name: params.name,
        avatar: avatarUrl,
      }));

      // 更新用户信息到后端
      await updateCurrentUser({ name: params.name, avatar: avatarUrl });
      // User info updated successfully
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  // 同意加入请求
  const approveJoinRequest = async (activeHabitId: string, userId: string) => {
    try {
      const success = await activeHabitApi.approveJoinRequest(activeHabitId, userId);
      if (success) {
        // 更新本地状态，将用户添加到成员列表
        setMyActiveHabits((prev) =>
          prev.map((h) => {
            if (h.id !== activeHabitId) return h;
            // 这里可以添加用户到成员列表的逻辑
            return h;
          })
        );
        // 刷新上下文数据
        await refreshContext();
      }
      return success;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  // 拒绝加入请求
  const rejectJoinRequest = async (activeHabitId: string, userId: string) => {
    try {
      const success = await activeHabitApi.rejectJoinRequest(activeHabitId, userId);
      if (success) {
        // 刷新上下文数据
        await refreshContext();
      }
      return success;
    } catch (error) {
      // Error handled by state management
      throw error;
    }
  };

  return (
    <HabitContext.Provider
      value={{
        user,
        marketplaceHabits,
        myActiveHabits,
        isLoading,
        addHabitToMarketplace,
        joinHabit,
        toggleTimer,
        completeTask,
        requestTimeChange,
        refreshContext,
        updateUser,
        approveJoinRequest,
        rejectJoinRequest,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error("useHabit must be used within HabitProvider");
  return context;
};
