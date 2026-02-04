import React, { useEffect } from "react";

export default function Toast({ text, onClose }) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => onClose?.(), 4500);
    return () => clearTimeout(t);
  }, [text, onClose]);

  if (!text) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl px-4 py-3 shadow-xl max-w-[92vw]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
          <div className="text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
            {text}
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}