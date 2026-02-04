import React, { useState } from "react";
import Card from "../components/Card.jsx";
import Toast from "../components/Toast.jsx";
import TropicalWaves from "../components/TropicalWaves.jsx";
import { api } from "../api.js";

export default function ChangePasswordPage({ token, user, onDone, onLogout }) {
  const [toast, setToast] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (newPassword.length < 6) {
      setToast("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setToast("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        token,
        body: { newPassword }
      });
      onDone();
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <TropicalWaves />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <Card
            title="Update your password"
            subtitle={`Hello ${user.username} , please choose a new password to continue.`}
          >
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm text-zinc-700 dark:text-zinc-300/80">
                  New password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-700 dark:text-zinc-300/80">
                  Confirm new password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={busy}
                />
              </div>

              <button
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save password"}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.10] transition px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50 disabled:opacity-50"
                disabled={busy}
              >
                Logout
              </button>
            </form>
          </Card>

          <Toast text={toast} onClose={() => setToast("")} />
        </div>
      </div>
    </div>
  );
}