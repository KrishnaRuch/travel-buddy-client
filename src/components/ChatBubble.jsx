import React from "react";

export default function ChatBubble({
  role,
  text,
  actions = [],
  username = "You",
  lang = "en"
}) {
  const isBot = role === "bot";
  const isFr = lang === "fr";

  return (
    <div className={`flex gap-3 ${isBot ? "items-start" : "items-start justify-end"}`}>
      {isBot && (
        <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-semibold shadow">
          TB
        </div>
      )}

      <div className={`max-w-[78%] ${isBot ? "" : "text-right"}`}>
        <div
          className={[
            "rounded-3xl px-4 py-3 border shadow-sm",
            isBot
              ? "bg-white/75 dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-50"
              : "bg-gradient-to-br from-indigo-600 to-violet-600 border-white/10 text-white"
          ].join(" ")}
        >
          <div className="text-xs opacity-70 mb-1">{isBot ? "Travel Buddy" : username}</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
        </div>

        {isBot && actions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((a, idx) => (
              <button
                key={idx}
                onClick={a.onClick}
                className="rounded-full px-3 py-1.5 text-xs font-medium border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.10] text-zinc-900 dark:text-zinc-50 transition"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Optional: tiny hint for language (no UI clutter). Keep disabled by default. */}
        {false && isBot && (
          <div className="mt-1 text-[10px] opacity-60">{isFr ? "FR" : "EN"}</div>
        )}
      </div>

      {!isBot && (
        <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-200 dark:bg-white/[0.10] border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-semibold">
          {String(username || "U").slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}