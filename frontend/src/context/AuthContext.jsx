import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authAPI.getMe()
          .then((res) => {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData, profile } = res.data.data;
    const mergedUser = { ...userData, ...profile };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
    return mergedUser;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData, profile } = res.data.data;
    const mergedUser = { ...userData, ...profile };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
    return mergedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isParticipant: user?.role === 'participant',
    isOrganizer: user?.role === 'organizer',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
