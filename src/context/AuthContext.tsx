'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type UserProfile,
} from '../lib/auth-client';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginAsDemoStudent: () => UserProfile;
  register: (email: string, pass: string, name: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const current = await getCurrentUser();
      if (current) {
        setUser(current);
        return;
      }
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('studentsprep_demo_student');
        if (saved) {
          setUser(JSON.parse(saved));
          return;
        }
      }
      setUser(null);
    } catch {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('studentsprep_demo_student');
          if (saved) {
            setUser(JSON.parse(saved));
            return;
          }
        } catch {}
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const notifyAuthSync = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('studentsprep_auth_sync', Date.now().toString());
      } catch {}
    }
  };

  useEffect(() => {
    refresh();

    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'studentsprep_auth_sync') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedIn = await loginUser(email, pass);
    setUser(loggedIn);
    notifyAuthSync();
    return loggedIn;
  };

  const loginAsDemoStudent = () => {
    const demoStudent: UserProfile = {
      id: 'usr_student_demo_01',
      email: 'student@example.com',
      name: 'Alex Chen (Demo Student)',
      role: 'STUDENT',
      targetRoleId: 'role-backend-l4',
      targetRole: { id: 'role-backend-l4', name: 'Backend Systems Engineer (L4)', slug: 'backend-l4' },
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('studentsprep_demo_student', JSON.stringify(demoStudent));
      } catch {}
    }
    setUser(demoStudent);
    notifyAuthSync();
    return demoStudent;
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const created = await registerUser(email, pass, name);
      setUser(created);
      notifyAuthSync();
      return created;
    } catch (err) {
      // If backend API is offline or unreachable in demo mode, create local registered student session!
      if (typeof window !== 'undefined') {
        const localUser: UserProfile = {
          id: `usr_${Date.now()}`,
          email,
          name: name || email.split('@')[0],
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('studentsprep_demo_student', JSON.stringify(localUser));
        } catch {}
        setUser(localUser);
        notifyAuthSync();
        return localUser;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('studentsprep_demo_student');
      } catch {}
    }
    setUser(null);
    notifyAuthSync();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, loginAsDemoStudent, register, logout, refresh }}
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
