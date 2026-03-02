import React from "react";

/** Topbar */
const Topbar = () => {
  return (
    /** Element Topbar */
    <header className="topbar">

    {/** Element de gauche de la Topbar */}
      <div className="topbar-left" />

    {/* Element de droite contenant les actions utilisateur */}
      <div className="topbar-right">

    {/* Bouton notifications */}
        <button className="topbar-icon-btn" aria-label="Notifications">
          🔔
        </button>

    {/* Bouton profil utilisateur */}
        <button className="topbar-icon-btn" aria-label="Profil">
          👤
        </button>
      </div>
    </header>
  );
};

export default Topbar;