import React, { useEffect, useRef, useState } from "react";

/**
 * VoiceControls
 * - Voice input: converts speech → text and sends it back via onVoiceText
 * - Mute toggle: controls TTS speaking in ChatPage + BookingWizard
 *
 * Props:
 * - muted (boolean)
 * - setMuted(fn)
 * - onVoiceText(text)
 * - lang ("en" | "fr")
 */
export default function VoiceControls({ muted, setMuted, onVoiceText, lang = "en" }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

    setSupported(ok);
    if (!ok) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();

    // ✅ language-aware recognition
    rec.lang = lang === "fr" ? "fr-FR" : "en-US";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (e) => {
      const raw = e.results?.[0]?.[0]?.transcript || "";
      const text = String(raw).trim();
      if (text) onVoiceText?.(text);
      setListening(false);
      setError("");
    };

    rec.onerror = (e) => {
      setListening(false);
      setError(e?.error ? `Voice error: ${e.error}` : "Voice input error");
    };

    rec.onend = () => setListening(false);

    recognitionRef.current = rec;

    return () => {
      try {
        rec.abort?.();
      } catch {}
      recognitionRef.current = null;
    };
  }, [onVoiceText, lang]); // ✅ re-init when language changes

  function start() {
    if (!supported || !recognitionRef.current) return;
    setError("");
    try {
      setListening(true);
      recognitionRef.current.start();
    } catch (e) {
      setListening(false);
      setError(lang === "fr" ? "Impossible de démarrer la saisie vocale." : "Unable to start voice input.");
    }
  }

  function stop() {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    setListening(false);
  }

  const labels =
    lang === "fr"
      ? {
          voice: "Voix 🎙️",
          listening: "Écoute… 🎙️",
          muteOn: "Muet 🔇",
          muteOff: "Son 🔊",
          speakNow: "Parlez maintenant…",
          ready: "Voix prête",
          unsupported: "Voix indisponible",
          stopTitle: "Arrêter la saisie vocale",
          startTitle: "Parlez à Travel Buddy",
          unsupportedTitle: "Saisie vocale non prise en charge"
        }
      : {
          voice: "Voice 🎙️",
          listening: "Listening… 🎙️",
          muteOn: "Muted 🔇",
          muteOff: "Sound 🔊",
          speakNow: "Speak now…",
          ready: "Voice Ready",
          unsupported: "Voice Unsupported",
          stopTitle: "Stop voice input",
          startTitle: "Speak to Travel Buddy",
          unsupportedTitle: "Voice input not supported in this browser"
        };

  return (
    <div className="flex items-center gap-2">
      {/* Voice input button */}
      <button
        type="button"
        onClick={listening ? stop : start}
        disabled={!supported}
        className={[
          "rounded-full px-4 py-2 text-sm font-semibold shadow transition",
          supported
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95"
            : "bg-zinc-400/40 text-zinc-700 dark:text-zinc-200 cursor-not-allowed"
        ].join(" ")}
        title={
          supported
            ? listening
              ? labels.stopTitle
              : labels.startTitle
            : labels.unsupportedTitle
        }
      >
        {listening ? labels.listening : labels.voice}
      </button>

      {/* Mute toggle */}
      <button
        type="button"
        onClick={() => setMuted?.(!muted)}
        className={[
          "rounded-full px-4 py-2 text-sm font-semibold border transition",
          muted
            ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-200 hover:bg-rose-500/15"
            : "border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10]"
        ].join(" ")}
        title={muted ? (lang === "fr" ? "Activer la voix" : "Unmute voice output") : (lang === "fr" ? "Couper la voix" : "Mute voice output")}
      >
        {muted ? labels.muteOn : labels.muteOff}
      </button>

      {/* Small status text */}
      <div className="hidden md:block">
        <div className="text-xs text-zinc-700 dark:text-zinc-300/75">
          {listening ? labels.speakNow : supported ? labels.ready : labels.unsupported}
        </div>
        {error && <div className="text-xs text-rose-600 dark:text-rose-300">{error}</div>}
      </div>
    </div>
  );
}