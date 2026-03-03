import React, { createContext, useContext, useState } from "react";
import { setToken, removeToken, isAuthenticated } from "./auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const login = (token) => {
    setToken(token);
    setLoggedIn(true);
  };

  const logout = () => {
    removeToken();
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
