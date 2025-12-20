import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { TeamSize, SubTask } from "../types";
import { Trash2, Plus, X } from "lucide-react";

const CreateHabit: React.FC = () => {
  const { addHabitToMarketplace } = useHabit();
  const navigate = useNavigate();
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
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        // Use the same request function as other API calls
        const response = await fetch('http://localhost:3001/api/habits/categories', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const categories = await response.json();
          // Extract category names from the response
          setAvailableCategories(categories.map((cat: any) => cat.name));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock categories if API fails
        setAvailableCategories([
          "健康与健身", "学习", "生产力", "创造力", "阅读", "写作", "编程", 
          "冥想", "瑜伽", "跑步", "绘画", "音乐", "摄影", "旅行", "烹饪"
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fuzzy search function
  const getSuggestions = () => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return availableCategories
      .filter(cat => 
        cat.toLowerCase().includes(term) && 
        !selectedCategories.includes(cat)
      )
      .slice(0, 5); // Limit to 5 suggestions
  };
  
  // Handle adding a category
  const handleAddCategory = (category: string) => {
    if (selectedCategories.length < 3 && !selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setSearchTerm("");
    setShowSuggestions(false);
  };
  
  // Handle removing a category
  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
  };
  
  // Handle input blur (with delay to allow clicking suggestions)
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

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
    if (!title || !description || tasks.length === 0 || selectedCategories.length === 0) return;

    const formattedTasks: SubTask[] = tasks.map((t, i) => ({
      ...t,
      id: `task-${Date.now()}-${i}`,
    }));

    addHabitToMarketplace({
      title,
      description,
      categories: selectedCategories, // Send array of categories
      requiredTeamSize: teamSize,
      durationDays: duration,
      dailyStartTime: startTime,
      dailyTasks: formattedTasks,
    });

    navigate("/marketplace");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text mb-6 ghibli-title">设计新挑战</h2>

      <form
        onSubmit={handleSubmit}
        className="ghibli-form p-6 md:p-8"
      >
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="ghibli-form-group">
            <label className="ghibli-form-label">
              挑战名称
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：30天编程挑战"
              className="ghibli-input"
            />
          </div>
          <div className="ghibli-form-group">
            <label className="ghibli-form-label">
              描述
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个小队的目标和精神..."
              rows={3}
              className="ghibli-input"
            />
          </div>
          <div className="ghibli-form-group">
            <label className="ghibli-form-label">
              分类（最多选择3个）
            </label>
            
            {/* Selected categories tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((category) => (
                <div 
                  key={category} 
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm font-medium"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-2 text-white hover:opacity-80 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Search input with suggestions */}
            <div className="relative" ref={searchInputRef}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleBlur}
                placeholder="搜索或输入分类（例如：健康、学习）"
                disabled={selectedCategories.length >= 3}
                className={`ghibli-input ${selectedCategories.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && getSuggestions().length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getSuggestions().map((suggestion) => (
                    <div
                      key={suggestion}
                      className="px-4 py-2 hover:bg-primary/5 cursor-pointer transition-colors text-sm"
                      onClick={() => handleAddCategory(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add custom category */}
            {searchTerm.trim() && !availableCategories.includes(searchTerm) && (
              <button
                type="button"
                onClick={() => handleAddCategory(searchTerm.trim())}
                className="mt-2 text-sm text-primary hover:text-primaryHover flex items-center"
                disabled={selectedCategories.length >= 3}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加 "{searchTerm.trim()}" 作为新分类
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="ghibli-form-group">
              <label className="ghibli-form-label">
                小队人数
              </label>
              <div className="flex bg-secondary p-2 rounded-lg gap-2">
                {[2, 3, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTeamSize(size as TeamSize)}
                    className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-all ${teamSize === size ? "bg-surface shadow text-primary" : "text-textSecondary hover:bg-surface/50"}`}
                  >
                    {size}人
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="ghibli-form-group">
              <label className="ghibli-form-label">
                持续天数
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="ghibli-input"
              />
            </div>
            <div className="ghibli-form-group">
              <label className="ghibli-form-label">
                每日开始时间
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="ghibli-input"
              />
            </div>
          </div>
        </div>

        <div className="ghibli-divider"></div>

        {/* Tasks Definition */}
        <div>
          <label className="ghibli-form-label">
            每日任务清单
          </label>
          <div className="space-y-4 mt-4">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex gap-3 items-start p-4 rounded-lg bg-surface shadow-sm">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="任务名称"
                    value={task.name}
                    onChange={(e) =>
                      handleTaskChange(idx, "name", e.target.value)
                    }
                    className="ghibli-input"
                  />
                </div>
                <div className="w-32">
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
                    className="ghibli-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(idx)}
                  disabled={tasks.length === 1}
                  className="p-3 text-textSecondary hover:text-error disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            className="mt-4 text-sm font-medium text-primary flex items-center hover:text-primaryHover ghibli-transition p-2 rounded-lg hover:bg-primary/5"
          >
            <Plus className="w-4 h-4 mr-1" /> 添加子任务
          </button>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="ghibli-btn w-full py-3"
          >
            发布挑战
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHabit;
