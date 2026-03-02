import React from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

/** Topbar */
const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        <span className="logo-text">ScanHathon</span>
      <div className="topbar-right">


        {loggedIn ? (
          <>
            {/* Icône profil (plus tard tu pourras l’ouvrir en menu) */}
            <button className="topbar-icon-btn" aria-label="Profil">
              <i className="fa-solid fa-user"></i>
            </button>

            {/* Bouton de déconnexion */}
            <button
              className="topbar-icon-btn"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
            <i class="fa-solid fa-arrow-left-from-bracket"></i>
            </button>
          </>
        ) : (
          // Si pas connecté → accès rapide à la page de login
          <button
            className="topbar-icon-btn"
            onClick={handleLoginClick}
            aria-label="Se connecter"
          >
            <i className="fa-solid fa-user"></i>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;