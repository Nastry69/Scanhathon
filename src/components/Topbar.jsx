import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

/** Topbar */
const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn, logout } = useAuth();
  const isAuthPage = location.pathname === "/authpage";

  const handleLogout = () => {
    logout();
    navigate("/authpage");
  };

  const handleLoginClick = () => {
    navigate("/authpage");
  };

  return (
    <header className="topbar">
      <a className="topbar-brand" onClick={() => navigate("/")}>Secure<span style={{ color: "#05E575" }}>Scan</span></a>
      {loggedIn && (
        <nav className="topbar-nav">
          <a className={`topbar-nav-link${location.pathname === "/" ? " active" : ""}`} onClick={() => navigate("/")}>Analyse</a>
<a className={`topbar-nav-link${location.pathname === "/analyses/historique" ? " active" : ""}`} onClick={() => navigate("/analyses/historique")}>Historique</a>
        </nav>
      )}
      <div className="topbar-right">
        {loggedIn ? (
          <div>
            <button className="topbar-btn" onClick={() => { handleLogout(); navigate("/"); }} >
              Se déconnecter
            </button>
            <button className="topbar-icon-btn topbar-icon-btn--active" onClick={() => navigate("/profile")}>
              <i className="fa-solid fa-user"></i>
            </button>
          </div>
        ) : (
          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => isAuthPage ? navigate("/") : handleLoginClick()}>
              {isAuthPage ? "Retour à l'accueil" : "Login"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;