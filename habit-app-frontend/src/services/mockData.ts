import { HabitDefinition, User } from "../types";

export const CURRENT_USER: User = {
  id: "u1",
  name: "陈亚历克斯",
  username: "alexchen",
  email: "alex@example.com",
  avatar: "https://picsum.photos/seed/alex/100/100",
  is_active: true,
  deleted_at: null,
};

export const MOCK_HABITS: HabitDefinition[] = [
  {
    id: "h1",
    title: "晨间阅读俱乐部",
    description: "每天早上阅读30分钟。加入我们一起养成阅读习惯！",
    categories: ["学习"],
    requiredTeamSize: 3,
    durationDays: 21,
    dailyStartTime: "07:00",
    authorId: "u2",
    authorName: "张三",
    createdAt: Date.now(),
    dailyTasks: [
      { id: "t1", name: "阅读书籍", minDurationMinutes: 30 },
      { id: "t2", name: "撰写摘要", minDurationMinutes: 5 },
    ],
  },
  {
    id: "h2",
    title: "核心力量挑战",
    description: "每日平板支撑和仰卧起坐。我们从小开始，逐渐变强。",
    categories: ["健康与健身"],
    requiredTeamSize: 2,
    durationDays: 30,
    dailyStartTime: "18:00",
    authorId: "u3",
    authorName: "李四",
    createdAt: Date.now(),
    dailyTasks: [
      { id: "t3", name: "平板支撑", minDurationMinutes: 2 },
      { id: "t4", name: "仰卧起坐", minDurationMinutes: 10 },
    ],
  },
  {
    id: "h3",
    title: "深度工作冲刺",
    description: "专注编码或工作会话。无干扰！",
    categories: ["生产力", "学习"],
    requiredTeamSize: 4,
    durationDays: 14,
    dailyStartTime: "10:00",
    authorId: "u4",
    authorName: "王五",
    createdAt: Date.now(),
    dailyTasks: [
      { id: "t5", name: "清理桌面", minDurationMinutes: 1 },
      { id: "t6", name: "深度工作会话", minDurationMinutes: 45 },
    ],
  },
];
