import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    /** Element sidebar */
    <aside className="sidebar">
    {/* Zone branding / identité produit */}
      <div className="sidebar-logo">
        <div className="logo-icon">🔒</div>
        <span className="logo-text">ScanHathon</span>
      </div>

    {/* Navigation principale */}
      <nav className="sidebar-nav">

    {/** Navigation des routes */}
        <NavLink
          to="/analyses/resultat"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link-active" : "")
          }
        >
          Tableau de bord
        </NavLink>

        <NavLink
          to="/analyses/nouveau"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link-active" : "")
          }
        >
          Nouveau projet
        </NavLink>

        <NavLink
          to="/analyses/historique"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link-active" : "")
          }
        >
          Historique
        </NavLink>
      </nav>

    {/* Zone secondaire en bas de la sidebar */}
      <div className="sidebar-footer">
        <button className="sidebar-help">Aide</button>
      </div>
    </aside>
  );
};

export default Sidebar;