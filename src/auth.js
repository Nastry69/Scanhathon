// src/auth.js

// Récupérer le token (stocké par le back après login)
export const getToken = () => {
  return localStorage.getItem("authToken");
};

// Savoir si l'utilisateur est "connecté"
export const isAuthenticated = () => {
  return !!getToken();
};

// Sauvegarder le token après un login réussi
// → l'autre développeur branchera ça après l'appel à l'API
export const login = (token) => {
  localStorage.setItem("authToken", token);
};

// Déconnexion → on supprime le token
export const logout = () => {
  localStorage.removeItem("authToken");
};