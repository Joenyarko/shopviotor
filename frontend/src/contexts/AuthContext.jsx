import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('viotor_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('viotor_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await authService.me();
          const userData = response.user;
          setUser(userData);
          localStorage.setItem('viotor_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to load user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for session expiry from API interceptor
    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      
      // If backend returns requires_2fa, we just pass the response back to Login.jsx
      if (response.requires_2fa) {
        return response;
      }
      
      // Fallback for normal login (if 2FA is ever disabled)
      const { user: loggedInUser, token: authToken } = response;
      localStorage.setItem('viotor_token', authToken);
      localStorage.setItem('viotor_user', JSON.stringify(loggedInUser));
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const verify2Fa = async (data) => {
    setLoading(true);
    try {
      const response = await authService.verify2Fa(data);
      const { user: loggedInUser, token: authToken } = response;
      
      localStorage.setItem('viotor_token', authToken);
      localStorage.setItem('viotor_user', JSON.stringify(loggedInUser));
      
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      if (response.requires_verification) {
        return response; // Return response so UI can switch to OTP step
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistration = async (data) => {
    setLoading(true);
    try {
      const response = await authService.verifyRegistration(data);
      const { user: registeredUser, token: authToken } = response;

      localStorage.setItem('viotor_token', authToken);
      localStorage.setItem('viotor_user', JSON.stringify(registeredUser));

      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      localStorage.removeItem('viotor_token');
      localStorage.removeItem('viotor_user');
      setToken(null);
      setUser(null);
    }
  };

  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'super_admin');
  };

  const isVendor = () => {
    return user && (user.role === 'vendor' || user.role === 'admin' || user.role === 'super_admin');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('viotor_user', JSON.stringify(userData));
  };

  const loginWithToken = async (newToken) => {
    setLoading(true);
    localStorage.setItem('viotor_token', newToken);
    setToken(newToken);
    try {
      const response = await authService.me();
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('viotor_user', JSON.stringify(userData));
      return userData;
    } catch (e) {
      console.error('Failed to load user profile with token:', e);
      logout();
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      verify2Fa,
      register, 
      verifyRegistration,
      logout, 
      isAdmin,
      isVendor,
      updateUser,
      loginWithToken,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
