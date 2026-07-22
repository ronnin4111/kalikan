"use client";

import { Mail, Phone, User, Fish } from "lucide-react";

/**
 * Komponen informasi pengembang aplikasi Kalikan.
 * Tampilkan di footer dengan kontak: email, WhatsApp, nama developer.
 */
export function DeveloperInfo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";

  const cardClass = isDark
    ? "border-white/10 bg-white/5 text-slate-200"
    : "border-border/60 bg-muted/30 text-foreground";

  const labelClass = isDark ? "text-slate-400" : "text-muted-foreground";
  const valueClass = isDark ? "text-white" : "text-foreground";
  const linkClass = isDark
    ? "text-cyan-300 hover:text-cyan-200"
    : "text-emerald-700 hover:text-emerald-600 dark:text-emerald-400";

  return (
    <div className={`rounded-lg border p-3 ${cardClass}`}>
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md ${
            isDark
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          }`}
        >
          <Fish className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold">Informasi Pengembang</p>
          <p className={`text-[10px] ${labelClass}`}>
            Kalikan · Kalkulator Ikan
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <User className={`h-3.5 w-3.5 shrink-0 ${labelClass}`} />
          <span className={`${labelClass} w-16`}>Developer</span>
          <span className={`font-semibold ${valueClass}`}>ronifisheries</span>
        </div>
        <a
          href="mailto:roniirama@gmail.com"
          className={`flex items-center gap-2 transition-colors ${linkClass}`}
        >
          <Mail className={`h-3.5 w-3.5 shrink-0 ${labelClass}`} />
          <span className={`w-16 ${labelClass}`}>Email</span>
          <span className="font-medium underline-offset-2 hover:underline">
            roniirama@gmail.com
          </span>
        </a>
        <a
          href="https://wa.me/6281256400033"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 transition-colors ${linkClass}`}
        >
          <Phone className={`h-3.5 w-3.5 shrink-0 ${labelClass}`} />
          <span className={`w-16 ${labelClass}`}>WhatsApp</span>
          <span className="font-medium underline-offset-2 hover:underline">
            081256400033
          </span>
        </a>
      </div>
    </div>
  );
}
