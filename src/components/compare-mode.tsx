"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitCompareArrows,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  FISH_SPECIES,
  SYSTEMS,
  type FishSpecies,
  type CultivationSystem,
  type PondShape,
  calcArea,
} from "@/lib/fish-data";

interface CompareModeProps {
  currentFishId: string;
  currentShape: PondShape;
  currentLength?: number;
  currentWidth?: number;
  currentDiameter?: number;
  currentDepth: number;
  currentSeedSize: number;
  currentHarvestSize: number;
  currentSr: number;
  currentFcr: number;
}

interface CompareResult {
  area: number;
  volume: number | null;
  capacity: number;
  capacityUnit: string;
  seedCount: number;
  harvestBiomassKg: number;
  totalFeedKg: number;
  cycleDays: number;
  feedKgPerDay: number;
  profitPerKgFish: number; // rough estimate: profit per kg of fish produced
}

function compute(
  fish: FishSpecies,
  systemId: CultivationSystem,
  shape: PondShape,
  dims: { length?: number; width?: number; diameter?: number },
  depth: number,
  seedSize: number,
  harvestSize: number,
  sr: number,
  fcr: number
): CompareResult {
  const area = calcArea(shape, dims);
  const isKja = systemId === "kja_river";
  let capacity: number;
  let volume: number | null = null;
  if (isKja) {
    volume = area * depth;
    capacity = volume;
  } else {
    capacity = area;
  }
  const capacityUnit = isKja ? "m³" : "m²";
  const densityRange = isKja ? fish.densityKja : fish.density[systemId];
  const density = Math.round((densityRange[0] + densityRange[1]) / 2);
  const seedCount = Math.round(capacity * density);
  const survivalCount = Math.round(seedCount * (sr / 100));
  const initialBiomassKg = (seedCount * seedSize) / 1000;
  const harvestBiomassKg = (survivalCount * harvestSize) / 1000;
  const biomassGainKg = Math.max(0, harvestBiomassKg - initialBiomassKg);
  const totalFeedKg = biomassGainKg * fcr;
  const growthRateMid = (fish.growthRate[0] + fish.growthRate[1]) / 2 / 100;
  const cycleDays = Math.round(
    Math.log(harvestSize / seedSize) / Math.log(1 + growthRateMid)
  );
  const feedKgPerDay = totalFeedKg / Math.max(cycleDays, 1);
  // Profit per kg ikan = harga jual - (harga pakan × FCR) - (harga benih × seedSize/harvestSize)
  const avgPrice = (fish.priceRangePerKg[0] + fish.priceRangePerKg[1]) / 2;
  const profitPerKgFish = Math.round(avgPrice - 14000 * fcr);

  return {
    area: Math.round(area * 100) / 100,
    volume: volume !== null ? Math.round(volume * 100) / 100 : null,
    capacity: Math.round(capacity * 100) / 100,
    capacityUnit,
    seedCount,
    harvestBiomassKg: Math.round(harvestBiomassKg * 100) / 100,
    totalFeedKg: Math.round(totalFeedKg * 100) / 100,
    cycleDays,
    feedKgPerDay: Math.round(feedKgPerDay * 100) / 100,
    profitPerKgFish,
  };
}

function formatRp(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function CompareMode({
  currentFishId,
  currentShape,
  currentLength,
  currentWidth,
  currentDiameter,
  currentDepth,
  currentSeedSize,
  currentHarvestSize,
  currentSr,
  currentFcr,
}: CompareModeProps) {
  const [open, setOpen] = useState(false);
  const [compareSystemB, setCompareSystemB] = useState<CultivationSystem>("biofloc");
  const [compareFishB, setCompareFishB] = useState<string>(currentFishId);

  const currentSystemId: CultivationSystem = "biofloc";

  const resultA = useMemo(() => {
    const fish = FISH_SPECIES.find((f) => f.id === currentFishId) ?? FISH_SPECIES[0];
    const dims =
      currentShape === "rectangular"
        ? { length: currentLength, width: currentWidth }
        : { diameter: currentDiameter };
    return compute(
      fish,
      currentSystemId,
      currentShape,
      dims,
      currentDepth,
      currentSeedSize,
      currentHarvestSize,
      currentSr,
      currentFcr
    );
  }, [
    currentFishId,
    currentSystemId,
    currentShape,
    currentLength,
    currentWidth,
    currentDiameter,
    currentDepth,
    currentSeedSize,
    currentHarvestSize,
    currentSr,
    currentFcr,
  ]);

  const resultB = useMemo(() => {
    const fish = FISH_SPECIES.find((f) => f.id === compareFishB) ?? FISH_SPECIES[0];
    const dims =
      currentShape === "rectangular"
        ? { length: currentLength, width: currentWidth }
        : { diameter: currentDiameter };
    return compute(
      fish,
      compareSystemB,
      currentShape,
      dims,
      currentDepth,
      currentSeedSize,
      currentHarvestSize,
      currentSr,
      currentFcr
    );
  }, [
    compareFishB,
    compareSystemB,
    currentShape,
    currentLength,
    currentWidth,
    currentDiameter,
    currentDepth,
    currentSeedSize,
    currentHarvestSize,
    currentSr,
    currentFcr,
  ]);

  // Determine winners
  const winnerSeedCount = resultA.seedCount > resultB.seedCount ? "A" : resultA.seedCount < resultB.seedCount ? "B" : "tie";
  const winnerBiomass = resultA.harvestBiomassKg > resultB.harvestBiomassKg ? "A" : resultA.harvestBiomassKg < resultB.harvestBiomassKg ? "B" : "tie";
  const winnerFeed = resultA.totalFeedKg < resultB.totalFeedKg ? "A" : resultA.totalFeedKg > resultB.totalFeedKg ? "B" : "tie";
  const winnerDuration = resultA.cycleDays < resultB.cycleDays ? "A" : resultA.cycleDays > resultB.cycleDays ? "B" : "tie";
  const winnerProfit = resultA.profitPerKgFish > resultB.profitPerKgFish ? "A" : resultA.profitPerKgFish < resultB.profitPerKgFish ? "B" : "tie";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <GitCompareArrows className="h-4 w-4" />
          <span className="hidden sm:inline">Bandingkan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GitCompareArrows className="h-5 w-5 text-emerald-600" />
            Bandingkan Sistem Budidaya
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Side-by-side comparison of two scenarios using your current pond dimensions.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Selectors */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">A</span>
                Skenario A (Saat ini)
              </p>
              <div className="space-y-1.5 text-xs">
                <p>
                  <span className="text-muted-foreground">Ikan:</span>{" "}
                  <strong>
                    {FISH_SPECIES.find((f) => f.id === currentFishId)?.emoji}{" "}
                    {FISH_SPECIES.find((f) => f.id === currentFishId)?.name}
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Sistem:</span>{" "}
                  <strong>{SYSTEMS.find((s) => s.id === currentSystemId)?.name}</strong>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3 dark:border-sky-900/50 dark:bg-sky-950/20">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] text-white">B</span>
                Skenario B
              </p>
              <div className="space-y-1.5">
                <Select value={compareFishB} onValueChange={setCompareFishB}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pilih ikan" />
                  </SelectTrigger>
                  <SelectContent>
                    {FISH_SPECIES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.emoji} {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={compareSystemB}
                  onValueChange={(v) => setCompareSystemB(v as CultivationSystem)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pilih sistem" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEMS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Perbandingan Metrik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <CompareRow
                label="Kapasitas (luas/volume)"
                valueA={`${formatRp(resultA.capacity)} ${resultA.capacityUnit}`}
                valueB={`${formatRp(resultB.capacity)} ${resultB.capacityUnit}`}
                winner="tie"
                rawA={resultA.capacity}
                rawB={resultB.capacity}
              />
              <CompareRow
                label="Padat Tebar (rekomendasi mid)"
                valueA={`${formatRp(Math.round(resultA.seedCount / Math.max(resultA.capacity, 0.1)))} ekor/${resultA.capacityUnit}`}
                valueB={`${formatRp(Math.round(resultB.seedCount / Math.max(resultB.capacity, 0.1)))} ekor/${resultB.capacityUnit}`}
                winner="tie"
                rawA={resultA.seedCount / Math.max(resultA.capacity, 0.1)}
                rawB={resultB.seedCount / Math.max(resultB.capacity, 0.1)}
              />
              <CompareRow
                label="Jumlah Benih"
                valueA={`${formatRp(resultA.seedCount)} ekor`}
                valueB={`${formatRp(resultB.seedCount)} ekor`}
                winner={winnerSeedCount}
                rawA={resultA.seedCount}
                rawB={resultB.seedCount}
                higherBetter
              />
              <CompareRow
                label="Biomassa Panen"
                valueA={`${formatRp(resultA.harvestBiomassKg)} kg`}
                valueB={`${formatRp(resultB.harvestBiomassKg)} kg`}
                winner={winnerBiomass}
                rawA={resultA.harvestBiomassKg}
                rawB={resultB.harvestBiomassKg}
                higherBetter
              />
              <CompareRow
                label="Total Pakan"
                valueA={`${formatRp(resultA.totalFeedKg)} kg`}
                valueB={`${formatRp(resultB.totalFeedKg)} kg`}
                winner={winnerFeed}
                rawA={resultA.totalFeedKg}
                rawB={resultB.totalFeedKg}
                higherBetter={false}
              />
              <CompareRow
                label="Pakan per Hari"
                valueA={`${formatRp(resultA.feedKgPerDay)} kg`}
                valueB={`${formatRp(resultB.feedKgPerDay)} kg`}
                winner="tie"
                rawA={resultA.feedKgPerDay}
                rawB={resultB.feedKgPerDay}
              />
              <CompareRow
                label="Estimasi Durasi"
                valueA={`${formatRp(resultA.cycleDays)} hari`}
                valueB={`${formatRp(resultB.cycleDays)} hari`}
                winner={winnerDuration}
                rawA={resultA.cycleDays}
                rawB={resultB.cycleDays}
                higherBetter={false}
              />
              <CompareRow
                label="Estimasi Profit/Kg Ikan"
                valueA={`Rp ${formatRp(resultA.profitPerKgFish)}`}
                valueB={`Rp ${formatRp(resultB.profitPerKgFish)}`}
                winner={winnerProfit}
                rawA={resultA.profitPerKgFish}
                rawB={resultB.profitPerKgFish}
                higherBetter
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Ringkasan
              </p>
              <div className="space-y-1.5 text-xs">
                {winnerBiomass !== "tie" && (
                  <p>
                    🏆 <strong>Skenario {winnerBiomass}</strong> menghasilkan biomassa
                    panen lebih besar ({formatRp(winnerBiomass === "A" ? resultA.harvestBiomassKg : resultB.harvestBiomassKg)} kg).
                  </p>
                )}
                {winnerDuration !== "tie" && (
                  <p>
                    ⏱️ <strong>Skenario {winnerDuration}</strong> lebih cepat panen
                    ({formatRp(winnerDuration === "A" ? resultA.cycleDays : resultB.cycleDays)} hari).
                  </p>
                )}
                {winnerProfit !== "tie" && (
                  <p>
                    💰 <strong>Skenario {winnerProfit}</strong> lebih profit per kg ikan
                    (Rp {formatRp(winnerProfit === "A" ? resultA.profitPerKgFish : resultB.profitPerKgFish)}/kg).
                  </p>
                )}
              </div>
              <Separator className="my-3" />
              <p className="text-[10px] text-muted-foreground">
                Catatan: Perbandingan menggunakan padat tebar rata-rata per sistem &
                ikan. Untuk akurasi tertinggi, sesuaikan slider padat tebar manual
                di kalkulator utama.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompareRow({
  label,
  valueA,
  valueB,
  winner,
  rawA,
  rawB,
  higherBetter = true,
}: {
  label: string;
  valueA: string;
  valueB: string;
  winner: "A" | "B" | "tie";
  rawA: number;
  rawB: number;
  higherBetter?: boolean;
}) {
  const aWins = winner === "A";
  const bWins = winner === "B";
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border/40 py-2 last:border-0">
      <div
        className={`rounded-md p-2 text-right ${
          aWins ? "bg-emerald-50 dark:bg-emerald-950/30" : ""
        }`}
      >
        <p className={`font-mono text-xs ${aWins ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
          {valueA}
        </p>
      </div>
      <div className="px-2 text-center">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {aWins && <ArrowRight className="mx-auto h-3 w-3 text-emerald-600 rotate-180" />}
        {bWins && <ArrowRight className="mx-auto h-3 w-3 text-sky-600" />}
      </div>
      <div
        className={`rounded-md p-2 text-left ${
          bWins ? "bg-sky-50 dark:bg-sky-950/30" : ""
        }`}
      >
        <p className={`font-mono text-xs ${bWins ? "font-bold text-sky-700 dark:text-sky-400" : "text-foreground"}`}>
          {valueB}
        </p>
      </div>
    </div>
  );
}
