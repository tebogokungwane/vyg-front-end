// import { createContext } from "react";
// const UserContext = createContext(null);
// export default UserContext;


// import { createContext, useContext } from 'react';

// const UserContext = createContext(null);

// // Create custom hook
// export const useAuth = () => {
//   return useContext(UserContext);
// };

// export default UserContext;

import axios from 'axios';

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(UserContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    setUser,
    setToken,
    isAuthenticated: !!token,
    login,
    logout,
    auth: {  // This provides the structure ActivityLog expects
      user,
      token,
      isAuthenticated: !!token
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;