import React, { useState } from "react";
import Card from "../components/Card.jsx";
import PreferencesModal from "../components/PreferencesModal.jsx";
import Toast from "../components/Toast.jsx";
import TropicalWaves from "../components/TropicalWaves.jsx";
import { api } from "../api.js";

export default function AuthPage({ onAuth, theme, setTheme }) {
  const [mode, setMode] = useState("signup"); // signup | login
  const [toast, setToast] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [preferences, setPreferences] = useState([]);

  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "signup") {
        const data = await api("/api/auth/signup", {
          method: "POST",
          body: { email, password, username, preferences }
        });
        onAuth(data);
      } else {
        const data = await api("/api/auth/login", {
          method: "POST",
          body: { email, password }
        });
        onAuth(data);
      }
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    const mail = (email || "").trim() || window.prompt("Enter your email address:");
    if (!mail) return;

    setBusy(true);
    try {
      const r = await api("/api/auth/forgot-password", {
        method: "POST",
        body: { email: mail }
      });
      setToast(r.message || "If the email exists, you will receive a reset email shortly.");
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <TropicalWaves />

      <div className="relative max-w-md md:max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-3 py-1.5 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Travel Buddy</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-300/70">Mauritius</span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Book hotels and taxis, effortlessly.
            </h1>
            <p className="mt-2 text-zinc-700 dark:text-zinc-300/80 max-w-xl">
              Create an account, set your stay preferences, and let Travel Buddy guide your booking journey.
            </p>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.10] backdrop-blur px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition"
          >
            {theme === "dark" ? "Light mode ☀️" : "Night mode 🌙"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            title="A smarter way to explore Mauritius"
            subtitle="Hotel stays • Airport transfers • City rides"
          >
            <div className="space-y-4 text-zinc-800 dark:text-zinc-200/90">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur p-4">
                <div className="text-sm font-semibold mb-1">Popular areas</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Grand Baie", "Flic en Flac", "Le Morne", "Trou aux Biches", "Port Louis"].map((x) => (
                    <span
                      key={x}
                      className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-3 py-1"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur p-4">
                  <div className="text-sm font-semibold">Voice + Text</div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300/80 mt-1">
                    Speak to Travel Buddy or type. You’re in control!
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur p-4">
                  <div className="text-sm font-semibold">Fast checkout</div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300/80 mt-1">
                    Get a pre-filled link + QR code to continue on your phone.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title={mode === "signup" ? "Create your account" : "Welcome back"}
            subtitle={mode === "signup" ? "Use a valid email address" : "Log in to continue"}
          >
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm text-zinc-700 dark:text-zinc-300/80">Email</label>
                <input
                  className="mt-1 w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-700 dark:text-zinc-300/80">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
                  disabled={busy}
                />
              </div>

              {mode === "signup" && (
                <>
                  <div>
                    <label className="text-sm text-zinc-700 dark:text-zinc-300/80">Username</label>
                    <input
                      className="mt-1 w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Krishna"
                      disabled={busy}
                    />
                  </div>

                  <PreferencesModal value={preferences} onChange={setPreferences} />
                </>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={forgotPassword}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:opacity-90"
                    disabled={busy}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
              </button>

              <div className="text-sm text-zinc-700 dark:text-zinc-300/80">
                {mode === "signup" ? "Already have an account?" : "New to Travel Buddy?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  className="font-semibold text-indigo-600 dark:text-indigo-300 hover:opacity-90"
                  disabled={busy}
                >
                  {mode === "signup" ? "Login" : "Create account"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Toast text={toast} onClose={() => setToast("")} />
    </div>
  );
}