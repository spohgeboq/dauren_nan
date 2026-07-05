import { createContext, useContext, useState, useEffect } from 'react';

interface CurrentUser {
  id: number;
  email: string;
  name: string | null;
  role?: string;
  roles?: string[];
  permissions?: string[];
  has_pin_code?: boolean;
}

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  updateUserPinStatus: (hasPin: boolean) => void;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedToken = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');

    if (cachedToken && cachedUser) {
      setToken(cachedToken);
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: CurrentUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserPinStatus = (hasPin: boolean) => {
    if (user) {
      const updatedUser = { ...user, has_pin_code: hasPin };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const hasRole = (requiredRoles: string[]) => {
    if (!requiredRoles.length) return true;
    const userRoles = user?.roles || (user?.role ? [user.role] : []);
    return requiredRoles.some((r) => userRoles.includes(r));
  };

  const hasPermission = (requiredPermissions: string[]) => {
    if (!requiredPermissions.length) return true;
    const userPerms = user?.permissions || [];
    return requiredPermissions.some((p) => userPerms.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUserPinStatus,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
