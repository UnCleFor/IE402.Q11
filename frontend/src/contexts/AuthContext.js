import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Lắng nghe sự kiện storage để đồng bộ giữa các tab
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    
    // Nếu requiredRoles là string, chuyển thành array
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Kiểm tra xem user có role nào trong requiredRoles không
    return roles.includes(user.role);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};