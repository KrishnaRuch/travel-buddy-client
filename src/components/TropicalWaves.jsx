import React from "react";

export default function TropicalWaves() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(1200px_circle_at_80%_70%,rgba(16,185,129,0.30),transparent_55%),radial-gradient(900px_circle_at_50%_100%,rgba(59,130,246,0.18),transparent_60%)] dark:bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(1200px_circle_at_80%_70%,rgba(16,185,129,0.22),transparent_55%),radial-gradient(900px_circle_at_50%_100%,rgba(59,130,246,0.14),transparent_60%)]" />

      {/* Subtle wave animation layers */}
      <div className="absolute inset-0 opacity-70 mix-blend-screen">
        <div className="wave wave-a" />
        <div className="wave wave-b" />
        <div className="wave wave-c" />
      </div>

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35 dark:from-black/45 dark:to-black/55" />
    </div>
  );
}