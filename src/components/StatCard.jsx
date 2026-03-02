import React from "react";

/** Stat Card */
const StatCard = ({ label, value, sub }) => {
  return (
    /**  Conteneur principal de la carte statistique */
    <div className="stat-card">

    {/* Titre de la statistique */}
      <div className="stat-label">{label}</div>

    {/* Valeur principale */}
      <div className="stat-value">{value}</div>
    
    {/* Affichage conditionnel */}
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
};

export default StatCard;