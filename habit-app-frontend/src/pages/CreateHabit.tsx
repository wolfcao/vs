import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { TeamSize, SubTask } from "../types";
import { Trash2, Plus } from "lucide-react";

const CreateHabit: React.FC = () => {
  const { addHabitToMarketplace } = useHabit();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "health" | "learning" | "creativity" | "productivity"
  >("health");
  const [teamSize, setTeamSize] = useState<TeamSize>(2);
  const [duration, setDuration] = useState(21);
  const [startTime, setStartTime] = useState("08:00");

  const [tasks, setTasks] = useState<Omit<SubTask, "id">[]>([
    { name: "Main Activity", minDurationMinutes: 15 },
  ]);

  const handleAddTask = () => {
    setTasks([...tasks, { name: "", minDurationMinutes: 10 }]);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleTaskChange = (
    index: number,
    field: keyof Omit<SubTask, "id">,
    value: any
  ) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic Validation
    if (!title || !description || tasks.length === 0) return;

    const formattedTasks: SubTask[] = tasks.map((t, i) => ({
      ...t,
      id: `task-${Date.now()}-${i}`,
    }));

    addHabitToMarketplace({
      title,
      description,
      category,
      requiredTeamSize: teamSize,
      durationDays: duration,
      dailyStartTime: startTime,
      dailyTasks: formattedTasks,
    });

    navigate("/marketplace");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text mb-6">设计新挑战</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-border"
      >
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              挑战名称
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：30天编程挑战"
              className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              描述
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个小队的目标和精神..."
              rows={3}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                分类
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full border border-border rounded-lg p-2.5 bg-surface outline-none"
              >
                <option value="health">健康与健身</option>
                <option value="learning">学习</option>
                <option value="productivity">生产力</option>
                <option value="creativity">创造力</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                小队人数
              </label>
              <div className="flex bg-secondary p-1 rounded-lg">
                {[2, 3, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTeamSize(size as TeamSize)}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                      teamSize === size
                        ? "bg-surface shadow text-primary"
                        : "text-textSecondary"
                    }`}
                  >
                    {size}人
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                持续天数
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                每日开始时间
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-6"></div>

        {/* Tasks Definition */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            每日任务清单
          </label>
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="任务名称"
                    value={task.name}
                    onChange={(e) =>
                      handleTaskChange(idx, "name", e.target.value)
                    }
                    className="w-full border border-border rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="分钟"
                    min="1"
                    value={task.minDurationMinutes}
                    onChange={(e) =>
                      handleTaskChange(
                        idx,
                        "minDurationMinutes",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(idx)}
                  disabled={tasks.length === 1}
                  className="p-2 text-textSecondary hover:text-error disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            className="mt-3 text-sm font-medium text-primary flex items-center hover:text-primaryHover"
          >
            <Plus className="w-4 h-4 mr-1" /> 添加子任务
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20"
          >
            发布挑战
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHabit;
