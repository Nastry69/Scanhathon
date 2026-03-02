import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import NewScan from "./pages/NewScan";
import ScanInProgress from "./pages/ScanInProgress";
import ScanResult from "./pages/ScanResult";
import ScanHistory from "./pages/ScanHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/analyses/nouveau" />} />
        <Route path="/analyses/nouveau" element={<NewScan />} />
        <Route path="/analyses/en-cours" element={<ScanInProgress />} />
        <Route path="/analyses/resultat" element={<ScanResult />} />
        <Route path="/analyses/historique" element={<ScanHistory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/profil" element={<Profile />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/analyses/nouveau" />} />
      </Routes>
    </Layout>
  );
};

export default App;