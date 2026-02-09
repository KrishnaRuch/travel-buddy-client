import React, { useEffect, useMemo, useRef, useState } from "react";

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function stripAccents(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function norm(s) {
  return stripAccents(String(s || "").toLowerCase().trim());
}

// Convert common spoken numbers to integers (EN + FR)
function spokenToNumber(text) {
  if (!text) return null;
  const t = norm(text);

  const digitMatch = t.match(/\d+/);
  if (digitMatch) return parseInt(digitMatch[0], 10);

  const map = {
    // EN
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,

    // FR
    un: 1,
    une: 1,
    deux: 2,
    trois: 3,
    quatre: 4,
    cinq: 5,
    six_fr: 6, // handled below
    sept: 7,
    huit: 8,
    neuf: 9,
    dix: 10,
    onze: 11,
    douze: 12
  };

  // special handling for "six" (same in EN/FR) after norm()
  if (t.includes("six")) return 6;

  for (const [word, val] of Object.entries(map)) {
    if (word === "six_fr") continue;
    if (t.includes(word)) return val;
  }

  return null;
}

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

const I18N = {
  en: {
    stepOf: (i, total) => `Step ${i} of ${total}`,
    hotelTitle: "Hotel booking",
    taxiTitle: "Taxi booking",
    answerByVoice: "Answer by voice 🎙️",
    listening: "Listening…",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    confirming: "Confirming…",
    confirmBooking: "Confirm booking",
    errors: {
      voiceUnsupported: "Voice input is not supported in this browser.",
      didntCatch: "I didn’t catch that. Please try again.",
      sayNumber: "Please say a number (e.g., “2”).",
      voiceFailed: "Voice input failed. Please type your answer.",
      enterValue: "Please enter a value.",
      selectValue: "Please select a value.",
      enterNumber: "Please enter a number.",
      between: (min, max) => `Please enter a value between ${min} and ${max}.`,
      checkoutAfter: "Check-out must be after check-in.",
      minChars: (n) => `Please enter at least ${n} characters.`
    },
    stepsHotel: [
      { key: "hotelNameOrArea", label: "Hotel name or area", kind: "text", placeholder: "e.g., Grand Baie", optional: false, minLen: 2 },
      { key: "checkIn", label: "Check-in date", kind: "date", optional: false },
      { key: "checkOut", label: "Check-out date", kind: "date", optional: false },
      { key: "rooms", label: "Rooms", kind: "number", min: 1, max: 20, optional: false },
      { key: "adults", label: "Adults", kind: "number", min: 1, max: 50, optional: false },
      { key: "children", label: "Children", kind: "number", min: 0, max: 50, optional: false },
      { key: "budgetMUR", label: "Budget (MUR)", kind: "number", min: 0, max: 1000000, optional: false },
      { key: "specialRequests", label: "Special requests (optional)", kind: "text", placeholder: "e.g., breakfast included", optional: true }
    ],
    stepsTaxi: [
      { key: "pickupLocation", label: "Pickup location", kind: "text", placeholder: "e.g., SSR Airport", optional: false, minLen: 2 },
      { key: "dropoffLocation", label: "Dropoff location", kind: "text", placeholder: "e.g., Port Louis", optional: false, minLen: 2 },
      { key: "pickupDate", label: "Pickup date", kind: "date", optional: false },
      { key: "pickupTime", label: "Pickup time", kind: "time", optional: false },
      { key: "passengers", label: "Number of passengers", kind: "number", min: 1, max: 50, optional: false },
      { key: "luggage", label: "Luggage (optional)", kind: "text", placeholder: "e.g., 2 suitcases", optional: true },
      { key: "notes", label: "Notes (optional)", kind: "text", placeholder: "Any additional info", optional: true }
    ]
  },
  fr: {
    stepOf: (i, total) => `Étape ${i} sur ${total}`,
    hotelTitle: "Réservation d’hôtel",
    taxiTitle: "Réservation de taxi",
    answerByVoice: "Répondre par voix 🎙️",
    listening: "Écoute…",
    cancel: "Annuler",
    back: "Retour",
    next: "Suivant",
    confirming: "Confirmation…",
    confirmBooking: "Confirmer",
    errors: {
      voiceUnsupported: "La saisie vocale n’est pas prise en charge dans ce navigateur.",
      didntCatch: "Je n’ai pas compris. Réessayez.",
      sayNumber: "Veuillez dire un nombre (ex. « 2 »).",
      voiceFailed: "La saisie vocale a échoué. Veuillez taper votre réponse.",
      enterValue: "Veuillez saisir une valeur.",
      selectValue: "Veuillez sélectionner une valeur.",
      enterNumber: "Veuillez saisir un nombre.",
      between: (min, max) => `Veuillez entrer une valeur entre ${min} et ${max}.`,
      checkoutAfter: "La date de départ doit être après la date d’arrivée.",
      minChars: (n) => `Veuillez saisir au moins ${n} caractères.`
    },
    stepsHotel: [
      { key: "hotelNameOrArea", label: "Nom de l’hôtel ou zone", kind: "text", placeholder: "ex. Grand Baie", optional: false, minLen: 2 },
      { key: "checkIn", label: "Date d’arrivée", kind: "date", optional: false },
      { key: "checkOut", label: "Date de départ", kind: "date", optional: false },
      { key: "rooms", label: "Chambres", kind: "number", min: 1, max: 20, optional: false },
      { key: "adults", label: "Adultes", kind: "number", min: 1, max: 50, optional: false },
      { key: "children", label: "Enfants", kind: "number", min: 0, max: 50, optional: false },
      { key: "budgetMUR", label: "Budget (MUR)", kind: "number", min: 0, max: 1000000, optional: false },
      { key: "specialRequests", label: "Demandes spéciales (optionnel)", kind: "text", placeholder: "ex. petit-déjeuner inclus", optional: true }
    ],
    stepsTaxi: [
      { key: "pickupLocation", label: "Lieu de prise en charge", kind: "text", placeholder: "ex. Aéroport SSR", optional: false, minLen: 2 },
      { key: "dropoffLocation", label: "Destination", kind: "text", placeholder: "ex. Port-Louis", optional: false, minLen: 2 },
      { key: "pickupDate", label: "Date de prise en charge", kind: "date", optional: false },
      { key: "pickupTime", label: "Heure de prise en charge", kind: "time", optional: false },
      { key: "passengers", label: "Nombre de passagers", kind: "number", min: 1, max: 50, optional: false },
      { key: "luggage", label: "Bagages (optionnel)", kind: "text", placeholder: "ex. 2 valises", optional: true },
      { key: "notes", label: "Remarques (optionnel)", kind: "text", placeholder: "Informations supplémentaires", optional: true }
    ]
  }
};

export default function BookingWizard({
  type, // "hotel" | "taxi"
  muted,
  speak,
  onCancel,
  onSubmit,
  submitting,
  submitError,
  onRetry,
  lang = "en"
}) {
  const L = lang === "fr" ? "fr" : "en";
  const T = I18N[L];

  const isHotel = type === "hotel";
  const isTaxi = type === "taxi";

  const steps = useMemo(() => {
    return isHotel ? T.stepsHotel : T.stepsTaxi;
  }, [isHotel, T]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const [form, setForm] = useState(() => {
    return isHotel
      ? {
          type: "hotel",
          hotelNameOrArea: "",
          checkIn: "",
          checkOut: "",
          rooms: 1,
          adults: 2,
          children: 0,
          budgetMUR: 0,
          specialRequests: ""
        }
      : {
          type: "taxi",
          pickupLocation: "",
          dropoffLocation: "",
          pickupDate: "",
          pickupTime: "",
          passengers: 1,
          luggage: "",
          notes: ""
        };
  });

  const [localError, setLocalError] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const inputRef = useRef(null);

  // reset on type/lang change
  useEffect(() => {
    setStepIndex(0);
    setLocalError("");
  }, [type, lang]);

  // Speak the question (unless muted)
  useEffect(() => {
    if (!step) return;
    setLocalError("");

    setTimeout(() => inputRef.current?.focus?.(), 50);

    if (!muted && typeof speak === "function") {
      speak(step.label);
    }
  }, [stepIndex, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      try {
        if (recRef.current) {
          recRef.current.onresult = null;
          recRef.current.onerror = null;
          recRef.current.onend = null;
          recRef.current.stop();
        }
      } catch {}
    };
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep() {
    setLocalError("");

    // Hotel check-out must be after check-in
    if (isHotel && step.key === "checkOut") {
      const ci = form.checkIn;
      const co = form.checkOut;
      if (ci && co) {
        const ciDate = new Date(ci);
        const coDate = new Date(co);
        if (!(coDate > ciDate)) {
          setLocalError(T.errors.checkoutAfter);
          return false;
        }
      }
    }

    const v = form[step.key];

    if (step.kind === "text") {
      if (step.optional) return true;

      const s = String(v || "").trim();
      if (!s) {
        setLocalError(T.errors.enterValue);
        return false;
      }

      const minLen = step.minLen ?? 1;
      if (s.length < minLen) {
        setLocalError(T.errors.minChars(minLen));
        return false;
      }

      return true;
    }

    if (step.kind === "date" || step.kind === "time") {
      if (!v || !String(v).trim()) {
        setLocalError(T.errors.selectValue);
        return false;
      }
      return true;
    }

    if (step.kind === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) {
        setLocalError(T.errors.enterNumber);
        return false;
      }
      const min = step.min ?? -Infinity;
      const max = step.max ?? Infinity;
      if (n < min || n > max) {
        setLocalError(T.errors.between(min, max));
        return false;
      }
      return true;
    }

    return true;
  }

  function next() {
    if (!validateStep()) return;
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
  }

  function back() {
    setLocalError("");
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function confirm() {
    setLocalError("");
    if (isHotel && form.checkIn && form.checkOut) {
      const ci = new Date(form.checkIn);
      const co = new Date(form.checkOut);
      if (!(co > ci)) {
        setLocalError(T.errors.checkoutAfter);
        setStepIndex(2);
        return;
      }
    }
    await onSubmit(form);
  }

  function startVoice() {
    setLocalError("");
    const SR = getSpeechRecognition();
    if (!SR) {
      setLocalError(T.errors.voiceUnsupported);
      return;
    }

    try {
      if (recRef.current) {
        try {
          recRef.current.stop();
        } catch {}
      }

      const rec = new SR();
      recRef.current = rec;

      rec.continuous = false;
      rec.interimResults = false;

      // ✅ language-aware recognition
      rec.lang = L === "fr" ? "fr-FR" : "en-US";

      setListening(true);

      rec.onresult = (event) => {
        try {
          const transcript = event?.results?.[0]?.[0]?.transcript ?? "";
          const clean = String(transcript).trim();

          if (!clean) {
            setLocalError(T.errors.didntCatch);
            return;
          }

          if (step.kind === "number") {
            const n = spokenToNumber(clean);
            if (n == null) {
              setLocalError(T.errors.sayNumber);
              return;
            }
            const val = clamp(n, step.min ?? 0, step.max ?? 9999);
            setField(step.key, val);
            setTimeout(() => next(), 150);
            return;
          }

          // For date/time keep UI selection ideal; still accept spoken raw text
          setField(step.key, clean);
          setTimeout(() => next(), 150);
        } catch (e) {
          console.error("Voice result error:", e);
          setLocalError(T.errors.voiceFailed);
        }
      };

      rec.onerror = (e) => {
        console.error("Voice error:", e);
        setLocalError(T.errors.voiceFailed);
        setListening(false);
      };

      rec.onend = () => setListening(false);

      rec.start();
    } catch (e) {
      console.error("Voice start failed:", e);
      setListening(false);
      setLocalError(T.errors.voiceFailed);
    }
  }

  const stepTitle = isHotel ? T.hotelTitle : T.taxiTitle;
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;
  const value = form[step.key];

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/55 dark:bg-white/[0.06] backdrop-blur p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-black/10 dark:bg-white/10">
            {stepTitle}
          </span>
          <span className="text-xs text-zinc-700 dark:text-zinc-300/80">
            {T.stepOf(stepIndex + 1, totalSteps)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startVoice}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition disabled:opacity-60"
            disabled={listening || submitting}
            title={T.answerByVoice}
          >
            {listening ? T.listening : T.answerByVoice}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-4 py-2 text-sm font-semibold hover:bg-white dark:hover:bg-white/[0.10] transition"
            disabled={submitting}
          >
            {T.cancel}
          </button>
        </div>
      </div>

      <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {step.label}
      </div>

      {step.placeholder && (
        <div className="text-sm text-zinc-700 dark:text-zinc-300/80 mt-1">
          {step.placeholder}
        </div>
      )}

      {(localError || submitError) && (
        <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <div className="text-red-100">{localError || submitError}</div>

          {!localError && submitError && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition"
                disabled={submitting}
              >
                {L === "fr" ? "Réessayer 🔁" : "Retry booking 🔁"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        {step.kind === "text" && (
          <input
            ref={inputRef}
            className="flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
            value={String(value ?? "")}
            onChange={(e) => setField(step.key, e.target.value)}
            placeholder={step.placeholder || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isLast) confirm();
                else next();
              }
            }}
            disabled={submitting}
          />
        )}

        {step.kind === "date" && (
          <input
            ref={inputRef}
            type="date"
            className="flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
            value={String(value ?? "")}
            onChange={(e) => setField(step.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isLast) confirm();
                else next();
              }
            }}
            disabled={submitting}
          />
        )}

        {step.kind === "time" && (
          <input
            ref={inputRef}
            type="time"
            className="flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
            value={String(value ?? "")}
            onChange={(e) => setField(step.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isLast) confirm();
                else next();
              }
            }}
            disabled={submitting}
          />
        )}

        {step.kind === "number" && (
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              className="h-11 w-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-zinc-900 dark:text-zinc-50 font-bold"
              onClick={() =>
                setField(step.key, clamp(Number(value) - 1, step.min ?? 0, step.max ?? 9999))
              }
              disabled={submitting}
              aria-label={L === "fr" ? "Diminuer" : "Decrease"}
            >
              −
            </button>

            <input
              ref={inputRef}
              type="number"
              className="flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 backdrop-blur text-zinc-900 dark:text-zinc-50"
              value={String(value ?? "")}
              min={step.min}
              max={step.max}
              onChange={(e) => setField(step.key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (isLast) confirm();
                  else next();
                }
              }}
              disabled={submitting}
            />

            <button
              type="button"
              className="h-11 w-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-zinc-900 dark:text-zinc-50 font-bold"
              onClick={() =>
                setField(step.key, clamp(Number(value) + 1, step.min ?? 0, step.max ?? 9999))
              }
              disabled={submitting}
              aria-label={L === "fr" ? "Augmenter" : "Increase"}
            >
              +
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={back}
            className="rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10] transition disabled:opacity-50"
            disabled={stepIndex === 0 || submitting}
          >
            {T.back}
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={next}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition px-5 py-3 font-semibold text-white shadow disabled:opacity-50"
              disabled={submitting}
            >
              {T.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-95 transition px-5 py-3 font-semibold text-white shadow disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? T.confirming : T.confirmBooking}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}