export type TeamSize = 2 | 3 | 4;

export interface SubTask {
  id: string;
  name: string;
  minDurationMinutes: number; // Minimum time required to complete
}

export interface HabitDefinition {
  id: string;
  title: string;
  description: string;
  categories: string[]; // Changed from single category to categories array
  requiredTeamSize: TeamSize;
  durationDays: number;
  dailyStartTime: string; // HH:MM format (24h)
  dailyTasks: SubTask[];
  authorId: string;
  authorName: string; // Added authorName field
  createdAt: number;
}

export interface TaskLog {
  subTaskId: string;
  elapsedSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
  startTime: number | null; // Timestamp when last started
}

export interface TeamMember {
  userId: string;
  name: string;
  avatar: string;
  progress: number; // 0-100% for today
  status: "idle" | "active" | "completed";
  approvalStatus: number; // 0: 审批中, 1: 通过, -1: 拒绝
}

export interface ActiveHabit {
  id: string;
  habitDefinitionId: string;
  habitSnapshot: HabitDefinition; // Snapshot in case original changes
  startDate: number;
  members: TeamMember[];
  myLogs: Record<string, TaskLog>; // Keyed by subTaskId
  currentDay: number;
  timeModificationRequests: {
    date: string;
    newTime: string;
    approvals: string[]; // userIds
    status: "pending" | "approved" | "rejected";
  }[];
  // Track if user already modified time today
  hasModifiedTimeToday: boolean;
  // Track the status of the user in this habit
  status: "pending" | "active"; // pending = waiting for approval, active = approved and joined
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  gender?: 'male' | 'female' | 'other';
  is_active: boolean;
  deleted_at: Date | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  password: string;
  email?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isJustRegistered: boolean;
}
