import React, { createContext, useContext, useState, useEffect } from 'react';

interface SuperAdmin {
  email: string;
  name: string;
  role: 'super_admin';
  permissions: string[];
}

interface SuperAdminContextType {
  superAdmin: SuperAdmin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

interface SuperAdminProviderProps {
  children: React.ReactNode;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if super admin is already logged in
    const storedAdmin = localStorage.getItem('superAdmin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setSuperAdmin(adminData);
      } catch (error) {
        console.error('Failed to parse stored super admin data:', error);
        localStorage.removeItem('superAdmin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get super admin credentials from environment variables
      const credentials = import.meta.env.VITE_SUPER_ADMIN_CREDENTIALS;
      
      if (!credentials) {
        console.error('Super admin credentials not configured');
        return false;
      }

      // Parse credentials (format: email:password,email:password)
      const adminCredentials = credentials.split(',').map((cred: string) => {
        const [credEmail, credPassword] = cred.split(':');
        return { email: credEmail.trim(), password: credPassword.trim() };
      });

      // Check if provided credentials match any configured admin
      const matchingAdmin = adminCredentials.find(
        (cred: { email: string; password: string }) => 
          cred.email === email && cred.password === password
      );

      if (matchingAdmin) {
        const adminData: SuperAdmin = {
          email: matchingAdmin.email,
          name: matchingAdmin.email.split('@')[0], // Use email prefix as name
          role: 'super_admin',
          permissions: [
            'manage_restaurants',
            'manage_users',
            'view_analytics',
            'manage_subscriptions',
            'manage_platform_settings',
            'manage_blog',
            'manage_support',
            'manage_documentation'
          ]
        };

        setSuperAdmin(adminData);
        localStorage.setItem('superAdmin', JSON.stringify(adminData));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Super admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setSuperAdmin(null);
    localStorage.removeItem('superAdmin');
  };

  const value: SuperAdminContextType = {
    superAdmin,
    login,
    logout,
    isAuthenticated: !!superAdmin,
    loading
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export default SuperAdminContext;
