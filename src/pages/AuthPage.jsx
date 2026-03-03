import React, { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";

const views = {
  login: {
    title: "Connexion",
    subtitle: "Connectez-vous pour accéder à votre espace et à vos analyses.",
    footer: { text: "Pas encore de compte ?", cta: "Créer un compte", next: "register" },
  },
  register: {
    title: "Créer un compte",
    subtitle: "Créez votre compte pour commencer à analyser vos dépôts.",
    footer: { text: "Déjà un compte ?", cta: "Se connecter", next: "login" },
  },
};

const AuthPage = ({ defaultView = "login" }) => {
  const [view, setView] = useState(defaultView);
  const { title, subtitle, footer } = views[view];

  return (
    <div className="page-wrapper auth-page">
      <div className="card auth-card">
        <Link to="/" className="btn-link auth-back-link">← Retour à l'accueil</Link>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>

        {view === "login" ? (
          <Login />
        ) : (
          <Register onSuccess={() => setView("login")} />
        )}

        <div className="auth-footer">
          <span>{footer.text}</span>
          <button type="button" className="btn-link" onClick={() => setView(footer.next)}>
            {footer.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
