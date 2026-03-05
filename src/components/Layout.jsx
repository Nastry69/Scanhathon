import React from "react";
import Topbar from "./Topbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="app-root">
      <div className="app-main">
        <Topbar />
        <main className="app-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;