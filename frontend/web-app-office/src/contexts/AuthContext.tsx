import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateHarbour: (newHarbour: string) => void;
  switchRoleDemo: (role: UserRole, harbour?: string) => void;
}

const DEFAULT_OFFICER: User = {
  id: 1,
  username: 'officer_rameswaram',
  name: 'K. Rajasekaran',
  role: 'OFFICER',
  assignedHarbour: 'Rameswaram',
  phoneNumber: '9443198765',
  officerId: 'TN-FO-RMS-042',
  token: 'mock-jwt-token-officer-rameswaram',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tn_fisher_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_OFFICER;
      }
    }
    return DEFAULT_OFFICER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tn_fisher_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tn_fisher_auth_user');
    }
  }, [user]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateHarbour = (newHarbour: string) => {
    if (user && user.role === 'OFFICER') {
      setUser({ ...user, assignedHarbour: newHarbour });
    }
  };

  const switchRoleDemo = (role: UserRole, harbour?: string) => {
    if (role === 'OFFICER') {
      setUser({
        id: 1,
        username: `officer_${(harbour || 'rameswaram').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: 'K. Rajasekaran',
        role: 'OFFICER',
        assignedHarbour: harbour || 'Rameswaram',
        phoneNumber: '9443198765',
        officerId: 'TN-FO-RMS-042',
        token: 'mock-jwt-token-officer',
      });
    } else {
      setUser({
        id: 99,
        username: 'senior_dir_fisheries',
        name: 'V. Prabhakaran',
        role: 'MAIN_OFFICER',
        assignedHarbour: undefined,
        phoneNumber: '9840998877',
        officerId: 'TN-HQ-DIR-001',
        token: 'mock-jwt-token-main-officer',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateHarbour,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
