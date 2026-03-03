import React, { useState } from "react";
import { registerUser } from "../utils/api";

const Register = ({ onSuccess }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChangeField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username: form.username, email: form.email, password: form.password });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      {error && <p className="auth-error">{error}</p>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="username">
          Nom d'utilisateur
        </label>
        <input
          id="username"
          type="text"
          className="input auth-input"
          placeholder="monpseudo"
          autoComplete="username"
          value={form.username}
          onChange={onChangeField("username")}
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          className="input auth-input"
          placeholder="exemple@gmail.com"
          autoComplete="email"
          value={form.email}
          onChange={onChangeField("email")}
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="input auth-input"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.password}
          onChange={onChangeField("password")}
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="confirmPassword">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="input auth-input"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={onChangeField("confirmPassword")}
          required
        />
      </div>

      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? "Création…" : "Créer un compte"}
      </button>
    </form>
  );
};

export default Register;
