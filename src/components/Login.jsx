import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import { useAuth } from "../utils/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChangeField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await loginUser({ email: form.email, password: form.password });
      login(access_token, user);
      navigate("/");
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
          autoComplete="current-password"
          value={form.password}
          onChange={onChangeField("password")}
          required
        />
        <div className="auth-help-row">
          <Link to="/mot-de-passe-oublie" className="btn-link">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
};

export default Login;
