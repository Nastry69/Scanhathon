import React from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../auth";

/** Topbar */
const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // On supprime le token côté front
    logout();
    // On renvoie l'utilisateur sur la page de login
    navigate("/login");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const loggedIn = isAuthenticated();

  return (
    <header className="topbar">
      <div className="topbar-left" />
      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          🔔
        </button>

        {loggedIn ? (
          <>
            {/* Icône profil (plus tard tu pourras l’ouvrir en menu) */}
            <button className="topbar-icon-btn" aria-label="Profil">
              👤
            </button>

            {/* Bouton de déconnexion */}
            <button
              className="topbar-icon-btn"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              ⏏
            </button>
          </>
        ) : (
          // Si pas connecté → accès rapide à la page de login
          <button
            className="topbar-icon-btn"
            onClick={handleLoginClick}
            aria-label="Se connecter"
          >
            🔐
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;