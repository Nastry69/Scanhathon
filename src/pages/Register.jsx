import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const onChangeField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: contrôle front optionnel (password === confirmPassword)
    // TODO: Appel API d'inscription (POST /auth/register)
    console.log("Register submit", form);
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="card auth-card">
        <h1 className="page-title">Créer un compte</h1>
        <p className="page-subtitle">
          Créez votre compte pour commencer à analyser vos dépôts.
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="fullName">
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              className="input auth-input"
              placeholder="Prénom Nom"
              value={form.fullName}
              onChange={onChangeField("fullName")}
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
              placeholder="vous@exemple.com"
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
              value={form.confirmPassword}
              onChange={onChangeField("confirmPassword")}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">
            Créer un compte
          </button>
        </form>

        <div className="auth-footer">
          <span>Déjà un compte ?</span>
          <Link to="/login" className="btn-link">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;