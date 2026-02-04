import React from "react";

export default function TypingIndicator({ lang = "en" }) {
  const typingWord = lang === "fr" ? "écrit" : "typing";

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-semibold shadow">
        TB
      </div>

      <div className="rounded-3xl px-4 py-3 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur text-zinc-900 dark:text-zinc-50 shadow-sm">
        <div className="text-xs opacity-70 mb-1">Travel Buddy</div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-200/80">
            {typingWord}
          </span>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-300/70 animate-bounce [animation-delay:-0.25s]" />
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-300/70 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-300/70 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}