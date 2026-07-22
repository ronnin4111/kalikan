"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ScrollArea,
} from "@/components/ui/scroll-area";
import {
  History,
  Trash2,
  X,
  Clock,
  Fish as FishIcon,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { FISH_SPECIES, getFishById, getSystemById } from "@/lib/fish-data";

const STORAGE_KEY = "kalikan-history-v1";
const MAX_HISTORY = 10;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fishId: string;
  systemId: string;
  shape: "rectangular" | "circular";
  dimensions: string;
  area: number;
  volume: number | null;
  capacityUnit: string;
  densityUsed: number;
  seedCount: number;
  survivalCount: number;
  harvestBiomassKg: number;
  totalFeedKg: number;
  cycleDays: number;
  seedSizeGram: number;
  harvestSizeGram: number;
  srPercent: number;
  fcr: number;
  proteinPercent: number;
}

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const next = [newEntry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("[history] save failed:", err);
  }
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function formatRp(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID");
}

interface HistoryPanelProps {
  onLoad: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ onLoad }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      queueMicrotask(() => setEntries(stored));
    } catch {}
  }, [open]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast.success("Riwayat dihapus");
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
    toast.success("Semua riwayat dibersihkan");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Riwayat</span>
          {entries.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 text-[9px]">
              {entries.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-emerald-600" />
            Riwayat Hitungan
            <Badge variant="secondary" className="text-[10px]">
              {entries.length}/{MAX_HISTORY}
            </Badge>
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            10 skenario terakhir tersimpan otomatis di perangkat ini
          </p>
        </SheetHeader>

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <Database className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">Belum ada riwayat</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hitung padat tebar & simpan hasilnya — riwayat akan muncul di sini
                otomatis.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="space-y-2 p-3">
                {entries.map((entry) => {
                  const fish = getFishById(entry.fishId);
                  const system = getSystemById(entry.systemId);
                  if (!fish || !system) return null;
                  return (
                    <motion.button
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      type="button"
                      onClick={() => {
                        onLoad(entry);
                        setOpen(false);
                        toast.success(`Skenario ${fish.name} dimuat`);
                      }}
                      className="w-full rounded-md border border-border/60 bg-card p-3 text-left transition-colors hover:border-emerald-300 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold">
                              {fish.emoji} {fish.name}
                            </span>
                            <Badge variant="outline" className="text-[9px]">
                              {system.name.split(" ")[0]}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {entry.dimensions} · {entry.densityUsed} ekor/{entry.capacityUnit}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(entry.id, e)}
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <p className="text-muted-foreground">Benih</p>
                          <p className="font-mono font-medium">
                            {formatRp(entry.seedCount)} ekor
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Panen</p>
                          <p className="font-mono font-medium">
                            {formatRp(entry.harvestBiomassKg)} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pakan</p>
                          <p className="font-mono font-medium">
                            {formatRp(entry.totalFeedKg)} kg
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(entry.timestamp)} · {entry.cycleDays} hari siklus
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="border-t border-border/60 p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="w-full gap-1.5 text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus semua riwayat
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
