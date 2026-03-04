import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NewScan from "./pages/NewScan";
import ScanResult from "./pages/ScanResult";
import ScanHistory from "./pages/ScanHistory";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<NewScan />} />
        <Route path="/analyses/resultat" element={<ScanResult />} />
        <Route path="/analyses/historique" element={<ScanHistory />} />
        <Route path="/authpage" element={<AuthPage defaultView="login" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NewScan />} />
      </Routes>
    </Layout>
  );
};

export default App;