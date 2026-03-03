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

export const loginUser = ({ email, password }) =>
  post("/users/login", { email, password });

// Retourne { access_token, user }

export const registerUser = ({ username, email, password }) =>
  post("/users/register", { username, email, password });

// Retourne { id, username, created_at }
