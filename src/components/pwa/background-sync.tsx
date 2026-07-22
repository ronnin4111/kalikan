"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "kalikan-master-data-v1";
const STORAGE_TS_KEY = "kalikan-master-data-ts";
const SYNC_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 hours

/**
 * BackgroundSync — sinkronisasi master data (ikan & sistem) ke localStorage
 * saat aplikasi online. Memungkinkan aplikasi bekerja offline dengan
 * data terbaru tanpa harus fetch saat offline.
 *
 * Strategi:
 * - Pada load pertama, fetch master data dari /api dan simpan ke localStorage
 * - Setiap 24 jam (atau saat online event), cek apakah data perlu di-refresh
 * - Pada Service Worker message "SYNC_MASTER", trigger sync ulang
 */
export function BackgroundSync() {
  const lastSync = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip di SSR
    const stored = localStorage.getItem(STORAGE_TS_KEY);
    if (stored) {
      lastSync.current = Number(stored);
    }

    const syncMaster = async () => {
      if (!navigator.onLine) return;
      const now = Date.now();
      if (now - lastSync.current < SYNC_INTERVAL_MS) {
        // Belum waktunya sync
        return;
      }
      try {
        const res = await fetch("/api", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(STORAGE_TS_KEY, String(now));
        lastSync.current = now;
        console.log("[BackgroundSync] Master data synced at", new Date(now).toISOString());
      } catch (err) {
        // Silent fail — app still works with bundled data
        console.warn("[BackgroundSync] Sync failed (will retry):", err);
      }
    };

    // Initial sync (delayed to not block first paint)
    const initialTimer = window.setTimeout(syncMaster, 2000);

    // Listen online events
    window.addEventListener("online", syncMaster);

    // Listen for SW message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_MASTER") {
        syncMaster();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    // Periodic sync attempt every 30 min (browser will check the timestamp gate)
    const interval = window.setInterval(syncMaster, 30 * 60 * 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener("online", syncMaster);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
