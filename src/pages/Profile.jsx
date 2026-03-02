import React, { useState } from "react";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "John Doe", // à remplacer par les vraies données plus tard
    email: "john.doe@example.com",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const onChangeProfileField = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onChangePasswordField = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmitProfile = (e) => {
    e.preventDefault();
    // TODO: Appel API pour mettre à jour le profil (PUT /me ou profil)
    console.log("Update profile", profile);
  };

  const onSubmitPassword = (e) => {
    e.preventDefault();
    // TODO: Vérifier côté front que newPassword === confirmNewPassword (optionnel)
    // TODO: Appel API changement de mot de passe (POST /auth/change-password)
    console.log("Change password", passwordForm);
  };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Profil</h1>
      <p className="page-subtitle">
        Gérez vos informations personnelles et modifiez votre mot de passe.
      </p>

      <div className="profile-grid">
        {/* Carte : informations de compte */}
        <div className="card profile-card">
          <h2 className="section-title">Informations du compte</h2>
          <form onSubmit={onSubmitProfile} className="profile-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input auth-input"
                value={profile.fullName}
                onChange={onChangeProfileField("username")}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                className="input auth-input"
                value={profile.email}
                onChange={onChangeProfileField("email")}
                required
              />
            </div>

            <button type="submit" className="btn-secondary">
              Enregistrer les modifications
            </button>
          </form>
        </div>

        {/* Carte : changement de mot de passe */}
        <div className="card profile-card">
          <h2 className="section-title">Modifier le mot de passe</h2>
          <form onSubmit={onSubmitPassword} className="profile-form">
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

            <button type="submit" className="btn-primary">
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;