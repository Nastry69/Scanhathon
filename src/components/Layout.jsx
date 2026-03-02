import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


/** Configuration du Layout */
const Layout = ({ children }) => {
  return (
    /** Conteneur principal */
    <div className="app-root">
    {/** Barre latérale */} 
      <Sidebar />
    {/** Conteneur Main */}
      <div className="app-main">
    {/** Barre de Navigation */}
        <Topbar />
    {/** Zone dynamique de contenu */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;