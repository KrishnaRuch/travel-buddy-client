import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import Toast from "../components/Toast.jsx";
import VoiceControls from "../components/VoiceControls.jsx";
import BookingWizard from "../components/BookingWizard.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import TropicalWaves from "../components/TropicalWaves.jsx";
import { api } from "../api.js";

function getInitialLang() {
  const v = localStorage.getItem("tb_lang");
  return v === "fr" ? "fr" : "en";
}

const UI = {
  en: {
    welcome: (name) => `Welcome, ${name}.\nI’m Travel Buddy. Ready when you are!`,
    chatTitle: "Chat",
    chatSubtitle: "Ask questions or start a booking",
    hotelsTaxisMaurice: "Hotels • Taxis • Mauritius",
    bookHotel: "Book hotel 🏨",
    bookTaxi: "Book taxi 🚕",
    send: "Send",
    placeholderIdle: "Type your message…",
    placeholderBusy: "Travel Buddy is responding...",
    confirming: "Confirming your booking…",
    confirmedEmailOk: "Booking confirmed. A confirmation email has been sent.",
    confirmedEmailFail:
      "Booking confirmed. Email could not be sent right now, please use the link/QR below.",
    useLinkQr: "Use the link below or scan the QR code.",
    openBooking: "Open booking link ↗",
    scanToContinue: "Scan to continue",
    calendarConnectedToast: "Google Calendar connected ✅",
    calendarFailedToast: "Google Calendar connection failed. Please try again.",
    calendarStartFail: "Could not start Google auth.",
    calendarDisconnected: "Google Calendar disconnected.",
    calendarDisconnectFail: "Failed to disconnect.",
    checking: "Checking…",
    connectCalendar: "Connect Calendar 📅",
    calendarOkPill: "Calendar ✅",
    synced: "Calendar synced ✅",
    logout: "Logout",
    light: "Light ☀️",
    night: "Night 🌙",
    langEnglish: "🇬🇧 English",
    langFrench: "🇫🇷 Français",
    langSwitchedToEn: "Language switched to English 🇬🇧",
    langSwitchedToFr: "Langue changée : Français 🇫🇷"
  },
  fr: {
    welcome: (name) => `Bienvenue, ${name}.\nJe suis Travel Buddy. Prêt quand vous l’êtes !`,
    chatTitle: "Chat",
    chatSubtitle: "Posez une question ou démarrez une réservation",
    hotelsTaxisMaurice: "Hôtels • Taxis • Maurice",
    bookHotel: "Réserver un hôtel 🏨",
    bookTaxi: "Réserver un taxi 🚕",
    send: "Envoyer",
    placeholderIdle: "Tapez votre message…",
    placeholderBusy: "Travel Buddy répond...",
    confirming: "Confirmation de votre réservation…",
    confirmedEmailOk: "Réservation confirmée. Un e-mail de confirmation a été envoyé.",
    confirmedEmailFail:
      "Réservation confirmée. L’e-mail n’a pas pu être envoyé pour le moment. Utilisez le lien/QR ci-dessous.",
    useLinkQr: "Utilisez le lien ci-dessous ou scannez le QR code.",
    openBooking: "Ouvrir le lien ↗",
    scanToContinue: "Scanner pour continuer",
    calendarConnectedToast: "Google Agenda connecté ✅",
    calendarFailedToast: "Connexion Google échouée. Réessayez.",
    calendarStartFail: "Impossible de démarrer l’auth Google.",
    calendarDisconnected: "Google Agenda déconnecté.",
    calendarDisconnectFail: "Échec de la déconnexion.",
    checking: "Vérification…",
    connectCalendar: "Connecter l’agenda 📅",
    calendarOkPill: "Agenda ✅",
    synced: "Agenda synchronisé ✅",
    logout: "Déconnexion",
    light: "Clair ☀️",
    night: "Nuit 🌙",
    langEnglish: "🇬🇧 English",
    langFrench: "🇫🇷 Français",
    langSwitchedToEn: "Language switched to English 🇬🇧",
    langSwitchedToFr: "Langue changée : Français 🇫🇷"
  }
};

export default function ChatPage({ token, user, onLogout, theme, setTheme }) {
  // ✅ language is stateful + toggleable
  const [lang, setLang] = useState(() => getInitialLang());
  const t = UI[lang];

  const [toast, setToast] = useState("");
  const [muted, setMuted] = useState(false);
  const [wizardType, setWizardType] = useState(null);

  // ✅ keep the welcome bubble but make it update on lang switch
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "bot",
      text: UI[getInitialLang()].welcome(user.username),
      meta: { kind: "welcome" }
    }
  ]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Booking submission UX + retry
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [lastBookingPayload, setLastBookingPayload] = useState(null);
  const [bookingSubmitError, setBookingSubmitError] = useState("");

  // Google Calendar state
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarChecking, setCalendarChecking] = useState(true);

  const bottomRef = useRef(null);

  // ✅ prevent "language switched" toast on initial mount
  const firstLangRenderRef = useRef(true);

  // ✅ persist language for future sessions
  useEffect(() => {
    try {
      localStorage.setItem("tb_lang", lang);
    } catch {}
  }, [lang]);

  // ✅ update the welcome message + toast on language changes (without clearing chat)
  useEffect(() => {
    // update welcome bubble text
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "welcome" ? { ...m, text: UI[lang].welcome(user.username) } : m
      )
    );

    if (firstLangRenderRef.current) {
      firstLangRenderRef.current = false;
      return;
    }

    // ✅ toast should match the language switched to
    setToast(lang === "fr" ? UI.fr.langSwitchedToFr : UI.en.langSwitchedToEn);
  }, [lang, user.username]);

  function speak(text) {
    if (muted) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text || ""));
    u.rate = 1;
    u.pitch = 1;

    // ✅ set TTS language
    u.lang = lang === "fr" ? "fr-FR" : "en-US";

    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, wizardType, busy, bookingSubmitting, bookingSubmitError]);

  const bookingActions = useMemo(
    () => [
      { label: t.bookHotel, onClick: () => setWizardType("hotel") },
      { label: t.bookTaxi, onClick: () => setWizardType("taxi") }
    ],
    [t.bookHotel, t.bookTaxi]
  );

  // ✅ On mount + on language change: check google status + handle callback query param
  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        setCalendarChecking(true);

        const qs = new URLSearchParams(window.location.search);
        const googleFlag = qs.get("google");

        if (googleFlag === "connected") {
          setToast(t.calendarConnectedToast);
          qs.delete("google");
          const newUrl =
            window.location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
          window.history.replaceState({}, "", newUrl);
        } else if (googleFlag?.startsWith("error")) {
          setToast(t.calendarFailedToast);
          qs.delete("google");
          const newUrl =
            window.location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
          window.history.replaceState({}, "", newUrl);
        }

        const r = await api("/api/google/status", { method: "GET", token });
        if (!cancelled) setCalendarConnected(!!r.connected);
      } catch {
        if (!cancelled) setCalendarConnected(false);
      } finally {
        if (!cancelled) setCalendarChecking(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [token, t.calendarConnectedToast, t.calendarFailedToast]);

  async function connectCalendar() {
    try {
      const r = await api("/api/google/auth/start", { method: "GET", token });
      if (r?.url) window.location.href = r.url;
      else setToast(t.calendarStartFail);
    } catch (e) {
      setToast(e?.message || t.calendarStartFail);
    }
  }

  async function disconnectCalendar() {
    try {
      await api("/api/google/disconnect", { method: "POST", token });
      setCalendarConnected(false);
      setToast(t.calendarDisconnected);
    } catch (e) {
      setToast(e?.message || t.calendarDisconnectFail);
    }
  }

  async function sendChat(userText) {
    const txt = (userText || "").trim();
    if (!txt) return;

    setMessages((prev) => [...prev, { role: "user", text: txt }]);
    setInput("");
    setBusy(true);

    try {
      const r = await api("/api/chat", {
        method: "POST",
        token,
        body: { message: txt, lang } // ✅ language-aware server replies
      });

      if (r.type === "trigger") {
        setMessages((prev) => [...prev, { role: "bot", text: r.text }]);
        speak(r.text);
        if (r.intent === "book_hotel") setWizardType("hotel");
        if (r.intent === "book_taxi") setWizardType("taxi");
        return;
      }

      if (r.type === "fallback") {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: r.text, actions: bookingActions }
        ]);
        speak(r.text);
        return;
      }

      setMessages((prev) => [...prev, { role: "bot", text: r.text }]);
      speak(r.text);
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitBooking(details) {
    setLastBookingPayload(details);
    setBookingSubmitError("");
    setBookingSubmitting(true);

    const statusId = `booking-status-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: statusId, role: "bot", text: t.confirming, meta: { kind: "status" } }
    ]);

    try {
      // ✅ IMPORTANT: send lang to backend so taxi WhatsApp message is EN/FR correctly
      const result = await api("/api/bookings", {
        method: "POST",
        token,
        body: { ...details, lang }
      });

      const externalLink = result?.externalLink || result?.booking?.external_link || "";
      const qrUrl = result?.qrUrl || "";

      const emailOk = result?.email?.ok !== false;
      const emailError = result?.email?.error || "";

      const calendarOk = result?.calendar?.ok === true;
      const calendarLink = result?.calendar?.htmlLink || "";

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== statusId);

        const confirmText = emailOk ? t.confirmedEmailOk : t.confirmedEmailFail;

        const actions = [];

        if (externalLink) {
          actions.push({
            label: t.openBooking,
            onClick: () => window.open(externalLink, "_blank", "noopener,noreferrer")
          });
        }

        if (calendarOk && calendarLink) {
          actions.push({
            label: t.synced,
            onClick: () => window.open(calendarLink, "_blank", "noopener,noreferrer")
          });
        }

        const extraNote = !emailOk && emailError ? `\n\nEmail error: ${emailError}` : "";
        const calendarLine = calendarOk ? `\n${t.synced}` : "";

        return [
          ...filtered,
          {
            role: "bot",
            text:
              confirmText +
              (externalLink ? `\n${t.useLinkQr}` : "") +
              calendarLine +
              extraNote,
            actions,
            qrUrl: qrUrl || null
          }
        ];
      });

      speak(lang === "fr" ? "Réservation confirmée." : "Booking confirmed.");

      setWizardType(null);
      setBookingSubmitError("");
    } catch (err) {
      const msg =
        err?.message ||
        (lang === "fr"
          ? "Je n’ai pas pu confirmer la réservation. Réessayez."
          : "I couldn’t confirm the booking due to a network issue. Please try again.");

      setBookingSubmitError(msg);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== statusId);
        return [
          ...filtered,
          {
            role: "bot",
            text:
              lang === "fr"
                ? "Je ne peux pas confirmer la réservation pour le moment.\nVérifiez la connexion puis réessayez."
                : "I couldn’t confirm the booking right now.\nPlease check your connection (and that the server is running), then try again.",
            actions: [
              {
                label: lang === "fr" ? "Réessayer 🔁" : "Retry booking 🔁",
                onClick: async () => {
                  if (!details) return;
                  await submitBooking(details);
                }
              }
            ],
            meta: { kind: "error" }
          }
        ];
      });

      setToast(msg);
    } finally {
      setBookingSubmitting(false);
    }
  }

  async function retryLastBooking() {
    if (!lastBookingPayload) return;
    await submitBooking(lastBookingPayload);
  }

  function LanguageToggle() {
    const base =
      "rounded-full border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-semibold transition backdrop-blur";
    const active =
      "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow hover:opacity-95";
    const idle =
      "bg-white/70 dark:bg-white/[0.06] text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10]";

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={[base, lang === "en" ? active : idle].join(" ")}
          title="Switch to English"
        >
          {t.langEnglish}
        </button>
        <button
          type="button"
          onClick={() => setLang("fr")}
          className={[base, lang === "fr" ? active : idle].join(" ")}
          title="Passer en français"
        >
          {t.langFrench}
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <TropicalWaves />

      <div className="relative max-w-md md:max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow">
              TB
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Travel Buddy
              </h1>
              <p className="text-sm text-zinc-700 dark:text-zinc-300/80">
                {t.hotelsTaxisMaurice}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ Language toggle restored + works mid-chat */}
            <LanguageToggle />

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.10] backdrop-blur px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition"
            >
              {theme === "dark" ? t.light : t.night}
            </button>

            {/* Calendar connect/disconnect */}
            {!calendarConnected ? (
              <button
                onClick={connectCalendar}
                disabled={calendarChecking}
                className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.10] backdrop-blur px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50 transition disabled:opacity-50"
              >
                {calendarChecking ? t.checking : t.connectCalendar}
              </button>
            ) : (
              <button
                onClick={disconnectCalendar}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition"
                title={lang === "fr" ? "Déconnecter Google Agenda" : "Disconnect Google Calendar"}
              >
                {t.calendarOkPill}
              </button>
            )}

            <VoiceControls
              muted={muted}
              setMuted={setMuted}
              onVoiceText={(txt) => sendChat(txt)}
              lang={lang}
            />

            <button
              onClick={onLogout}
              className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition px-4 py-2 text-sm font-semibold shadow"
            >
              {t.logout}
            </button>
          </div>
        </div>

        <Card
          title={t.chatTitle}
          subtitle={t.chatSubtitle}
          right={
            <div className="flex gap-2">
              <button
                onClick={() => setWizardType("hotel")}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition"
              >
                {t.bookHotel}
              </button>
              <button
                onClick={() => setWizardType("taxi")}
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition"
              >
                {t.bookTaxi}
              </button>
            </div>
          }
        >
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/55 dark:bg-white/[0.06] backdrop-blur p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={m.id || idx} className="space-y-2">
                <ChatBubble
                  role={m.role === "bot" ? "bot" : "user"}
                  text={m.text}
                  actions={m.actions || []}
                  username={user.username}
                />

                {m.role === "bot" && m.qrUrl && (
                  <div className="ml-12">
                    <div className="inline-block rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur p-4 shadow-sm">
                      <div className="text-xs text-zinc-700 dark:text-zinc-300/80 mb-2 font-medium">
                        {t.scanToContinue}
                      </div>
                      <img
                        src={m.qrUrl}
                        alt="Booking QR code"
                        className="w-44 h-44 rounded-2xl border border-black/10 dark:border-white/10 bg-white"
                        onError={() => {
                          setToast(
                            lang === "fr"
                              ? "Impossible de charger le QR. Vérifiez que le serveur tourne et que /uploads est servi."
                              : "QR image could not load. Make sure the server is running and /uploads is served."
                          );
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {busy && <TypingIndicator />}

            {wizardType && (
              <div className="pt-2">
                <BookingWizard
                  type={wizardType}
                  muted={muted}
                  speak={speak}
                  onCancel={() => setWizardType(null)}
                  onSubmit={submitBooking}
                  submitting={bookingSubmitting}
                  submitError={bookingSubmitError}
                  onRetry={retryLastBooking}
                  lang={lang}
                />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={busy ? t.placeholderBusy : t.placeholderIdle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy) sendChat(input);
                }
              }}
              disabled={busy}
            />

            <button
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition px-5 py-3 font-semibold text-white shadow disabled:opacity-50"
              onClick={() => sendChat(input)}
              disabled={busy}
            >
              {t.send}
            </button>
          </div>
        </Card>
      </div>

      <Toast text={toast} onClose={() => setToast("")} />
    </div>
  );
}