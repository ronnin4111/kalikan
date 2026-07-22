"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Tampilkan tombol "Install App" ketika PWA bisa di-install (browser support
 * & belum di-install). Simpan state dismiss di localStorage agar tidak nagging.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Cek apakah sudah di-install (standalone mode) — lazy init, hindari setState di effect
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
    );
  });

  useEffect(() => {
    if (installed) return;

    // Cek localStorage untuk dismiss
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Jangan tampilkan apa-apa kalau sudah installed atau tidak ada prompt
  if (installed || !showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-lg border border-emerald-200 bg-white p-3 shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950/90">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Download className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">Install Kalikan</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Pasang aplikasi untuk dipakai offline di kolam/sungai tanpa sinyal.
            </p>
            <div className="mt-2 flex gap-1.5">
              <Button
                size="sm"
                className="h-7 bg-emerald-600 px-2.5 text-[11px] hover:bg-emerald-700"
                onClick={handleInstall}
              >
                <Download className="mr-1 h-3 w-3" />
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={handleDismiss}
              >
                Nanti
              </Button>
            </div>
          </div>
          <button
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted"
            onClick={handleDismiss}
            aria-label="Tutup"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
