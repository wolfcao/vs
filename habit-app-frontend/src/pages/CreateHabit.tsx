import React, { useState, useEffect, useRef } from "react";
import { useHabit } from "../contexts/HabitContext";
import { TeamSize, SubTask } from "../types";
import {
  Trash2,
  Plus,
  X,
  Edit2 as EditIcon,
  Info,
  Calendar,
  Users,
  Clock,
  Target,
  Layout as LayoutIcon,
  ClipboardList,
  Sparkles,
} from "lucide-react";

interface CreateHabitProps {
  onNavigate: (path: string) => void;
}

const CreateHabit: React.FC<CreateHabitProps> = ({ onNavigate }) => {
  const { addHabitToMarketplace } = useHabit();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState<TeamSize>(2);
  const [duration, setDuration] = useState(21);
  const [startTime, setStartTime] = useState("08:00");

  // Custom category state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tasks state
  const [tasks, setTasks] = useState<Omit<SubTask, "id">[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [newTask, setNewTask] = useState<{
    name: string;
    minDurationMinutes: number;
  }>({
    name: "",
    minDurationMinutes: 10,
  });

  // Mock categories if API fails
  const mockCategories = [
    "健康与健身",
    "学习",
    "生产力",
    "创造力",
    "阅读",
    "写作",
    "编程",
    "冥想",
    "瑜伽",
    "跑步",
  ];

  useEffect(() => {
    // 模拟获取分类，实际可替换为 API 调用
    setAvailableCategories(mockCategories);
  }, []);

  const handleAddCategory = (category: string) => {
    if (
      selectedCategories.length < 3 &&
      !selectedCategories.includes(category)
    ) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
  };

  // 子任务处理逻辑
  const handleOpenAddModal = () => {
    setEditingTaskIndex(null);
    setNewTask({ name: "", minDurationMinutes: 10 }); // 初始化：名称为空，时间为10
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    const task = tasks[index];
    setEditingTaskIndex(index);
    setNewTask({
      name: task.name,
      minDurationMinutes: task.minDurationMinutes,
    }); // 填入本条数据
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTask.name.trim() || newTask.minDurationMinutes <= 0) return;
    if (editingTaskIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingTaskIndex] = { ...newTask };
      setTasks(updatedTasks);
    } else {
      setTasks([...tasks, { ...newTask }]);
    }
    setIsModalOpen(false);
    setEditingTaskIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title ||
      !description ||
      tasks.length === 0 ||
      selectedCategories.length === 0
    )
      return;

    const formattedTasks: SubTask[] = tasks.map((t, i) => ({
      ...t,
      id: `task-${Date.now()}-${i}`,
    }));

    addHabitToMarketplace({
      title,
      description,
      category: "productivity", // 后端结构限制，此处映射或保持默认
      requiredTeamSize: teamSize,
      durationDays: duration,
      dailyStartTime: startTime,
      dailyTasks: formattedTasks,
    } as any);

    onNavigate("marketplace");
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-2">
          <Sparkles className="w-4 h-4" /> 创意实验室
        </div>
        <h1 className="text-4xl font-black text-text ghibli-title">
          发起一个新挑战
        </h1>
        <p className="text-textSecondary mt-2">
          设计一个让大家爱不释手的习惯养成计划
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* 左侧：内容卡片 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface p-8 ghibli-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-text">挑战名片</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-textSecondary mb-2 uppercase tracking-wider">
                  挑战名称 <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="给挑战起个响亮的名字，如：清晨观鸟社"
                  className="w-full px-5 py-4 rounded-2xl ghibli-border bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-textSecondary mb-2 uppercase tracking-wider">
                  精神语录 / 挑战简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="告诉大家为什么要参加这个挑战..."
                  className="w-full px-5 py-4 rounded-2xl ghibli-border bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-textSecondary mb-3 uppercase tracking-wider">
                  分类标签 (最多3个) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm"
                    >
                      {cat}
                      <X
                        className="w-3 h-3 cursor-pointer hover:scale-125"
                        onClick={() => handleRemoveCategory(cat)}
                      />
                    </span>
                  ))}
                  {selectedCategories.length === 0 && (
                    <span className="text-xs text-textSecondary/50 italic py-2">
                      还未选择任何分类...
                    </span>
                  )}
                </div>
                <div className="relative" ref={searchInputRef}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="输入分类进行筛选..."
                    className="w-full px-5 py-3 rounded-xl border-2 border-dashed border-border focus:border-primary focus:outline-none bg-transparent"
                    disabled={selectedCategories.length >= 3}
                  />
                  {showSuggestions && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface ghibli-border z-20 shadow-2xl overflow-hidden">
                      {availableCategories
                        .filter((c) => c.includes(searchTerm))
                        .map((c) => (
                          <div
                            key={c}
                            onClick={() => handleAddCategory(c)}
                            className="px-4 py-3 hover:bg-primary/10 cursor-pointer font-medium text-text transition-colors"
                          >
                            {c}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl border-2 border-dashed border-primary/20 flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl text-primary shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-primary">小贴士</h4>
              <p className="text-sm text-textSecondary mt-1">
                有趣且具体的标题（如“手冲咖啡研习会”）比模糊的名字（如“早起计划”）更能吸引队员加入哦！
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：配置卡片 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface p-8 ghibli-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-text">挑战规则</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-textSecondary mb-2 block uppercase">
                  小队规模
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size as TeamSize)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                        teamSize === size
                          ? "bg-primary text-white border-primary shadow-lg"
                          : "bg-background text-textSecondary border-border hover:border-primary/50"
                      }`}
                    >
                      {size} 人队
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-textSecondary mb-2 block uppercase">
                  挑战时长 (天)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background ghibli-border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-textSecondary mb-2 block uppercase">
                  集合时间
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background ghibli-border focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-8 ghibli-border shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-text">每日任务</h2>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="p-2 bg-primary text-white rounded-full hover:scale-110 transition-transform shadow-md"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center px-4 bg-background/50 rounded-3xl border-2 border-dashed border-border/50">
                  <LayoutIcon className="w-12 h-12 text-border mb-3" />
                  <p className="text-textSecondary font-medium">
                    还没有添加任务
                  </p>
                  <p className="text-xs text-textSecondary/60 mt-1">
                    点击右上方按钮添加每日必修课
                  </p>
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center justify-between p-4 bg-background rounded-2xl ghibli-border border-2 hover:border-primary/50 transition-all hover:translate-x-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-lg text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-text text-sm">
                          {task.name}
                        </h4>
                        <span className="text-xs text-textSecondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />{" "}
                          {task.minDurationMinutes} 分钟
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(idx)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTasks(tasks.filter((_, i) => i !== idx))
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title || tasks.length === 0}
            className="w-full py-5 bg-primary hover:bg-primaryHover text-white text-xl font-black rounded-full shadow-[0_6px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ghibli-btn"
          >
            发布挑战 🚀
          </button>
        </div>
      </form>

      {/* 任务弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-surface w-full max-w-sm rounded-[2.5rem] ghibli-border p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-text mb-6 flex items-center gap-2">
              <Sparkles className="text-primary w-6 h-6" />
              {editingTaskIndex !== null ? "修改任务" : "添加新任务"}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-textSecondary uppercase tracking-widest mb-2 block">
                  任务名称
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="如：深呼吸、背单词..."
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl ghibli-border bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-textSecondary uppercase tracking-widest mb-2 block">
                  持续时间 (分钟)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="120"
                    step="5"
                    value={newTask.minDurationMinutes}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        minDurationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 text-center font-black text-primary text-xl">
                    {newTask.minDurationMinutes}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-textSecondary hover:bg-secondary rounded-2xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveTask}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all ghibli-btn"
                >
                  {editingTaskIndex !== null ? "确认修改" : "确认添加"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateHabit;
