import React,
  { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuthState,
} from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
} from "../services/api";

// Action types
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: AuthResponse }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: AuthResponse }
  | { type: "REGISTER_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "CLEAR_REGISTER_FLAG" }; // New action to clear isJustRegistered flag

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,
  isJustRegistered: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        isJustRegistered: false,
      };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        isJustRegistered: true, // Set flag to true after successful registration
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isJustRegistered: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        error: null,
        isJustRegistered: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_TOKEN":
      return {
        ...state,
        token: action.payload,
      };
    case "CLEAR_REGISTER_FLAG":
      return {
        ...state,
        isJustRegistered: false,
      };
    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearRegisterFlag: () => void; // New function to clear the register flag
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token on initial load, but not if just registered
  useEffect(() => {
    const loadUser = async () => {
      if (state.token && !state.isJustRegistered) {
        // Set loading state to true before API call
        dispatch({ type: "LOGIN_START" });
        try {
          const user = await getCurrentUser();
          dispatch({ type: "SET_USER", payload: user });
          // Clear loading state (LOGIN_SUCCESS would set isLoading to false)
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token: state.token } });
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          dispatch({ type: "SET_TOKEN", payload: null });
          dispatch({ type: "SET_USER", payload: null });
          // Clear loading state
          dispatch({ type: "LOGIN_FAILURE", payload: "Token expired" });
        }
      }
    };

    loadUser();
  }, [state.token, state.isJustRegistered]);

  // Update localStorage when token changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }
  }, [state.token]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await apiLogin(credentials);
      // Save token to localStorage immediately to avoid race conditions
      localStorage.setItem("token", response.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: response });
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: "REGISTER_START" });
    try {
      const response = await apiRegister(credentials);
      // Save token to localStorage immediately to avoid race conditions
      localStorage.setItem("token", response.token);
      dispatch({ type: "REGISTER_SUCCESS", payload: response });
    } catch (error) {
      dispatch({
        type: "REGISTER_FAILURE",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Clear register flag function
  const clearRegisterFlag = () => {
    dispatch({ type: "CLEAR_REGISTER_FLAG" });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    clearRegisterFlag,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
