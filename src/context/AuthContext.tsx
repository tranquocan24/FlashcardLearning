import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authAPI } from "../api/auth";
import { STORAGE_KEYS } from "../constants/config";
import { User } from "../types";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleUserData: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  }) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log("Loading user from storage...");
      const savedUser = await storage.getItem<User>(STORAGE_KEYS.USER);
      console.log("Saved user:", savedUser);
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);

      if (response.success && response.user) {
        if (response.token) {
          console.log('Saving token to storage...');
          await storage.setItem(STORAGE_KEYS.TOKEN, response.token);
          console.log('Token saved successfully');
        } else {
          console.warn('No token in response!');
        }

        // Now create user data and save
        const userData: User = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          avatar_url: response.user.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await storage.setItem(STORAGE_KEYS.USER, userData);

        // Set user LAST - this triggers navigation
        setUser(userData);
        console.log('Login complete!');
      } else {
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await authAPI.register({ username, email, password });

      if (response.success && response.user) {
        // After registration, auto login
        await login(email, password);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (googleUserData: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  }) => {
    try {
      console.log("Calling Google auth API...");
      console.log("Request data:", {
        googleId: googleUserData.id,
        email: googleUserData.email,
        name: googleUserData.name,
        photo: googleUserData.photo,
      });

      const response = await authAPI.googleLogin({
        googleId: googleUserData.id,
        email: googleUserData.email,
        name: googleUserData.name,
        photo: googleUserData.photo,
      });

      console.log("Google auth response:", JSON.stringify(response, null, 2));

      if (response.success && response.user) {
        // IMPORTANT: Save token FIRST before setting user
        if (response.token) {
          console.log('Saving Google token to storage...');
          await storage.setItem(STORAGE_KEYS.TOKEN, response.token);
          console.log('Token saved successfully');
        } else {
          console.warn('No token in Google response!');
        }

        // Then save user data
        await storage.setItem(STORAGE_KEYS.USER, response.user);

        // Set user LAST - this triggers navigation
        setUser(response.user);
        console.log("Google login successful, user saved");
      } else {
        console.error("Google login failed:", response.message || "Unknown error");
        throw new Error(response.message || "Google login failed");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };


  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      await storage.removeItem(STORAGE_KEYS.USER);
      await storage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storage.setItem(STORAGE_KEYS.USER, updatedUser);
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
