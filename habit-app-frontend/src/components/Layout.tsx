import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHabit } from "../contexts/HabitContext";
import { Home, PlusSquare, ListChecks, UserCircle, Search } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import Logo from "./Logo";

interface LayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  searchTerm = "",
  onSearchChange = () => {},
}) => {
  const { user } = useHabit();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current path for highlighting active navigation item
  const getCurrentPath = () => {
    const path = location.pathname.replace("/", "");
    return path || "marketplace";
  };
  
  const currentPath = getCurrentPath();

  const navItems = [
    { id: "marketplace", label: "发现", icon: Home },
    { id: "dashboard", label: "我的小队", icon: ListChecks },
    { id: "create", label: "创建", icon: PlusSquare },
    { id: "profile", label: "我", icon: UserCircle },
  ];

  // 添加个人中心按钮点击事件
  const handleAvatarClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background ghibli-cloud-bg flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface ghibli-border rounded-tr-3xl rounded-br-3xl h-screen sticky top-0 mt-4 mb-4 ml-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/10 rounded-tr-3xl">
          <div className="flex items-center gap-2">
            <Logo size="large" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              习惯小队
            </h1>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-md ${
                currentPath === item.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-text hover:bg-secondary/80"
              }`}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent rounded-br-3xl">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar}
              alt="User"
              className="w-10 h-10 rounded-full ghibli-border bg-secondary cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={handleAvatarClick}
            />
            <div className="text-base">
              <p className="font-medium text-text">{user.name}</p>
              <p className="text-sm text-textSecondary">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header - Only shown on Marketplace page */}
      {currentPath === "marketplace" && (
        <div className="sticky top-0 z-40 bg-surface ghibli-border rounded-bl-3xl rounded-br-3xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
            {/* Search Bar - Only shown on marketplace page */}
            <div className="relative flex-grow mb-3 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <input
                type="text"
                placeholder="搜索习惯名称、创建人或描述..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3 md:py-3.5 rounded-full ghibli-border bg-secondary/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-textSecondary text-text text-sm md:text-base hover:shadow-md border-primary/20"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-primary hover:text-primaryHover transition-colors"
                >
                  <span className="text-lg md:text-xl font-bold">×</span>
                </button>
              )}
            </div>
            
            {/* Action Buttons - Only shown when in marketplace on desktop */}
            <div className="hidden md:flex items-center justify-center gap-2 md:gap-3">
              {/* Theme Switcher - Only shown on desktop */}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Now scrollable without containing the sticky header */}
      <main className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface ghibli-border rounded-t-3xl z-50 pb-safe shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${item.id === "create" ? "bg-primary hover:bg-primaryHover text-white rounded-full mx-1 my-2 px-3 py-2 shadow-lg" : `hover:bg-primary/5 ${currentPath === item.id ? "text-primary" : "text-textSecondary"}`}`}
            >
              <item.icon className={`w-7 h-7 transition-transform duration-300 ${currentPath === item.id || item.id === "create" ? "scale-110" : ""}`} />
              <span className="text-xs md:text-sm font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;