import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { getMe, updateProfile, changePassword, getGithubAuthUrl, disconnectGithub } from "../utils/api";
import { getToken } from "../utils/auth";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? "");
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [githubMsg, setGithubMsg] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState(user?.github_username ?? null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUsername(data.username ?? "");
        setGithubUsername(data.github_username ?? null);
        // Merge pour ne pas perdre l'email stocké depuis le login
        updateUser({ ...user, ...data });
      })
      .catch(() => {});
  }, []);

  // Gérer le retour du callback GitHub
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const github = params.get("github");
    if (!github) return;

    if (github === "success") {
      // Rafraîchir les données pour afficher le nouveau github_username
      getMe()
        .then((data) => {
          setGithubUsername(data.github_username ?? null);
          updateUser({ ...user, ...data });
          setGithubMsg({ type: "success", text: "Compte GitHub connecté avec succès." });
        })
        .catch(() => {
          setGithubMsg({ type: "success", text: "Compte GitHub connecté avec succès." });
        });
    } else {
      setGithubMsg({ type: "error", text: "Échec de la connexion GitHub. Réessayez." });
    }

    // Nettoyer le query param de l'URL
    navigate("/profile", { replace: true });
  }, [location.search]);

  const onSubmitProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const updated = await updateProfile({ username });
      updateUser({ ...user, ...updated });
      setProfileMsg({ type: "success", text: "Profil mis à jour avec succès." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePasswordField = (field) => (e) =>
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: "success", text: "Mot de passe mis à jour avec succès." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const onConnectGithub = () => {
    const token = getToken();
    window.location.href = getGithubAuthUrl(token);
  };

  const onDisconnectGithub = async () => {
    setGithubMsg(null);
    setGithubLoading(true);
    try {
      await disconnectGithub();
      setGithubUsername(null);
      updateUser({ ...user, github_username: null, github_access_token: null });
      setGithubMsg({ type: "success", text: "Compte GitHub déconnecté." });
    } catch (err) {
      setGithubMsg({ type: "error", text: err.message });
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Profil</h1>
      <p className="page-subtitle">
        Gérez vos informations personnelles et modifiez votre mot de passe.
      </p>

      <div className="profile-grid">
        {/* Carte : informations du compte */}
        <div className="card profile-card">
          <h2 className="section-title">Informations du compte</h2>
          <form onSubmit={onSubmitProfile} className="profile-form">
            {profileMsg && (
              <p className={profileMsg.type === "error" ? "auth-error" : "auth-success"}>
                {profileMsg.text}
              </p>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                className="input auth-input"
                value={user?.email ?? ""}
                disabled
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                className="input auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-secondary" disabled={profileLoading}>
              {profileLoading ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        {/* Carte : changement de mot de passe */}
        <div className="card profile-card">
          <h2 className="section-title">Modifier le mot de passe</h2>
          <form onSubmit={onSubmitPassword} className="profile-form">
            {passwordMsg && (
              <p className={passwordMsg.type === "error" ? "auth-error" : "auth-success"}>
                {passwordMsg.text}
              </p>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="currentPassword">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                type="password"
                className="input auth-input"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={onChangePasswordField("currentPassword")}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="newPassword">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                className="input auth-input"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={onChangePasswordField("newPassword")}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmNewPassword">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                className="input auth-input"
                placeholder="••••••••"
                value={passwordForm.confirmNewPassword}
                onChange={onChangePasswordField("confirmNewPassword")}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
            </button>
          </form>
        </div>

        {/* Carte : connexion GitHub */}
        <div className="card profile-card github-card">
          <h2 className="section-title">Connexion GitHub</h2>
          <p className="github-card-desc">
            Connectez votre compte GitHub pour scanner vos dépôts privés.
          </p>

          {githubMsg && (
            <p className={githubMsg.type === "error" ? "auth-error" : "auth-success"}>
              {githubMsg.text}
            </p>
          )}

          {githubUsername ? (
            <div className="github-connected">
              <div className="github-status">
                <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="github-username">@{githubUsername}</span>
                <span className="github-badge">Connecté</span>
              </div>
              <button
                className="btn-github-disconnect"
                onClick={onDisconnectGithub}
                disabled={githubLoading}
              >
                {githubLoading ? "Déconnexion…" : "Déconnecter"}
              </button>
            </div>
          ) : (
            <button
              className="btn-github"
              onClick={onConnectGithub}
              disabled={githubLoading}
            >
              <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Connecter avec GitHub
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
