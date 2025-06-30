import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '../lib/config';
import type { User } from '../lib/sdk';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, profile?: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      const session = sdk.getSession(storedToken);
      if (session) {
        setUser(session.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await sdk.login(email, password);
      
      if (typeof result === 'string') {
        // Direct login success
        const session = sdk.getSession(result);
        if (session) {
          setUser(session.user);
          setToken(result);
          localStorage.setItem('auth_token', result);
          toast.success('Login successful!');
          return true;
        }
      } else if (result.otpRequired) {
        // OTP required
        toast.success('OTP sent to your email. Please check your inbox.');
        return false; // Will need OTP verification
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, profile: Partial<User> = {}): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Set default role based on context or provided profile
      const defaultProfile = {
        ...profile,
        roles: profile.roles || ['restaurant_owner'],
        verified: true, // Skip email verification for demo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await sdk.register(email, password, defaultProfile);
      
      // Auto-login after registration
      const loginResult = await sdk.login(email, password);
      if (typeof loginResult === 'string') {
        const session = sdk.getSession(loginResult);
        if (session) {
          setUser(session.user);
          setToken(loginResult);
          localStorage.setItem('auth_token', loginResult);
          toast.success('Registration successful! Welcome to RestaurantOS!');
          return true;
        }
      }
      
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      sdk.destroySession(token);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    toast.success('Logged out successfully');
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const hasPermission = (permission: string): boolean => {
    return sdk.hasPermission(user, permission);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};