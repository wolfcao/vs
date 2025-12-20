import { HabitDefinition, ActiveHabit, User, TaskLog, LoginCredentials, RegisterCredentials, AuthResponse } from "../types";

// API基础URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// 获取认证令牌
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// 通用请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;

    // 获取认证令牌
    const token = getAuthToken();

    const response = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API请求失败: ${response.statusText} (${response.status})`
      );
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    throw error;
  }
}

// 认证相关API
export const login = (credentials: LoginCredentials) =>
  request<AuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const register = (credentials: RegisterCredentials) =>
  request<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

// 用户相关API
export const getCurrentUser = () => request<User>('/users/current');

export const updateCurrentUser = (userData: { name: string; avatar: string }) =>
  request<User>('/users/current', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });

// 习惯定义相关API
export const habitDefinitionApi = {
  // 获取所有习惯定义（市场）
  getAll: async () => {
    const response = await request<{ habits: HabitDefinition[], currentUserId: string | null }>('/habits');
    return response.habits;
  },

  // 创建新习惯定义
  create: (habitData: Omit<HabitDefinition, 'id' | 'authorId' | 'createdAt' | 'authorName'>) =>
    request<HabitDefinition>('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    }),

  // 获取单个习惯定义详情
  getById: (id: string) => request<HabitDefinition>(`/habits/${id}`),
};

// 活跃习惯相关API
export const activeHabitApi = {
  // 获取当前用户的所有活跃习惯
  getAll: () => request<ActiveHabit[]>('/active-habits'),

  // 加入一个习惯（创建活跃习惯）
  join: (habitDefinitionId: string) =>
    request<ActiveHabit>(`/active-habits/join/${habitDefinitionId}`, {
      method: 'POST',
    }),

  // 获取单个活跃习惯详情
  getById: (id: string) => request<ActiveHabit>(`/active-habits/${id}`),

  // 切换计时器状态
  toggleTimer: (activeHabitId: string, subTaskId: string) =>
    request<TaskLog>(`/active-habits/${activeHabitId}/timer/${subTaskId}`, {
      method: 'POST',
    }),

  // 完成任务
  completeTask: (activeHabitId: string, subTaskId: string) =>
    request<TaskLog>(`/active-habits/${activeHabitId}/complete/${subTaskId}`, {
      method: 'POST',
    }),

  // 请求时间变更
  requestTimeChange: (activeHabitId: string, newTime: string) =>
    request<boolean>(`/active-habits/${activeHabitId}/time-change`, {
      method: 'POST',
      body: JSON.stringify({ newTime }),
    }),

  // 同意加入请求
  approveJoinRequest: (activeHabitId: string, userId: string) =>
    request<boolean>(`/active-habits/${activeHabitId}/approve/${userId}`, {
      method: 'POST',
    }),

  // 拒绝加入请求
  rejectJoinRequest: (activeHabitId: string, userId: string) =>
    request<boolean>(`/active-habits/${activeHabitId}/reject/${userId}`, {
      method: 'POST',
    }),
};
