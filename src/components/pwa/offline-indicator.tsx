"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Tampilkan toast kecil di bagian atas layar ketika perangkat offline.
 * Otomatis hilang saat koneksi kembali.
 * Aman digunakan di PWA: muncul di atas konten tanpa mengganggu input.
 */
export function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(true);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => setOnline(navigator.onLine));

    const handleOffline = () => {
      setOnline(false);
      setShowRestored(false);
    };
    const handleOnline = () => {
      setOnline(true);
      setShowRestored(true);
      window.setTimeout(() => setShowRestored(false), 2500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Jangan render apa-apa jika online & tidak ada notifikasi restored
  if (online && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-0 z-[100] -translate-x-1/2 px-4 py-2"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      data-state={online ? "restored" : "offline"}
    >
      {online ? (
        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:text-sm">
          <Wifi className="h-3.5 w-3.5" />
          Koneksi kembali — data tersinkron
        </span>
      ) : (
        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:text-sm">
          <WifiOff className="h-3.5 w-3.5" />
          Mode offline — kalkulator tetap jalan
        </span>
      )}
    </div>
  );
}
