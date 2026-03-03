import React from "react";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useAuth } from "../utils/AuthContext";


/** Configuration du Layout */
const Layout = ({ children }) => {
  const { loggedIn } = useAuth();

  return (
    /** Conteneur principal */
    <div className="app-root">
    {/** Conteneur Main */}
      <div className="app-main">
    {/** Barre de Navigation */}
        <Topbar loggedIn={loggedIn}/>
    {/** Zone dynamique de contenu */}
        <main className="app-content">{children}</main>
    {/** Footer global */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;