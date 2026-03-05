import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeGithubCode } from "../utils/api";
import { useAuth } from "../utils/AuthContext";

const GithubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      navigate("/profile?github=error", { replace: true });
      return;
    }

    exchangeGithubCode(code, state)
      .then((data) => {
        updateUser({ ...user, github_username: data.github_username });
        navigate("/profile?github=success", { replace: true });
      })
      .catch(() => {
        navigate("/profile?github=error", { replace: true });
      });
  }, []);

  return (
    <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "80px" }}>
      <p>Connexion GitHub en cours…</p>
    </div>
  );
};

export default GithubCallback;
