import React, { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";

function getInitialTheme() {
  const saved = localStorage.getItem("tb_theme");
  if (saved === "light" || saved === "dark") return saved;
  // default to system preference
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("tb_token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tb_user") || "null");
    } catch {
      return null;
    }
  });
  const [mustChangePassword, setMustChangePassword] = useState(
    localStorage.getItem("tb_must_change_password") === "true"
  );

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("tb_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  function handleAuth(data) {
    setToken(data.token);
    setUser(data.user);
    setMustChangePassword(!!data.mustChangePassword);

    localStorage.setItem("tb_token", data.token);
    localStorage.setItem("tb_user", JSON.stringify(data.user));
    localStorage.setItem("tb_must_change_password", String(!!data.mustChangePassword));
  }

  function logout() {
    setToken("");
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    localStorage.removeItem("tb_must_change_password");
  }

  function passwordChanged() {
    setMustChangePassword(false);
    localStorage.setItem("tb_must_change_password", "false");
  }

  const common = useMemo(() => ({ theme, setTheme }), [theme]);

  if (!token || !user) return <AuthPage onAuth={handleAuth} {...common} />;
  if (mustChangePassword) {
    return (
      <ChangePasswordPage
        token={token}
        user={user}
        onDone={passwordChanged}
        onLogout={logout}
      />
    );
  }
  return <ChatPage token={token} user={user} onLogout={logout} {...common} />;
}