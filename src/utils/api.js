import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const SERVER_BASE = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

const post = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Erreur serveur");
  }

  return data;
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const loginUser = ({ email, password }) =>
  post("/users/login", { email, password });

export const registerUser = ({ username, email, password }) =>
  post("/users/register", { username, email, password });

export const getMe = async () => {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? data.error ?? "Erreur serveur");
  return data;
};

export const updateProfile = async (body) => {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? data.error ?? "Erreur serveur");
  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await fetch(`${API_BASE}/users/me/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ password: currentPassword, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? data.error ?? "Erreur serveur");
  return data;
};

export const getGithubAuthUrl = (token) =>
  `${SERVER_BASE}/auth/github?token=${encodeURIComponent(token)}`;

export const exchangeGithubCode = async (code, state) => {
  const res = await fetch(`${SERVER_BASE}/auth/github/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
};

export const getGithubRepos = async () => {
  const res = await fetch(`${SERVER_BASE}/auth/github/repos`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
};

export const disconnectGithub = async () => {
  const res = await fetch(`${SERVER_BASE}/auth/github/disconnect`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
};

export const getAnalyses = async () => {
  const res = await fetch(`${API_BASE}/analyses`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
};

export const getVulnerabilities = async (analysisId) => {
  const res = await fetch(`${API_BASE}/vulnerabilities/${analysisId}`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
  return data;
};
