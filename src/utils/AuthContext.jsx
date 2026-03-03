import React, { createContext, useContext, useState } from "react";
import {
  setToken,
  removeToken,
  isAuthenticated,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from "./auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getStoredUser());

  const login = (token, userData) => {
    setToken(token);
    setLoggedIn(true);
    if (userData) {
      setStoredUser(userData);
      setUser(userData);
    }
  };

  const logout = () => {
    removeToken();
    removeStoredUser();
    setLoggedIn(false);
    setUser(null);
  };

  const updateUser = (userData) => {
    setStoredUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
