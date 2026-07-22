"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Fish,
  TrendingUp,
  Droplets,
  Wheat,
  Beaker,
  Sparkles,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Box,
} from "lucide-react";
import {
  type FishSpecies,
  type SystemInfo,
  type PondShape,
  weightToLength,
  safeRound,
} from "@/lib/fish-data";
import { ProfitCalculator } from "@/components/profit-calculator";
import { WaterQualityForm } from "@/components/water-quality-form";
import { HarvestCalendar } from "@/components/harvest-calendar";
import { GrowthChart } from "@/components/growth-chart";
import { WeeklyFeedTable } from "@/components/weekly-feed-table";
import { ShareButtons } from "@/components/share-buttons";
import { SaveScenarioButton } from "@/components/save-scenario-button";

export interface CalcResultData {
  area: number;
  volume: number | null;
  capacityUnit: "m²" | "m³";
  shape: PondShape;
  dimensions: string;
  fish: FishSpecies;
  system: string;
  densityRange: [number, number];
  densityUsed: number;
  seedCount: number;
  seedCountMin: number;
  seedCountMax: number;
  seedSizeGram: number;
  harvestSizeGram: number;
  srPercent: number;
  fcr: number;
  survivalCount: number;
  initialBiomassKg: number;
  harvestBiomassKg: number;
  totalFeedKg: number;
  feedKgPerDay: number;
  cycleDays: number;
  proteinPercent: number;
  proteinRangeGrower: [number, number];
  proteinRangeStarter: [number, number];
  proteinWarning: boolean;
  proteinWarningMessage?: string;
  totalProteinKg: number;
  proteinKgPerDay: number;
  proteinGramPerFishPerDay: number;
  starterFeedKg: number;
  growerFeedKg: number;
  starterDays: number;
  growerDays: number;
  warning: boolean;
  warningMessage?: string;
  growthRateUsed: number;
  growthRateRange: [number, number];
  expectedDaysRange: [number, number];
  durationWarning: boolean;
  durationWarningMessage?: string;
  depthUsed: number;
  depthRange: [number, number];
  waterVolumeLiter: number;
  waterExchangeRate: [number, number];
  dailyWaterChangeLiter: number;
  depthWarning: boolean;
  depthWarningMessage?: string;
  biomassGainKg: number;
}

interface ResultTabsProps {
  result: CalcResultData;
  selectedFish: FishSpecies;
  selectedSystem: SystemInfo;
  isKja: boolean;
  fishId: string;
  systemId: string;
  shape: PondShape;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function formatNumber(n: number, decimals = 0): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDec(v: number, decimals: number): string {
  if (!isFinite(v) || isNaN(v)) return "0";
  return formatNumber(v, decimals);
}

export function ResultTabs({
  result,
  selectedFish,
  selectedSystem,
  isKja,
  fishId,
  systemId,
  shape,
  activeTab,
  onTabChange,
}: ResultTabsProps) {

  return (
    <div className="space-y-4">
      {/* ===== Hero Result Card (always visible, above tabs) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md transition-shadow hover:shadow-lg dark:border-emerald-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-emerald-50/90">
                Rekomendasi Padat Tebar
              </CardDescription>
              <Badge className="bg-white/20 text-white hover:bg-white/20">
                {selectedFish.emoji} {selectedFish.name} ·{" "}
                {selectedSystem.name.split(" ")[0]}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] italic text-emerald-50/70">
              {selectedFish.scientificName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-3xl font-bold tracking-tight sm:text-5xl">
                {formatNumber(result.seedCount)}
              </span>
              <span className="pb-1 text-base sm:text-lg text-emerald-50/90">ekor</span>
            </div>
            <p className="mt-1 text-sm text-emerald-50/80">
              Untuk {isKja ? "KJA" : "kolam"} {result.dimensions} (
              {isKja && result.volume !== null
                ? `${formatNumber(result.volume, 2)} m³`
                : `${formatNumber(result.area, 2)} m²`}
              ) dengan padat tebar {result.densityUsed} ekor/{result.capacityUnit}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-50/90">
              <span>
                Rentang aman:{" "}
                <span className="font-semibold">
                  {formatNumber(result.seedCountMin)}–
                  {formatNumber(result.seedCountMax)} ekor
                </span>
              </span>
              <span>
                Estimasi panen:{" "}
                <span
                  className={
                    result.durationWarning ? "font-semibold text-amber-200" : "font-semibold"
                  }
                >
                  {formatNumber(result.cycleDays)} hari
                </span>
                <span className="ml-1 text-emerald-50/70">
                  (standar {result.expectedDaysRange[0]}-{result.expectedDaysRange[1]} hari)
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== Warnings (always visible) ===== */}
      <div className="space-y-2">
        {result.warning && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">Padat Tebar Tidak Optimal</AlertTitle>
            <AlertDescription className="text-xs">{result.warningMessage}</AlertDescription>
          </Alert>
        )}
        {result.durationWarning && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <Clock className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">Estimasi Durasi di Luar Standar</AlertTitle>
            <AlertDescription className="text-xs">{result.durationWarningMessage}</AlertDescription>
          </Alert>
        )}
        {result.depthWarning && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <Droplets className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">Kedalaman Air Tidak Ideal</AlertTitle>
            <AlertDescription className="text-xs">{result.depthWarningMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* ===== Action buttons (Save + Share) ===== */}
      <div className="flex flex-wrap items-center gap-2">
        <SaveScenarioButton
          result={result as any}
          fishId={fishId}
          systemId={systemId as any}
          shape={shape}
          compact
        />
        <ShareButtons
          result={result as any}
          fish={selectedFish}
          systemName={selectedSystem.name}
        />
      </div>

      {/* ===== Main Tabs ===== */}
      {/* min-w-0 + overflow-hidden ensures the Tabs container cannot be widened
          by its inner content (e.g. Pakan tab's horizontal-scrollable tables). */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full min-w-0 overflow-hidden">
        {/* === Tab: Ringkasan === */}
        <TabsContent value="summary" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Ringkasan Hasil
                </CardTitle>
                <CardDescription className="text-xs">
                  Rangkuman parameter & hasil utama untuk budidaya {selectedFish.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <Row label="Bentuk kolam" value={result.shape === "rectangular" ? "Persegi / Persegi panjang" : "Bulat"} />
                <Row label="Dimensi" value={result.dimensions} />
                <Row label="Luas permukaan" value={`${fmtDec(result.area, 2)} m²`} />
                <Row label="Kedalaman air" value={`${fmtDec(result.depthUsed, 2)} m (ideal ${result.depthRange[0]}-${result.depthRange[1]} m)`} />
                {result.volume !== null && (
                  <Row label="Volume air total" value={`${fmtDec(result.volume, 2)} m³ (${formatNumber(result.waterVolumeLiter, 0)} L)`} highlight />
                )}
                {!isKja && (
                  <Row label="Penggantian air/hari" value={`${formatNumber(result.dailyWaterChangeLiter, 0)} L (${result.waterExchangeRate[0]}-${result.waterExchangeRate[1]}%)`} />
                )}
                <Separator />
                <Row label="Jenis ikan" value={`${result.fish.emoji} ${result.fish.name}`} />
                <Row label="Nama ilmiah" value={result.fish.scientificName} />
                <Row label="Sistem budidaya" value={selectedSystem.name} />
                <Row label="Padat tebar" value={`${result.densityUsed} ekor/${result.capacityUnit} (rekomendasi ${result.densityRange[0]}–${result.densityRange[1]})`} />
                <Separator />
                <Row label="Total benih ditebar" value={`${formatNumber(result.seedCount)} ekor`} />
                <Row label="Ukuran benih" value={`${fmtDec(result.seedSizeGram, result.seedSizeGram < 1 ? 3 : 1)} g (≈ ${fmtDec(weightToLength(result.seedSizeGram, result.fish), 1)} cm)`} />
                <Row label="Target panen" value={`${fmtDec(result.harvestSizeGram, 0)} g (≈ ${fmtDec(weightToLength(result.harvestSizeGram, result.fish), 1)} cm)`} />
                <Row label="Estimasi ikan hidup" value={`${formatNumber(result.survivalCount)} ekor`} />
                <Row label="Estimasi durasi" value={`${formatNumber(result.cycleDays)} hari`} highlight />
                <Row label="Standar durasi (KKP)" value={`${result.expectedDaysRange[0]}-${result.expectedDaysRange[1]} hari`} />
                <Row label="SGR (laju pertumbuhan)" value={`${result.growthRateRange[0]}-${result.growthRateRange[1]}% / hari`} />
                <Row label="SGR yang dipakai" value={`${fmtDec(result.growthRateUsed, 2)}% / hari`} />
                <Separator />
                <Row label="Biomassa awal" value={`${fmtDec(result.initialBiomassKg, 1)} kg`} />
                <Row label="Biomassa panen" value={`${fmtDec(result.harvestBiomassKg, 1)} kg`} highlight />
                <Row label="Pertambahan biomassa" value={`${fmtDec(result.biomassGainKg, 1)} kg`} />
                <Row label="Total pakan" value={`${fmtDec(result.totalFeedKg, 1)} kg (FCR ${result.fcr})`} highlight />
                <Row label="Pakan/hari (rata-rata)" value={`${fmtDec(result.feedKgPerDay, 2)} kg`} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Info ikan & sistem */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/60 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{result.fish.emoji}</span>
                  Tentang {result.fish.name}
                </CardTitle>
                <p className="text-[11px] italic text-muted-foreground">
                  {result.fish.scientificName}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{result.fish.description}</p>
                <div className="space-y-1.5">
                  {result.fish.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-emerald-600" />
                  {selectedSystem.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{selectedSystem.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSystem.pros.map((pro, i) => (
                    <Badge key={i} variant="outline" className="text-[11px] font-normal">{pro}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === Tab: Produksi === */}
        <TabsContent value="production" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard icon={<Fish className="h-5 w-5" />} label="Ikan Panen (SR)" value={`${formatNumber(result.survivalCount)} ekor`} sublabel={`Dari ${formatNumber(result.seedCount)} benih · SR ${result.srPercent}%`} tone="emerald" />
              <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Biomassa Panen" value={`${fmtDec(result.harvestBiomassKg, 1)} kg`} sublabel={`Target @ ${result.harvestSizeGram} g/ekor (≈ ${fmtDec(weightToLength(result.harvestSizeGram, result.fish), 1)} cm)`} tone="teal" />
              <StatCard icon={<Droplets className="h-5 w-5" />} label="Biomassa Awal" value={`${fmtDec(result.initialBiomassKg, 1)} kg`} sublabel={`Benih @ ${fmtDec(result.seedSizeGram, result.seedSizeGram < 1 ? 3 : 1)} g (≈ ${fmtDec(weightToLength(result.seedSizeGram, result.fish), 1)} cm) × ${formatNumber(result.seedCount)} ekor`} tone="sky" />
              <StatCard icon={<Sparkles className="h-5 w-5" />} label="Pertambahan Biomassa" value={`${fmtDec(Math.max(0, result.harvestBiomassKg - result.initialBiomassKg), 1)} kg`} sublabel="Selama siklus budidaya" tone="amber" />
            </div>

            <Card className="border-border/60 mt-4 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rincian Produksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <Row label="Bentuk kolam" value={result.shape === "rectangular" ? "Persegi / Persegi panjang" : "Bulat"} />
                <Row label="Dimensi" value={result.dimensions} />
                <Row label="Luas permukaan" value={`${fmtDec(result.area, 2)} m²`} />
                <Row label="Kedalaman air" value={`${fmtDec(result.depthUsed, 2)} m (ideal ${result.depthRange[0]}-${result.depthRange[1]} m)`} />
                {result.volume !== null && (
                  <Row label="Volume air total" value={`${fmtDec(result.volume, 2)} m³ (${formatNumber(result.waterVolumeLiter, 0)} L)`} highlight />
                )}
                {!isKja && (
                  <Row label="Penggantian air/hari" value={`${formatNumber(result.dailyWaterChangeLiter, 0)} L (${result.waterExchangeRate[0]}-${result.waterExchangeRate[1]}%)`} />
                )}
                <Separator />
                <Row label="Jenis ikan" value={`${result.fish.emoji} ${result.fish.name}`} />
                <Row label="Nama ilmiah" value={result.fish.scientificName} />
                <Row label="Sistem budidaya" value={selectedSystem.name} />
                <Row label="Padat tebar" value={`${result.densityUsed} ekor/${result.capacityUnit} (rekomendasi ${result.densityRange[0]}–${result.densityRange[1]})`} />
                <Separator />
                <Row label="Total benih ditebar" value={`${formatNumber(result.seedCount)} ekor`} />
                <Row label="Ukuran benih" value={`${fmtDec(result.seedSizeGram, result.seedSizeGram < 1 ? 3 : 1)} g (≈ ${fmtDec(weightToLength(result.seedSizeGram, result.fish), 1)} cm)`} />
                <Row label="Target panen" value={`${fmtDec(result.harvestSizeGram, 0)} g (≈ ${fmtDec(weightToLength(result.harvestSizeGram, result.fish), 1)} cm)`} />
                <Row label="Estimasi ikan hidup" value={`${formatNumber(result.survivalCount)} ekor`} />
                <Row label="Estimasi durasi budidaya" value={`${formatNumber(result.cycleDays)} hari`} highlight />
                <Row label="Standar durasi (KKP)" value={`${result.expectedDaysRange[0]}-${result.expectedDaysRange[1]} hari`} />
                <Row label="SGR (laju pertumbuhan)" value={`${result.growthRateRange[0]}-${result.growthRateRange[1]}% / hari`} />
                <Row label="SGR yang dipakai" value={`${fmtDec(result.growthRateUsed, 2)}% / hari`} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* === Tab: Pakan === */}
        <TabsContent value="feed" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard icon={<Wheat className="h-5 w-5" />} label="Total Kebutuhan Pakan" value={`${fmtDec(result.totalFeedKg, 1)} kg`} sublabel={`FCR ${result.fcr} · Selama ${formatNumber(result.cycleDays)} hari`} tone="amber" />
              <StatCard icon={<Wheat className="h-5 w-5" />} label="Rata-rata Pakan / Hari" value={`${fmtDec(result.feedKgPerDay, 2)} kg`} sublabel="Distribusi merata sepanjang siklus" tone="teal" />
              <StatCard icon={<Beaker className="h-5 w-5" />} label="Total Protein" value={`${fmtDec(result.totalProteinKg, 1)} kg`} sublabel={`Protein murni dari pakan`} tone="emerald" />
              <StatCard icon={<Beaker className="h-5 w-5" />} label="Protein per Ekor/Hari" value={`${fmtDec(result.proteinGramPerFishPerDay, 2)} g`} sublabel={`Dari ${formatNumber(result.seedCount)} ekor`} tone="sky" />
            </div>

            {result.proteinWarning && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">Kandungan Protein Tidak Optimal</AlertTitle>
                <AlertDescription className="text-xs">{result.proteinWarningMessage}</AlertDescription>
              </Alert>
            )}

            <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 mt-4 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Beaker className="h-4 w-4 text-emerald-600" />
                  Kebutuhan Protein Pakan
                </CardTitle>
                <CardDescription className="text-xs">
                  Berdasarkan kandungan protein {result.proteinPercent}% (grower) & SNI starter {result.proteinRangeStarter[0]}-{result.proteinRangeStarter[1]}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-md bg-sky-50 p-2.5 text-center dark:bg-sky-950/30">
                    <Badge className="mb-1 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">Starter (Hari 1-{result.starterDays})</Badge>
                    <p className="text-sm font-bold">{fmtDec(result.starterFeedKg, 1)} kg</p>
                    <p className="text-[11px] text-muted-foreground">Protein SNI {result.proteinRangeStarter[0]}-{result.proteinRangeStarter[1]}%</p>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-2.5 text-center dark:bg-emerald-950/30">
                    <Badge className="mb-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Grower (Hari {result.starterDays + 1}-{result.starterDays + result.growerDays})</Badge>
                    <p className="text-sm font-bold">{fmtDec(result.growerFeedKg, 1)} kg</p>
                    <p className="text-[11px] text-muted-foreground">Protein user {result.proteinPercent}%</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <Row label="Protein dari fase starter" value={`${fmtDec(result.starterFeedKg * ((result.proteinRangeStarter[0] + result.proteinRangeStarter[1]) / 2) / 100, 1)} kg`} />
                  <Row label="Protein dari fase grower" value={`${fmtDec(result.growerFeedKg * (result.proteinPercent / 100), 1)} kg`} />
                  <Row label="Total protein" value={`${fmtDec(result.totalProteinKg, 1)} kg`} highlight />
                  <Row label="Protein rata-rata / hari" value={`${fmtDec(result.proteinKgPerDay, 3)} kg`} highlight />
                  <Row label="Protein per ekor per hari" value={`${fmtDec(result.proteinGramPerFishPerDay, 2)} gram`} highlight />
                </div>
              </CardContent>
            </Card>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Tips Pemberian Pakan & Protein</AlertTitle>
              <AlertDescription className="text-xs space-y-1">
                <p>• Pemberian pakan tidak merata setiap hari. Awal siklus ~3-5% dari biomassa/hari, menurun menjadi ~1-2% di akhir.</p>
                <p>• Fase starter (30% awal siklus) pakai pakan protein tinggi {result.proteinRangeStarter[0]}-{result.proteinRangeStarter[1]}% untuk pertumbuhan benih.</p>
                <p>• Fase grower (70% akhir siklus) pakai pakan protein {result.proteinRangeGrower[0]}-{result.proteinRangeGrower[1]}% sesuai SNI {result.fish.name}.</p>
                <p>• Cek label kemasan pakan untuk memastikan kandungan protein sesuai standar SNI.</p>
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Growth chart */}
          <GrowthChart
            cycleDays={result.cycleDays}
            seedCount={result.seedCount}
            survivalRate={result.srPercent}
            seedSizeGram={result.seedSizeGram}
            harvestSizeGram={result.harvestSizeGram}
            totalFeedKg={result.totalFeedKg}
            fish={result.fish}
          />

          {/* Weekly feed schedule */}
          <WeeklyFeedTable
            cycleDays={result.cycleDays}
            totalFeedKg={result.totalFeedKg}
            seedCount={result.seedCount}
            seedSizeGram={result.seedSizeGram}
            harvestSizeGram={result.harvestSizeGram}
            fish={result.fish}
          />
        </TabsContent>

        {/* === Tab: Profit === */}
        <TabsContent value="profit" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProfitCalculator
              seedCount={result.seedCount}
              totalFeedKg={result.totalFeedKg}
              harvestBiomassKg={result.harvestBiomassKg}
              fish={result.fish}
            />
          </motion.div>
        </TabsContent>

        {/* === Tab: Kualitas Air === */}
        <TabsContent value="water" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <WaterQualityForm fish={selectedFish} />

            <Card className="border-border/60 mt-4 transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Box className="h-4 w-4 text-emerald-600" />
                  Manajemen Air & Volume
                </CardTitle>
                <CardDescription className="text-xs">
                  Estimasi volume & penggantian air harian berdasarkan sistem budidaya
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Volume air total" value={result.volume !== null ? `${fmtDec(result.volume, 2)} m³ (${formatNumber(result.waterVolumeLiter, 0)} L)` : `${fmtDec(result.area * result.depthUsed, 2)} m³ (≈ ${formatNumber(result.area * result.depthUsed * 1000, 0)} L)`} highlight />
                {!isKja && (
                  <Row label="Penggantian air/hari" value={`${formatNumber(result.dailyWaterChangeLiter, 0)} L (${result.waterExchangeRate[0]}-${result.waterExchangeRate[1]}%)`} />
                )}
                {isKja && (
                  <Row label="Aliran air" value="Mengalir kontinyu (100%+ per hari)" />
                )}
                <Row label="Kedalaman ideal" value={`${result.depthRange[0]}-${result.depthRange[1]} m`} />
                <Row label="Kedalaman saat ini" value={`${fmtDec(result.depthUsed, 2)} m ${result.depthWarning ? "⚠️" : "✓"}`} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* === Tab: Kalender Panen === */}
        <TabsContent value="calendar" className="space-y-4 mt-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <HarvestCalendar
              cycleDays={result.cycleDays}
              starterRatio={0.3}
              growerRatio={0.6}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Sub-komponen ----------

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 text-xs sm:text-sm sm:gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`text-right font-medium break-words min-w-0 ${highlight ? "font-bold text-emerald-700 dark:text-emerald-400" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  tone: "emerald" | "teal" | "sky" | "amber";
}) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  };

  return (
    <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
            {sublabel && (
              <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{sublabel}</p>
            )}
          </div>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
