"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildWeeklyFeedSchedule, type FishSpecies } from "@/lib/fish-data";
import { Wheat, CalendarDays } from "lucide-react";

interface WeeklyFeedTableProps {
  cycleDays: number;
  totalFeedKg: number;
  seedCount: number;
  seedSizeGram: number;
  harvestSizeGram: number;
  fish: FishSpecies;
}

const phaseColors: Record<string, string> = {
  starter: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  grower: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  finisher: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const phaseLabels: Record<string, string> = {
  starter: "Starter",
  grower: "Grower",
  finisher: "Finisher",
};

function formatRp(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export function WeeklyFeedTable({
  cycleDays,
  totalFeedKg,
  seedCount,
  seedSizeGram,
  harvestSizeGram,
  fish,
}: WeeklyFeedTableProps) {
  const weeks = buildWeeklyFeedSchedule({
    cycleDays,
    totalFeedKg,
    seedCount,
    seedSizeGram,
    harvestSizeGram,
  });

  if (weeks.length === 0) return null;

  const totalStarterKg = weeks
    .filter((w) => w.phase === "starter")
    .reduce((s, w) => s + w.feedPerWeekKg, 0);
  const totalGrowerKg = weeks
    .filter((w) => w.phase === "grower")
    .reduce((s, w) => s + w.feedPerWeekKg, 0);
  const totalFinisherKg = weeks
    .filter((w) => w.phase === "finisher")
    .reduce((s, w) => s + w.feedPerWeekKg, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wheat className="h-5 w-5 text-amber-600" />
            Jadwal Pakan Mingguan
          </CardTitle>
          <CardDescription className="text-xs">
            Estimasi kebutuhan pakan per minggu — dihitung dari kurva pertumbuhan & feeding rate yang menurun (5% → 1% biomassa/hari)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary per fase */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="rounded-md bg-sky-50 p-1.5 sm:p-2 text-center dark:bg-sky-950/30">
              <Badge className={`mb-0.5 sm:mb-1 ${phaseColors.starter} text-[10px] sm:text-[11px]`}>Starter</Badge>
              <p className="text-xs sm:text-sm font-bold text-foreground">{formatRp(totalStarterKg)} kg</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Fase benih</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-1.5 sm:p-2 text-center dark:bg-emerald-950/30">
              <Badge className={`mb-0.5 sm:mb-1 ${phaseColors.grower} text-[10px] sm:text-[11px]`}>Grower</Badge>
              <p className="text-xs sm:text-sm font-bold text-foreground">{formatRp(totalGrowerKg)} kg</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Fase pembesaran</p>
            </div>
            <div className="rounded-md bg-amber-50 p-1.5 sm:p-2 text-center dark:bg-amber-950/30">
              <Badge className={`mb-0.5 sm:mb-1 ${phaseColors.finisher} text-[10px] sm:text-[11px]`}>Finisher</Badge>
              <p className="text-xs sm:text-sm font-bold text-foreground">{formatRp(totalFinisherKg)} kg</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Fase akhir</p>
            </div>
          </div>

          {/* Tabel mingguan — scroll vertikal & horizontal untuk mobile */}
          <div className="max-h-[500px] overflow-auto rounded-md border border-border/60">
            <Table className="min-w-[640px]">
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Minggu</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Hari</TableHead>
                  <TableHead className="text-xs text-center whitespace-nowrap">Fase</TableHead>
                  <TableHead className="text-xs text-right whitespace-nowrap">Bobot/Ekor</TableHead>
                  <TableHead className="text-xs text-right whitespace-nowrap">FR %/hari</TableHead>
                  <TableHead className="text-xs text-right whitespace-nowrap">Pakan/hari</TableHead>
                  <TableHead className="text-xs text-right whitespace-nowrap">Pakan/minggu</TableHead>
                  <TableHead className="text-xs text-right whitespace-nowrap">Biomassa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((w) => (
                  <TableRow key={w.week}>
                    <TableCell className="text-xs font-medium whitespace-nowrap">{w.week}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {w.startDay}-{w.endDay}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${phaseColors[w.phase]}`}
                      >
                        {phaseLabels[w.phase]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatRp(w.fishWeightGram)} g
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {w.feedingRate}%
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatRp(w.feedPerDayKg)} kg
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {formatRp(w.feedPerWeekKg)} kg
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono whitespace-nowrap">
                      {formatRp(w.biomassKg)} kg
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">FR (Feeding Rate)</strong> = persentase
              pakan per hari dari biomassa. Awal siklus ikan kecil → FR tinggi (~5%),
              akhir siklus ikan besar → FR rendah (~1%). Fase{" "}
              <strong className="text-foreground">finisher</strong> (10% akhir siklus)
              ditandai untuk persiapan panen — pakan dikurangi agar kualitas daging
              optimal.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
