import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Palette } from "lucide-react";

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50 inline-block">
      {/* 主题切换按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-3 rounded-full border border-border bg-surface text-text hover:bg-secondary transition-all shadow-sm hover:shadow-md"
        aria-label="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* 主题选择面板 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text">选择主题</h3>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary ${currentTheme.id === theme.id ? "bg-secondary" : ""}`}
              >
                {/* 主题颜色预览 */}
                <div className="flex gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.success }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.warning }}
                  />
                </div>

                {/* 主题名称 */}
                <span className="text-sm font-medium text-text">{theme.name}</span>

                {/* 选中标记 */}
                {currentTheme.id === theme.id && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;