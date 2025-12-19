import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  createCustomTheme: (name: string, colors: ThemeColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 预设主题
export const defaultThemes: Theme[] = [
  {
    id: "default",
    name: "默认主题",
    colors: {
      primary: "#4f46e5",
      primaryHover: "#4338ca",
      secondary: "#e5e7eb",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#1f2937",
      textSecondary: "#6b7280",
      border: "#e5e7eb",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    }
  },
  {
    id: "dark",
    name: "深色主题",
    colors: {
      primary: "#818cf8",
      primaryHover: "#6366f1",
      secondary: "#374151",
      background: "#111827",
      surface: "#1f2937",
      text: "#f9fafb",
      textSecondary: "#9ca3af",
      border: "#374151",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#60a5fa"
    }
  },
  {
    id: "green",
    name: "清新绿色",
    colors: {
      primary: "#10b981",
      primaryHover: "#059669",
      secondary: "#d1fae5",
      background: "#f0fdf4",
      surface: "#ffffff",
      text: "#166534",
      textSecondary: "#065f46",
      border: "#bbf7d0",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    }
  },
  {
    id: "purple",
    name: "优雅紫色",
    colors: {
      primary: "#8b5cf6",
      primaryHover: "#7c3aed",
      secondary: "#ede9fe",
      background: "#faf5ff",
      surface: "#ffffff",
      text: "#5b21b6",
      textSecondary: "#6b7280",
      border: "#e9d5ff",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    }
  }
];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从localStorage加载主题，默认使用默认主题
  const getInitialTheme = (): Theme => {
    const savedThemeId = localStorage.getItem("app-theme");
    const customThemes = JSON.parse(localStorage.getItem("custom-themes") || "[]");
    const allThemes = [...defaultThemes, ...customThemes];
    
    return allThemes.find(theme => theme.id === savedThemeId) || defaultThemes[0];
  };

  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    return JSON.parse(localStorage.getItem("custom-themes") || "[]");
  });

  const themes = [...defaultThemes, ...customThemes];

  // 更新CSS变量
  useEffect(() => {
    const root = document.documentElement;
    
    // 设置CSS变量
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  // 保存主题到localStorage
  const handleSetTheme = (themeId: string) => {
    const newTheme = themes.find(theme => theme.id === themeId);
    if (newTheme) {
      setCurrentTheme(newTheme);
      localStorage.setItem("app-theme", themeId);
    }
  };

  // 创建自定义主题
  const handleCreateCustomTheme = (name: string, colors: ThemeColors) => {
    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      colors
    };
    
    const updatedCustomThemes = [...customThemes, newTheme];
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem("custom-themes", JSON.stringify(updatedCustomThemes));
  };

  const value: ThemeContextType = {
    currentTheme,
    themes,
    setTheme: handleSetTheme,
    createCustomTheme: handleCreateCustomTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
