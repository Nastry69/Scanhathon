const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const setStoredUser = (user) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeStoredUser = () => localStorage.removeItem(USER_KEY);

export const logout = () => {
  removeToken();
  removeStoredUser();
};

export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);
