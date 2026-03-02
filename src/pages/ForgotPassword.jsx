import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: Appel API pour initier la réinitialisation (POST /auth/forgot-password)
    console.log("Forgot password submit", { email });
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="card auth-card">
        <h1 className="page-title">Mot de passe oublié</h1>
        <p className="page-subtitle">
          Entrez votre adresse e-mail, nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
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
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit">
            Envoyer le lien de réinitialisation
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="btn-link">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;