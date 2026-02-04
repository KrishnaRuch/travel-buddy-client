import React from "react";

export default function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="p-5 sm:p-6 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300/80">
              {subtitle}
            </p>
          )}
        </div>
        {right ? <div>{right}</div> : null}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}