import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


/** Configuration du Layout */
const Layout = ({ children }) => {
  const loggedIn = !!localStorage.getItem("token");
  return (
    /** Conteneur principal */
    <div className="app-root">
      {loggedIn && <Sidebar />} {/**  Si connecter on affiche la barre latérale */} 
   
    {/** Conteneur Main */}
      <div className="app-main">
    {/** Barre de Navigation */}
        <Topbar loggedIn={loggedIn}/>
    {/** Zone dynamique de contenu */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;