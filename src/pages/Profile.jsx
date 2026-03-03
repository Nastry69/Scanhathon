import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { getMe, updateProfile, changePassword } from "../utils/api";

const Profile = () => {
  const { user, updateUser } = useAuth();

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

  useEffect(() => {
    getMe()
      .then((data) => {
        setUsername(data.username ?? "");
        // Merge pour ne pas perdre l'email stocké depuis le login
        updateUser({ ...user, ...data });
      })
      .catch(() => {});
  }, []);

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
      </div>
    </div>
  );
};

export default Profile;
