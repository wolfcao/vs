import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import CreateHabit from "./pages/CreateHabit";
import HabitDetail from "./pages/HabitDetail";
import Profile from "./pages/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterSuccess from "./components/RegisterSuccess";
import { useAuth } from "./contexts/AuthContext";
import { HabitProvider } from "./contexts/HabitContext";

// Private Route component for authenticated users
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading, isJustRegistered } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component for non-authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isJustRegistered } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/marketplace" replace />;
  }

  return <>{children}</>;
};

// Main App content with routes
const AppContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isJustRegistered, clearRegisterFlag } = useAuth();
  const location = useLocation();

  // Clear register flag when navigating away from register-success page
  useEffect(() => {
    if (location.pathname !== "/register-success") {
      clearRegisterFlag();
    }
    // Note: clearRegisterFlag is intentionally omitted from dependencies
    // as it doesn't need to trigger effect re-runs and would cause infinite loops
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/register-success"
        element={
          <PublicRoute>
            <RegisterSuccess />
          </PublicRoute>
        }
      />

      {/* Private Routes with Layout and HabitContext */}
      <Route
        path="/marketplace"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Layout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Marketplace
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </Layout>
            </HabitProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Layout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Dashboard />
              </Layout>
            </HabitProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/create"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Layout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <CreateHabit />
              </Layout>
            </HabitProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/detail/:habitId"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Layout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <HabitDetail />
              </Layout>
            </HabitProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Layout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Profile />
              </Layout>
            </HabitProvider>
          </PrivateRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
