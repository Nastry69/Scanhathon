import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import NewScan from "./pages/NewScan";
import ScanInProgress from "./pages/ScanInProgress";
import ScanResult from "./pages/ScanResult";
import ScanHistory from "./pages/ScanHistory";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<NewScan />} />
        <Route path="/analyses/en-cours" element={<ScanInProgress />} />
        <Route path="/analyses/resultat" element={<ScanResult />} />
        <Route path="/analyses/historique" element={<ScanHistory />} />
        <Route path="/authpage" element={<AuthPage defaultView="login" />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default App;