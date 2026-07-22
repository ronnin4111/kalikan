"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Sprout,
  Wheat,
  Trophy,
  Clock,
  CalendarCheck,
  CalendarHeart,
} from "lucide-react";

interface HarvestCalendarProps {
  cycleDays: number;
  starterRatio: number; // 0-1
  growerRatio: number; // 0-1
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function HarvestCalendar({ cycleDays, starterRatio, growerRatio }: HarvestCalendarProps) {
  const [startDate, setStartDate] = useState<string>(todayStr());

  const dates = useMemo(() => {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    const starterDays = Math.round(cycleDays * starterRatio);
    const growerDays = Math.round(cycleDays * growerRatio);
    const finisherDays = Math.max(0, cycleDays - starterDays - growerDays);

    return {
      start,
      starterStart: start,
      starterEnd: addDays(start, starterDays),
      growerStart: addDays(start, starterDays + 1),
      growerEnd: addDays(start, starterDays + growerDays),
      finisherStart: addDays(start, starterDays + growerDays + 1),
      finisherEnd: addDays(start, cycleDays),
      harvest: addDays(start, cycleDays),
      harvestMinus7: addDays(start, cycleDays - 7),
      harvestMinus30: addDays(start, cycleDays - 30),
    };
  }, [startDate, cycleDays, starterRatio, growerRatio]);

  if (!dates) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Kalender Panen
          </CardTitle>
          <CardDescription className="text-xs">
            Pilih tanggal tebar benih untuk melihat jadwal fase budidaya & tanggal
            panen perkiraan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input tanggal tebar */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="flex items-center gap-1.5 text-xs">
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                Tanggal Tebar Benih
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartDate(todayStr())}
              className="gap-1.5"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Hari ini
            </Button>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-2">
            {/* Tebar benih */}
            <TimelineRow
              icon={<Sprout className="h-4 w-4 text-emerald-600" />}
              label="Tebar Benih"
              date={dates.start}
              phase="Mulai"
              tone="emerald"
            />

            {/* Starter → Grower transition */}
            {dates.starterEnd.getTime() !== dates.growerStart.getTime() && (
              <TimelineRow
                icon={<Wheat className="h-4 w-4 text-sky-600" />}
                label="Starter → Grower"
                date={dates.starterEnd}
                phase={`Hari ke-${Math.round(cycleDays * starterRatio)} · ganti pakan`}
                tone="sky"
                sub="Pakan starter protein tinggi → pakan grower protein sedang"
              />
            )}

            {/* Grower → Finisher (kalau ada) */}
            {dates.finisherDays > 0 && (
              <TimelineRow
                icon={<Wheat className="h-4 w-4 text-amber-600" />}
                label="Grower → Finisher"
                date={dates.growerEnd}
                phase={`Hari ke-${Math.round(cycleDays * (starterRatio + growerRatio))}`}
                tone="amber"
                sub="Kurangi pakan menjelang panen, kualitas daging lebih baik"
              />
            )}

            {/* Reminder H-30 persiapan panen */}
            <TimelineRow
              icon={<Clock className="h-4 w-4 text-orange-600" />}
              label="H-30 Persiapan Panen"
              date={dates.harvestMinus30}
              phase="Mulai siapkan pancing/penjualan"
              tone="orange"
              sub="Hubungi pengepul/pengecer, mulai batasi pakan"
            />

            {/* Reminder H-7 puasa pakan */}
            <TimelineRow
              icon={<CalendarHeart className="h-4 w-4 text-rose-600" />}
              label="H-7 Puasa Pakan"
              date={dates.harvestMinus7}
              phase="Puasa pakan untuk kualitas daging & transport"
              tone="rose"
              sub="Stop pakan 5-7 hari sebelum panen agar perut kosong"
            />

            {/* Panen */}
            <TimelineRow
              icon={<Trophy className="h-4 w-4 text-yellow-600" />}
              label="🎉 Hari Panen"
              date={dates.harvest}
              phase={`Hari ke-${cycleDays} · total siklus ${cycleDays} hari`}
              tone="yellow"
              big
            />
          </div>

          <Separator />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickStat
              label="Durasi Starter"
              value={`${Math.round(cycleDays * starterRatio)} hari`}
              tone="sky"
            />
            <QuickStat
              label="Durasi Grower"
              value={`${Math.round(cycleDays * growerRatio)} hari`}
              tone="emerald"
            />
            {dates.finisherDays > 0 && (
              <QuickStat
                label="Durasi Finisher"
                value={`${dates.finisherDays} hari`}
                tone="amber"
              />
            )}
            <QuickStat
              label="Total Siklus"
              value={`${cycleDays} hari`}
              tone="slate"
            />
          </div>

          <div className="rounded-md bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            <strong className="text-foreground">Catatan:</strong> Estimasi tanggal
            berdasarkan SGR (Specific Growth Rate) rata-rata per ikan. Cuaca,
            kualitas air, dan manajemen dapat memajukan/mundurkan tanggal panen
            ±7-14 hari. Tetap cek bobot ikan secara berkala.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TimelineRow({
  icon,
  label,
  date,
  phase,
  sub,
  tone,
  big,
}: {
  icon: React.ReactNode;
  label: string;
  date: Date;
  phase: string;
  sub?: string;
  tone: "emerald" | "sky" | "amber" | "orange" | "rose" | "yellow";
  big?: boolean;
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30",
    sky: "border-sky-200 bg-sky-50 dark:bg-sky-950/30",
    amber: "border-amber-200 bg-amber-50 dark:bg-amber-950/30",
    orange: "border-orange-200 bg-orange-50 dark:bg-orange-950/30",
    rose: "border-rose-200 bg-rose-50 dark:bg-rose-950/30",
    yellow: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30",
  };
  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 rounded-md border p-2 sm:p-2.5 ${tones[tone]} ${big ? "shadow-md" : ""}`}
    >
      <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md bg-white/60 dark:bg-white/10`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold ${big ? "text-sm sm:text-lg" : ""}`}>
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{sub}</p>
        )}
        <p className="text-[10px] text-muted-foreground">{phase}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-mono font-semibold ${big ? "text-xs sm:text-base" : "text-[11px] sm:text-xs"}`}>
          {formatDate(date)}
        </p>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "sky" | "amber" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300",
  };
  return (
    <div className={`rounded-md p-2 ${tones[tone]}`}>
      <p className="text-[10px] font-medium opacity-80">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
