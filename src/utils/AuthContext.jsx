import React, { createContext, useContext, useState, useEffect } from "react";
import {
  setToken,
  removeToken,
  isAuthenticated,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from "./auth";
import { getMe } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    if (isAuthenticated()) {
      getMe()
        .then((data) => {
          const updated = { ...getStoredUser(), ...data };
          setStoredUser(updated);
          setUser(updated);
        })
        .catch(() => {});
    }
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setLoggedIn(true);
    if (userData) {
      setStoredUser(userData);
      setUser(userData);
    }
    getMe()
      .then((data) => {
        const updated = { ...userData, ...data };
        setStoredUser(updated);
        setUser(updated);
      })
      .catch(() => {});
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
