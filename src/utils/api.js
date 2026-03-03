import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

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

// Retourne { access_token, user }

export const registerUser = ({ username, email, password }) =>
  post("/users/register", { username, email, password });

// Retourne { id, username, created_at }

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
