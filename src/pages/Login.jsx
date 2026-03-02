import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: Appeler l'API de login (POST /auth/login)
    // et gérer la redirection + stockage du token
    console.log("Login submit", { email, password });
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="card auth-card">
        <h1 className="page-title">Connexion</h1>
        <p className="page-subtitle">
          Connectez-vous pour accéder à votre espace et à vos analyses.
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              className="input auth-input"
              placeholder="exemple@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="auth-help-row">
              <Link to="/mot-de-passe-oublie" className="btn-link">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit">
            Se connecter
          </button>
        </form>

        <div className="auth-footer">
          <span>Pas encore de compte ?</span>
          <Link to="/register" className="btn-link">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;