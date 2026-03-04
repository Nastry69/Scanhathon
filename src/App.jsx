import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import NewScan from "./pages/NewScan";
import ScanResult from "./pages/ScanResult";
import ScanHistory from "./pages/ScanHistory";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import GithubCallback from "./pages/GithubCallback";
import ScanInProgress from "./pages/ScanInProgress";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<NewScan />} />
        <Route path="/analyses/en-cours" element={<ScanInProgress />} />
        <Route path="/analyses/resultat" element={<ScanResult />} />
        <Route path="/analyses/historique" element={<ScanHistory />} />
        <Route path="/authpage" element={<AuthPage defaultView="login" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth/github/callback" element={<GithubCallback />} />
        <Route path="*" element={<NewScan />} />
      </Routes>
    </Layout>
  );
};

export default App;