import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  saveAuthData,
  getAuthData,
  clearAuthData,
  UserRole,
  StoredAuthData,
} from '../services/storage';

export interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  userRole: UserRole | null;
  userId: string | null;
  token: string | null;
  userData: any | null;
  login: (data: {
    token?: string;
    role: UserRole;
    userId: string;
    userData?: any;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a random session token if backend doesn't supply one in demo/mock mode
const generateFallbackToken = (role: string, userId: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 12);
  return `ft_${role}_${userId}_${timestamp}_${randomStr}`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authData: StoredAuthData = await getAuthData();

      if (authData.isLoggedIn && authData.token && authData.role && authData.userId) {
        setIsLoggedIn(true);
        setUserRole(authData.role);
        setUserId(authData.userId);
        setToken(authData.token);
        setUserData(authData.userData);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserId(null);
        setToken(null);
        setUserData(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking stored auth:', error);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
      setToken(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (data: {
    token?: string;
    role: UserRole;
    userId: string;
    userData?: any;
  }) => {
    try {
      const activeToken = data.token || generateFallbackToken(data.role, data.userId);
      const cleanUserId = data.userId.trim().toUpperCase();

      await saveAuthData({
        token: activeToken,
        role: data.role,
        userId: cleanUserId,
        userData: data.userData,
      });

      setToken(activeToken);
      setUserRole(data.role);
      setUserId(cleanUserId);
      setUserData(data.userData || null);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('[AuthContext] Login error saving storage:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
    } catch (error) {
      console.error('[AuthContext] Logout error clearing storage:', error);
    } finally {
      setToken(null);
      setUserRole(null);
      setUserId(null);
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        userRole,
        userId,
        token,
        userData,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
