import React, { useMemo, useState } from "react";

const DEFAULT_PREFS = [
  "Beachfront / sea view",
  "Near Grand Baie",
  "Near Flic en Flac",
  "Near Le Morne",
  "Near Port Louis",
  "Breakfast included",
  "Family-friendly",
  "Couple / romantic",
  "Business travel",
  "Swimming pool",
  "Spa / wellness",
  "Gym / fitness",
  "Free Wi-Fi",
  "Airport transfer",
  "Quiet area",
  "Budget-friendly",
  "Luxury stay"
];

export default function PreferencesModal({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = new Set(value);

  const prefs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_PREFS;
    return DEFAULT_PREFS.filter((p) => p.toLowerCase().includes(q));
  }, [query]);

  function toggle(pref) {
    const next = new Set(selected);
    if (next.has(pref)) next.delete(pref);
    else next.add(pref);
    onChange(Array.from(next));
  }

  function clearAll() {
    onChange([]);
  }

  function selectAllVisible() {
    const next = new Set(selected);
    prefs.forEach((p) => next.add(p));
    onChange(Array.from(next));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Stay preferences
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-300/75">
            Helps Travel Buddy tailor recommendations
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition"
        >
          Choose preferences ✨
        </button>
      </div>

      {/* Selected chips */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.slice(0, 6).map((p) => (
            <span
              key={p}
              className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-3 py-1 text-xs text-zinc-900 dark:text-zinc-50"
            >
              {p}
            </span>
          ))}
          {value.length > 6 && (
            <span className="text-xs text-zinc-600 dark:text-zinc-300/80">
              +{value.length - 6} more
            </span>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-rose-600 dark:text-rose-300 hover:opacity-90"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="text-xs text-zinc-600 dark:text-zinc-300/80">
          No preferences selected yet.
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Select preferences
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300/80">
                    Choose what matters most for your stay in Mauritius
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10] transition"
                >
                  Close ✕
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div className="flex-1">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search preferences…"
                      className="w-full rounded-2xl bg-white/70 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 py-3 outline-none focus:border-indigo-500/70 text-zinc-900 dark:text-zinc-50"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:opacity-90 transition"
                    >
                      Select visible
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10] transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 max-h-[52vh] overflow-auto pr-1">
                  {prefs.map((p) => {
                    const on = selected.has(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => toggle(p)}
                        className={[
                          "text-left rounded-2xl border px-4 py-3 transition",
                          on
                            ? "border-emerald-500/60 bg-emerald-500/10 text-zinc-900 dark:text-zinc-50"
                            : "border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] text-zinc-900 dark:text-zinc-50 hover:bg-white dark:hover:bg-white/[0.10]"
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold">{p}</div>
                          <div className="text-lg">{on ? "✓" : ""}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300/80">
                    Selected: <b>{value.length}</b>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white px-5 py-3 text-sm font-semibold shadow hover:opacity-95 transition"
                  >
                    Save preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}