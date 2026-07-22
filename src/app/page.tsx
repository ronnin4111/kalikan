"use client";

import { useState, useMemo } from "react";
import {
  Fish,
  Calculator,
  Ruler,
  Droplets,
  Wheat,
  TrendingUp,
  Info,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Circle,
  Square,
  RotateCcw,
  Sparkles,
  Beaker,
  Box,
  ArrowLeft,
  Clock,
  Menu,
  Wallet,
  Activity,
  CalendarDays,
  Share2,
} from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ReferenceDialog } from "@/components/reference-dialog";
import { DashboardView } from "@/components/dashboard-view";
import { DeveloperInfo } from "@/components/developer-info";

import { HistoryPanel, type HistoryEntry } from "@/components/history-panel";
import { CompareMode } from "@/components/compare-mode";
import { ResultTabs, type CalcResultData } from "@/components/result-tabs";
import { ShareButtons } from "@/components/share-buttons";
import { SaveScenarioButton } from "@/components/save-scenario-button";
import {
  FISH_SPECIES,
  SYSTEMS,
  type PondShape,
  type CultivationSystem,
  type FishSpecies,
  weightToLength,
  calcCycleDays,
  safeRound,
  clamp,
} from "@/lib/fish-data";

// ---------- Tipe hasil perhitungan ----------
interface CalcResult {
  area: number; // luas permukaan (m²) — untuk semua sistem
  volume: number | null; // volume air total (m³) — untuk semua sistem (luas × kedalaman)
  capacityUnit: "m²" | "m³"; // satuan kapasitas padat tebar
  shape: PondShape;
  dimensions: string;
  fish: FishSpecies;
  system: CultivationSystem;
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
  biomassGainKg: number;
  totalFeedKg: number;
  feedKgPerDay: number;
  cycleDays: number;
  // ---- Protein pakan ----
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
  // ---- Durasi budidaya (SGR per ikan) ----
  growthRateUsed: number;
  growthRateRange: [number, number];
  expectedDaysRange: [number, number];
  durationWarning: boolean;
  durationWarningMessage?: string;
  // ---- Volume air & manajemen air ----
  depthUsed: number; // kedalaman air (m)
  depthRange: [number, number]; // range kedalaman ideal per sistem
  waterVolumeLiter: number; // volume air total (liter) = luas × kedalaman × 1000
  waterExchangeRate: [number, number]; // % penggantian air/hari
  dailyWaterChangeLiter: number; // estimasi penggantian air harian (liter)
  depthWarning: boolean;
  depthWarningMessage?: string;
}

// ---------- Hitung luas kolam ----------
function calcArea(shape: PondShape, dims: { length?: number; width?: number; diameter?: number }): number {
  if (shape === "rectangular") {
    const l = dims.length ?? 0;
    const w = dims.width ?? 0;
    return l * w;
  }
  // circular
  const d = dims.diameter ?? 0;
  const r = d / 2;
  return Math.PI * r * r;
}

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Home() {
  // ---------- State input ----------
  const [shape, setShape] = useState<PondShape>("rectangular");
  const [length, setLength] = useState<string>("4");
  const [width, setWidth] = useState<string>("3");
  const [diameter, setDiameter] = useState<string>("3");
  const [depth, setDepth] = useState<string>("1.25"); // kedalaman air (meter)
  const [fishId, setFishId] = useState<string>("lele");
  const [systemId, setSystemId] = useState<CultivationSystem>("biofloc");

  const selectedFish = FISH_SPECIES.find((f) => f.id === fishId) ?? FISH_SPECIES[0];
  const selectedSystem = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];
  const isKja = systemId === "kja_river";
  // Untuk KJA pakai densityKja (ekor/m³), sistem lain pakai density[system] (ekor/m²)
  const densityRange = isKja
    ? selectedFish.densityKja
    : selectedFish.density[systemId];
  const densityMid = Math.round((densityRange[0] + densityRange[1]) / 2);
  const capacityUnit = isKja ? "m³" : "m²";

  const [density, setDensity] = useState<number>(densityMid);

  // Update density default saat ikan/sistem berubah
  const handleFishChange = (id: string) => {
    setFishId(id);
    const fish = FISH_SPECIES.find((f) => f.id === id)!;
    const range = isKja ? fish.densityKja : fish.density[systemId];
    setDensity(Math.round((range[0] + range[1]) / 2));
  };
  const handleSystemChange = (id: CultivationSystem) => {
    setSystemId(id);
    const newSystem = SYSTEMS.find((s) => s.id === id) ?? SYSTEMS[0];
    const newIsKja = id === "kja_river";
    const range = newIsKja
      ? selectedFish.densityKja
      : selectedFish.density[id];
    setDensity(Math.round((range[0] + range[1]) / 2));
    // Auto-set kedalaman ke mid range ideal per sistem
    const newDepth = (newSystem.depthRange[0] + newSystem.depthRange[1]) / 2;
    setDepth(newDepth.toString());
    // Auto-switch ke bentuk persegi jika KJA (jaring kotak)
    if (newIsKja) {
      setShape("rectangular");
    }
  };

  // Parameter produksi (slider default di tengah range)
  // Adaptif: bulatkan sesuai skala (untuk benih < 1g pakai 3 desimal)
  const initialSeedSize = (() => {
    const mid = (selectedFish.seedSizeRange[0] + selectedFish.seedSizeRange[1]) / 2;
    if (mid < 1) return Math.round(mid * 1000) / 1000;
    if (mid < 10) return Math.round(mid * 10) / 10;
    return Math.round(mid * 2) / 2;
  })();
  const [seedSize, setSeedSize] = useState<number>(initialSeedSize);
  const [harvestSize, setHarvestSize] = useState<number>(
    Math.round((selectedFish.harvestSizeRange[0] + selectedFish.harvestSizeRange[1]) / 2)
  );
  const [sr, setSr] = useState<number>(
    Math.round((selectedFish.srRange[0] + selectedFish.srRange[1]) / 2)
  );
  const [fcr, setFcr] = useState<number>(
    Math.round(((selectedFish.fcrRange[0] + selectedFish.fcrRange[1]) / 2) * 100) / 100
  );
  // Kandungan protein pakan (% as-fed) untuk fase pembesaran (grower)
  const [proteinPercent, setProteinPercent] = useState<number>(
    Math.round((selectedFish.proteinRange.grower[0] + selectedFish.proteinRange.grower[1]) / 2)
  );

  // Sinkronisasi default parameter saat ganti ikan
  const handleFishChangeSync = (id: string) => {
    handleFishChange(id);
    const fish = FISH_SPECIES.find((f) => f.id === id)!;
    const seedMid = (fish.seedSizeRange[0] + fish.seedSizeRange[1]) / 2;
    // Adaptif: untuk benih < 1g (PL udang), pakai 3 desimal.
    // Untuk 1g ≤ x < 10g, pakai 1 desimal. Untuk ≥ 10g, bulatkan ke 0.5.
    let roundedSeed: number;
    if (seedMid < 1) {
      roundedSeed = Math.round(seedMid * 1000) / 1000; // 3 desimal
    } else if (seedMid < 10) {
      roundedSeed = Math.round(seedMid * 10) / 10; // 1 desimal
    } else {
      roundedSeed = Math.round(seedMid * 2) / 2; // 0.5 step
    }
    setSeedSize(roundedSeed);
    setHarvestSize(Math.round((fish.harvestSizeRange[0] + fish.harvestSizeRange[1]) / 2));
    setSr(Math.round((fish.srRange[0] + fish.srRange[1]) / 2));
    setFcr(Math.round(((fish.fcrRange[0] + fish.fcrRange[1]) / 2) * 100) / 100);
    setProteinPercent(
      Math.round((fish.proteinRange.grower[0] + fish.proteinRange.grower[1]) / 2)
    );
  };

  // ---------- Perhitungan ----------
  const result: CalcResult | null = useMemo(() => {
    const len = parseFloat(length);
    const wid = parseFloat(width);
    const dia = parseFloat(diameter);
    const dep = parseFloat(depth);

    const dims =
      shape === "rectangular"
        ? { length: len, width: wid }
        : { diameter: dia };

    const area = calcArea(shape, dims);
    if (area <= 0 || isNaN(area)) return null;

    // ============ Volume air & manajemen air (SEMUA sistem) ============
    // Volume air total = luas × kedalaman (m³)
    // Untuk KJA: dipakai juga sebagai kapasitas padat tebar
    const depthRange = selectedSystem.depthRange;
    const waterExchangeRate = selectedSystem.waterExchangeRate;
    const waterVolumeM3 = area * dep; // m³
    const waterVolumeLiter = waterVolumeM3 * 1000; // liter

    // Estimasi penggantian air harian (rata-rata % per hari × volume)
    const avgExchangeRate =
      (waterExchangeRate[0] + waterExchangeRate[1]) / 2;
    const dailyWaterChangeLiter = (waterVolumeLiter * avgExchangeRate) / 100;

    // Warning kedalaman di luar range ideal
    let depthWarning = false;
    let depthWarningMessage: string | undefined;
    if (dep < depthRange[0]) {
      depthWarning = true;
      depthWarningMessage = `Kedalaman ${dep} m terlalu dangkal untuk ${selectedSystem.name} (ideal ${depthRange[0]}-${depthRange[1]} m). Risiko suhu fluktuatif & ikan stres.`;
    } else if (dep > depthRange[1]) {
      depthWarning = true;
      depthWarningMessage = `Kedalaman ${dep} m terlalu dalam untuk ${selectedSystem.name} (ideal ${depthRange[0]}-${depthRange[1]} m). Risiko stratifikasi & lapisan bawah kekurangan oksigen.`;
    }

    // Untuk KJA: kapasitas padat tebar pakai volume (m³)
    // Untuk kolam lain: kapasitas pakai luas (m²) — sesuai standar SNI/KKP
    let capacity: number;
    if (isKja) {
      capacity = waterVolumeM3;
      if (capacity <= 0 || isNaN(capacity)) return null;
    } else {
      capacity = area;
    }

    const seedCount = Math.round(capacity * density);
    const seedCountMin = Math.round(capacity * densityRange[0]);
    const seedCountMax = Math.round(capacity * densityRange[1]);

    const survivalCount = Math.round(seedCount * (sr / 100));
    const initialBiomassKg = (seedCount * seedSize) / 1000;
    const harvestBiomassKg = (survivalCount * harvestSize) / 1000;
    const totalFeedKg = Math.max(0, (harvestBiomassKg - initialBiomassKg) * fcr);

    // ============ Estimasi Durasi Budidaya ============
    // Pakai SGR (Specific Growth Rate) per ikan, bukan fixed 1.5%
    // SGR = (ln(bobot panen) - ln(bobot benih)) / hari × 100
    // → Hari = ln(panen/benih) / ln(1 + SGR/100)
    // Helper calcCycleDays sudah handle NaN/Infinity & clamp ke [30, 540].
    const growthRateRange = selectedFish.growthRate;
    const growthRateUsed =
      (growthRateRange[0] + growthRateRange[1]) / 2; // mid SGR (% per hari)
    const cycleDays = calcCycleDays(seedSize, harvestSize, growthRateUsed);
    const expectedDaysRange = selectedFish.expectedDaysRange;

    // Warning durasi di luar standar budidaya
    let durationWarning = false;
    let durationWarningMessage: string | undefined;
    if (cycleDays < expectedDaysRange[0]) {
      durationWarning = true;
      durationWarningMessage = `Estimasi ${cycleDays} hari lebih cepat dari standar budidaya ${selectedFish.name} (${expectedDaysRange[0]}-${expectedDaysRange[1]} hari). Mungkin target panen terlalu kecil atau SGR terlalu optimis.`;
    } else if (cycleDays > expectedDaysRange[1]) {
      durationWarning = true;
      durationWarningMessage = `Estimasi ${cycleDays} hari lebih lama dari standar budidaya ${selectedFish.name} (${expectedDaysRange[0]}-${expectedDaysRange[1]} hari). Pertumbuhan mungkin terhambat (cek pakan, kualitas air, padat tebar).`;
    }

    // Feed per day (rata-rata, ~3% biomassa/hari di awal hingga ~1% di akhir)
    const feedKgPerDay = totalFeedKg / Math.max(cycleDays, 1);

    // ============ Perhitungan Protein Pakan ============
    // Split fase: 30% awal = starter (protein tinggi SNI), 70% akhir = grower (input user)
    const starterRatio = 0.3;
    const growerRatio = 0.7;
    const starterDays = Math.round(cycleDays * starterRatio);
    const growerDays = Math.max(cycleDays - starterDays, 1);
    const starterFeedKg = totalFeedKg * starterRatio;
    const growerFeedKg = totalFeedKg * growerRatio;

    const proteinRangeStarter = selectedFish.proteinRange.starter;
    const proteinRangeGrower = selectedFish.proteinRange.grower;

    // Starter pakai rata-rata SNI, grower pakai input user
    const starterProteinPercent =
      (proteinRangeStarter[0] + proteinRangeStarter[1]) / 2;
    const starterProteinKg = starterFeedKg * (starterProteinPercent / 100);
    const growerProteinKg = growerFeedKg * (proteinPercent / 100);
    const totalProteinKg = starterProteinKg + growerProteinKg;

    const proteinKgPerDay = totalProteinKg / Math.max(cycleDays, 1);
    const proteinGramPerFishPerDay =
      (proteinKgPerDay * 1000) / Math.max(seedCount, 1);

    // Warning protein di luar rekomendasi SNI grower
    let proteinWarning = false;
    let proteinWarningMessage: string | undefined;
    if (proteinPercent < proteinRangeGrower[0]) {
      proteinWarning = true;
      proteinWarningMessage = `Kandungan protein ${proteinPercent}% di bawah rekomendasi SNI untuk fase pembesaran ${selectedFish.name} (${proteinRangeGrower[0]}-${proteinRangeGrower[1]}%). Pertumbuhan ikan dapat terhambat.`;
    } else if (proteinPercent > proteinRangeGrower[1]) {
      proteinWarning = true;
      proteinWarningMessage = `Kandungan protein ${proteinPercent}% di atas rekomendasi SNI untuk fase pembesaran ${selectedFish.name} (${proteinRangeGrower[0]}-${proteinRangeGrower[1]}%). Pemborosan biaya & risiko pencemaran air dari protein tidak tercerna.`;
    }

    let warning = false;
    let warningMessage: string | undefined;
    if (density > densityRange[1]) {
      warning = true;
      warningMessage = `Padat tebar ${density} ekor/${capacityUnit} melebihi batas atas rekomendasi (${densityRange[1]} ekor/${capacityUnit}). Risiko kematian & pertumbuhan lambat meningkat.`;
    } else if (density < densityRange[0]) {
      warning = true;
      warningMessage = `Padat tebar ${density} ekor/${capacityUnit} di bawah rekomendasi minimum (${densityRange[0]} ekor/${capacityUnit}). Kapasitas ${isKja ? "KJA" : "kolam"} belum optimal.`;
    }

    const dimensions = isKja
      ? `${len} m × ${wid} m × ${dep} m`
      : shape === "rectangular"
        ? `${len} m × ${wid} m`
        : `Ø ${dia} m`;

    return {
      area,
      volume: waterVolumeM3,
      capacityUnit,
      shape,
      dimensions,
      fish: selectedFish,
      system: systemId,
      densityRange,
      densityUsed: density,
      seedCount,
      seedCountMin,
      seedCountMax,
      seedSizeGram: seedSize,
      harvestSizeGram: harvestSize,
      srPercent: sr,
      fcr,
      survivalCount,
      initialBiomassKg,
      harvestBiomassKg,
      biomassGainKg: Math.max(0, harvestBiomassKg - initialBiomassKg),
      totalFeedKg,
      feedKgPerDay,
      cycleDays,
      // Protein
      proteinPercent,
      proteinRangeGrower,
      proteinRangeStarter,
      proteinWarning,
      proteinWarningMessage,
      totalProteinKg,
      proteinKgPerDay,
      proteinGramPerFishPerDay,
      starterFeedKg,
      growerFeedKg,
      starterDays,
      growerDays,
      warning,
      warningMessage,
      // Durasi
      growthRateUsed, // sudah dalam persen untuk display
      growthRateRange,
      expectedDaysRange,
      durationWarning,
      durationWarningMessage,
      // Volume air & manajemen air
      depthUsed: dep,
      depthRange,
      waterVolumeLiter,
      waterExchangeRate,
      dailyWaterChangeLiter,
      depthWarning,
      depthWarningMessage,
    };
  }, [
    shape,
    length,
    width,
    diameter,
    depth,
    density,
    densityRange,
    selectedFish,
    selectedSystem,
    systemId,
    isKja,
    capacityUnit,
    seedSize,
    harvestSize,
    sr,
    fcr,
    proteinPercent,
  ]);

  const handleReset = () => {
    setShape("rectangular");
    setLength("4");
    setWidth("3");
    setDiameter("3");
    setFishId("lele");
    setSystemId("biofloc");
    handleFishChangeSync("lele");
  };

  // ---------- View state: dashboard ↔ calculator ----------
  const [view, setView] = useState<"dashboard" | "calculator">("dashboard");

  // ---------- Mobile menu state ----------
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---------- Tab states ----------
  const [resultTab, setResultTab] = useState("summary");
  const [inputTab, setInputTab] = useState("kolam");

  const handleSelectFishFromDashboard = (fish: FishSpecies) => {
    handleFishChangeSync(fish.id);
    setView("calculator");
    // Scroll ke atas saat masuk calculator
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- Load from history ----------
  const handleLoadHistory = (entry: HistoryEntry) => {
    setFishId(entry.fishId);
    setSystemId(entry.systemId);
    setShape(entry.shape);
    if (entry.shape === "rectangular") {
      // Try to parse dimensions back
      const parts = entry.dimensions.split("×").map((p) => p.trim().replace(/[^\d.]/g, ""));
      if (parts[0]) setLength(parts[0]);
      if (parts[1]) setWidth(parts[1]);
    } else {
      const m = entry.dimensions.match(/Ø\s*([\d.]+)/);
      if (m) setDiameter(m[1]);
    }
    setDensity(entry.densityUsed);
    setSeedSize(entry.seedSizeGram);
    setHarvestSize(entry.harvestSizeGram);
    setSr(entry.srPercent);
    setFcr(entry.fcr);
    setProteinPercent(entry.proteinPercent);
    setView("calculator");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- Render: Dashboard view ----------
  if (view === "dashboard") {
    return <DashboardView onSelectFish={handleSelectFishFromDashboard} />;
  }

  // ---------- Render: Calculator view ----------

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20">
        {/* ===== Header ===== */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
              {/* Left: Logo */}
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm sm:h-9 sm:w-9">
                  <img
                    src="/kalikan-logo.png"
                    alt="Logo Kalikan"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">
                    Kalikan
                  </h1>
                  <p className="hidden text-[10px] text-muted-foreground sm:block">
                    Kalkulator Ikan
                  </p>
                </div>
              </div>

              {/* Right: Desktop nav + Mobile hamburger */}
              <div className="flex shrink-0 items-center gap-1.5">
                {/* Desktop-only buttons */}
                <div className="hidden md:flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 px-2"
                    onClick={handleBackToDashboard}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <HistoryPanel onLoad={handleLoadHistory} />
                  <CompareMode
                    currentFishId={fishId}
                    currentShape={shape}
                    currentLength={parseFloat(length) || undefined}
                    currentWidth={parseFloat(width) || undefined}
                    currentDiameter={parseFloat(diameter) || undefined}
                    currentDepth={parseFloat(depth) || 1.25}
                    currentSeedSize={seedSize}
                    currentHarvestSize={harvestSize}
                    currentSr={sr}
                    currentFcr={fcr}
                  />
                  <ReferenceDialog />
                  <ThemeToggle />
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    v2.0
                  </Badge>
                </div>

                {/* Mobile hamburger */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky Result Tab Nav — Row 2 */}
          <div className="border-t border-border/40 bg-background/80 backdrop-blur">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
              <div className="overflow-x-auto -mx-1 px-1 py-2">
                <div className="flex gap-1 min-w-[560px] sm:min-w-0 sm:justify-center">
                  <button
                    onClick={() => setResultTab("summary")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "summary"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Ringkasan</span>
                    <span className="sm:hidden">Ringkas</span>
                  </button>
                  <button
                    onClick={() => setResultTab("production")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "production"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    Produksi
                  </button>
                  <button
                    onClick={() => setResultTab("feed")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "feed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Wheat className="h-3.5 w-3.5 shrink-0" />
                    Pakan
                  </button>
                  <button
                    onClick={() => setResultTab("profit")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "profit"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Wallet className="h-3.5 w-3.5 shrink-0" />
                    Profit
                  </button>
                  <button
                    onClick={() => setResultTab("water")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "water"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Kualitas Air</span>
                    <span className="sm:hidden">Air</span>
                  </button>
                  <button
                    onClick={() => setResultTab("calendar")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "calendar"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Kalender</span>
                    <span className="sm:hidden">Kal</span>
                  </button>
                  <button
                    onClick={() => setResultTab("share")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      resultTab === "share"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Share2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Bagikan</span>
                    <span className="sm:hidden">Bagikan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== Mobile Sheet Menu ===== */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border/60 px-4 py-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <img src="/kalikan-logo.png" alt="Logo" className="h-full w-full object-cover rounded-lg" />
                </div>
                <span>Kalikan</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 p-3">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  handleBackToDashboard();
                  setMobileMenuOpen(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
              </Button>

              <div className="px-1 py-1.5">
                <HistoryPanel
                  onLoad={(entry: HistoryEntry) => {
                    handleLoadHistory(entry);
                    setMobileMenuOpen(false);
                  }}
                />
              </div>

              <div className="px-1 py-1.5">
                <CompareMode
                  currentFishId={fishId}
                  currentShape={shape}
                  currentLength={parseFloat(length) || undefined}
                  currentWidth={parseFloat(width) || undefined}
                  currentDiameter={parseFloat(diameter) || undefined}
                  currentDepth={parseFloat(depth) || 1.25}
                  currentSeedSize={seedSize}
                  currentHarvestSize={harvestSize}
                  currentSr={sr}
                  currentFcr={fcr}
                />
              </div>

              <div className="px-1 py-1.5">
                <ReferenceDialog />
              </div>

              <Separator className="my-2" />

              <div className="px-1 py-1.5">
                <ThemeToggle />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-muted-foreground"
                onClick={() => {
                  handleReset();
                  setMobileMenuOpen(false);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Reset ke Default
              </Button>

              <Separator className="my-2" />

              <Badge variant="secondary" className="mx-1 gap-1 text-[10px] self-start">
                <Sparkles className="h-3 w-3" /> Versi 2.0
              </Badge>
            </div>
          </SheetContent>
        </Sheet>

        {/* ===== Main content ===== */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {/* Banner ikan terpilih — compact on mobile */}
          <div
            className={`mb-4 overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-r ${selectedFish.accentColor} p-0.5 shadow-md transition-shadow hover:shadow-lg sm:mb-6`}
          >
            <div className="flex items-center gap-2 rounded-[10px] bg-background/95 p-2.5 backdrop-blur sm:gap-3 sm:p-4">
              <div
                className={`relative aspect-square w-10 shrink-0 overflow-hidden rounded-lg sm:w-16 ${selectedFish.accentBg}`}
              >
                <img
                  src={selectedFish.image}
                  alt={`Ikan ${selectedFish.name}`}
                  className="h-full w-full object-contain p-0.5 sm:p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Sedang menghitung untuk
                </p>
                <p className="text-sm font-bold tracking-tight sm:text-lg">
                  {selectedFish.emoji} {selectedFish.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                  {selectedFish.description}
                </p>
              </div>
              <Badge
                className={`hidden bg-gradient-to-r ${selectedFish.accentColor} text-white hover:opacity-90 sm:inline-flex`}
              >
                Atur parameter di bawah
              </Badge>
            </div>
          </div>

          {/* ===== Rekomendasi Padat Tebar — always visible below fish banner ===== */}
          {result && (
            <div className="mb-4 sm:mb-6">
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

              {/* ===== Warnings (always visible) ===== */}
              {(result.warning || result.durationWarning || result.depthWarning) && (
                <div className="mt-3 space-y-2">
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
                      <Waves className="h-4 w-4" />
                      <AlertTitle className="text-sm font-semibold">Kedalaman Air Tidak Ideal</AlertTitle>
                      <AlertDescription className="text-xs">{result.depthWarningMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
            {/* === Kolom Kiri: Input Tabs === */}
            <div className="lg:col-span-2">
              <Tabs value={inputTab} onValueChange={setInputTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="kolam" className="gap-1.5 text-xs">
                    <Ruler className="h-3.5 w-3.5" /> Kolam
                  </TabsTrigger>
                  <TabsTrigger value="ikan" className="gap-1.5 text-xs">
                    <Fish className="h-3.5 w-3.5" /> Ikan & Sistem
                  </TabsTrigger>
                  <TabsTrigger value="parameter" className="gap-1.5 text-xs">
                    <TrendingUp className="h-3.5 w-3.5" /> Parameter
                  </TabsTrigger>
                </TabsList>
              <TabsContent value="kolam" className="mt-3">
                {/* Card 1: Bentuk & Ukuran Kolam */}
                <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Ruler className="h-5 w-5 text-emerald-600" />
                      Ukuran Kolam
                    </CardTitle>
                    <CardDescription>
                      Pilih bentuk & masukkan dimensi kolam Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bentuk kolam */}
                    <div className="space-y-2">
                      <Label>
                        Bentuk {isKja ? "KJA" : "Kolam"}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={shape === "rectangular" ? "default" : "outline"}
                          size="sm"
                          className={`h-auto justify-start gap-2 py-2.5 ${
                            shape === "rectangular"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }`}
                          onClick={() => setShape("rectangular")}
                          disabled={isKja}
                        >
                          <Square className="h-4 w-4" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Persegi</div>
                            <div className="text-[10px] opacity-80">Panjang × Lebar</div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={shape === "circular" ? "default" : "outline"}
                          size="sm"
                          className={`h-auto justify-start gap-2 py-2.5 ${
                            shape === "circular"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }`}
                          onClick={() => setShape("circular")}
                          disabled={isKja}
                        >
                          <Circle className="h-4 w-4" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Bulat</div>
                            <div className="text-[10px] opacity-80">Diameter</div>
                          </div>
                        </Button>
                      </div>
                      {isKja && (
                        <p className="text-[10px] text-muted-foreground">
                          KJA umumnya berbentuk persegi (jaring kotak).
                        </p>
                      )}
                    </div>

                    {/* Input dimensi */}
                    {shape === "rectangular" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="length-lg" className="text-xs">
                            Panjang (m)
                          </Label>
                          <Input
                            id="length-lg"
                            type="number"
                            min="0"
                            step="0.1"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder="4"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="width-lg" className="text-xs">
                            Lebar (m)
                          </Label>
                          <Input
                            id="width-lg"
                            type="number"
                            min="0"
                            step="0.1"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder="3"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label htmlFor="diameter-lg" className="text-xs">
                          Diameter (m)
                        </Label>
                        <Input
                          id="diameter-lg"
                          type="number"
                          min="0"
                          step="0.1"
                          value={diameter}
                          onChange={(e) => setDiameter(e.target.value)}
                          placeholder="3"
                        />
                      </div>
                    )}

                    {/* Input kedalaman untuk SEMUA sistem */}
                    <div className="space-y-1.5">
                      <Label htmlFor="depth-lg" className="flex items-center gap-1 text-xs">
                        Kedalaman Air (m)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Kedalaman air {isKja ? "jaring KJA" : "kolam"}. Ideal untuk{" "}
                              {selectedSystem.name}: {selectedSystem.depthRange[0]}-
                              {selectedSystem.depthRange[1]} m. Volume air = Luas × Kedalaman.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="depth-lg"
                        type="number"
                        min="0"
                        step="0.1"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        placeholder="1"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Rekomendasi {selectedSystem.name}: {selectedSystem.depthRange[0]}-
                        {selectedSystem.depthRange[1]} m
                      </p>
                    </div>

                    {/* Hasil luas / volume air */}
                    {result && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Waves className="h-3.5 w-3.5" />
                            Luas Permukaan
                          </span>
                          <span className="text-sm font-semibold">
                            {formatNumber(result.area, 2)} m²
                          </span>
                        </div>
                        {/* Volume air untuk SEMUA sistem */}
                        {result.volume !== null && (
                          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              <Box className="h-3.5 w-3.5" />
                              Volume Air
                            </span>
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                              {formatNumber(result.volume, 2)} m³
                              <span className="ml-1 text-[10px] font-normal">
                                ({formatNumber(result.waterVolumeLiter, 0)} L)
                              </span>
                            </span>
                          </div>
                        )}
                        {/* Estimasi penggantian air harian */}
                        {!isKja && (
                          <div className="flex items-center justify-between rounded-md bg-sky-50 px-3 py-2 dark:bg-sky-950/30">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300">
                              <Droplets className="h-3.5 w-3.5" />
                              Penggantian Air/Hari
                            </span>
                            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                              {formatNumber(result.dailyWaterChangeLiter, 0)} L
                              <span className="ml-1 text-[10px] font-normal">
                                ({result.waterExchangeRate[0]}-{result.waterExchangeRate[1]}%)
                              </span>
                            </span>
                          </div>
                        )}
                        {isKja && (
                          <div className="rounded-md bg-sky-50 px-3 py-2 dark:bg-sky-950/30">
                            <p className="text-[10px] text-sky-700 dark:text-sky-300">
                              💧 KJA: Air mengalir kontinyu dari arus sungai — tidak perlu penggantian manual.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ikan" className="mt-3">
                {/* Card 2: Jenis Ikan & Sistem */}
                <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Fish className="h-5 w-5 text-emerald-600" />
                      Ikan & Sistem Budidaya
                    </CardTitle>
                    <CardDescription>
                      Pilih komoditas & metode pemeliharaan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Jenis Ikan */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fish-lg" className="text-xs">
                        Jenis Ikan
                      </Label>
                      <Select value={fishId} onValueChange={handleFishChangeSync}>
                        <SelectTrigger id="fish-lg" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FISH_SPECIES.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              <span className="mr-1.5">{f.emoji}</span>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sistem Budidaya */}
                    <div className="space-y-1.5">
                      <Label htmlFor="system-lg" className="text-xs">
                        Sistem Budidaya
                      </Label>
                      <Select
                        value={systemId}
                        onValueChange={(v) =>
                          handleSystemChange(v as CultivationSystem)
                        }
                      >
                        <SelectTrigger id="system-lg" className="w-full">
                          <SelectValue />
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

                    {/* Padat tebar slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-xs">
                          Padat Tebar
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Jumlah benih per {capacityUnit}.{" "}
                                {isKja
                                  ? "KJA berbasis volume (m³). "
                                  : "Kolam berbasis luas (m²). "}
                                Rekomendasi untuk {selectedFish.name} di sistem{" "}
                                {selectedSystem.name.toLowerCase()}:{" "}
                                {densityRange[0]}-{densityRange[1]} ekor/{capacityUnit}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          {density} ekor/{capacityUnit}
                        </Badge>
                      </div>
                      <Slider
                        value={[density]}
                        min={Math.max(5, densityRange[0] - Math.round(densityRange[0] * 0.5))}
                        max={densityRange[1] + Math.round(densityRange[1] * 0.5)}
                        step={5}
                        onValueChange={(v) => setDensity(v[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>
                          Min rekomendasi: {densityRange[0]} ekor/{capacityUnit}
                        </span>
                        <span>
                          Maks rekomendasi: {densityRange[1]} ekor/{capacityUnit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="parameter" className="mt-3">
                {/* Card 3: Parameter Produksi */}
                <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Parameter Produksi
                    </CardTitle>
                    <CardDescription>
                      Atur parameter untuk estimasi hasil panen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Benih awal */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-xs">
                          Ukuran Benih
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Berat rata-rata benih saat ditebar (gram/ekor).
                              Konversi cm berdasarkan rumus length-weight FishBase.</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <span className="text-xs font-semibold">
                          {formatNumber(seedSize, seedSize < 1 ? 3 : seedSize < 10 ? 1 : 0)} gram
                        </span>
                      </div>
                      <Slider
                        value={[seedSize]}
                        min={selectedFish.seedSizeRange[0]}
                        max={selectedFish.seedSizeRange[1]}
                        step={selectedFish.seedSizeRange[1] < 1 ? 0.001 : selectedFish.seedSizeRange[1] < 10 ? 0.1 : 0.5}
                        onValueChange={(v) => setSeedSize(v[0])}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        ≈ {formatNumber(weightToLength(seedSize, selectedFish), 1)} cm panjang total
                        (min {selectedFish.seedSizeRange[0]}g ≈ 5 cm)
                      </p>
                    </div>

                    {/* Target panen */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Target Ukuran Panen</Label>
                        <span className="text-xs font-semibold">
                          {harvestSize} gram
                        </span>
                      </div>
                      <Slider
                        value={[harvestSize]}
                        min={selectedFish.harvestSizeRange[0]}
                        max={selectedFish.harvestSizeRange[1]}
                        step={10}
                        onValueChange={(v) => setHarvestSize(v[0])}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        ≈ {formatNumber(weightToLength(harvestSize, selectedFish), 1)} cm panjang total
                        (maks {selectedFish.harvestSizeRange[1]} g)
                      </p>
                    </div>

                    {/* Survival Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-xs">
                          Survival Rate (SR)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Persentase ikan yang bertahan hidup hingga panen</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <span className="text-xs font-semibold">{sr}%</span>
                      </div>
                      <Slider
                        value={[sr]}
                        min={50}
                        max={100}
                        step={1}
                        onValueChange={(v) => setSr(v[0])}
                      />
                    </div>

                    {/* FCR */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-xs">
                          FCR (Feed Conversion Ratio)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Kg pakan untuk menghasilkan 1 kg daging ikan.
                                Semakin rendah semakin efisien. Rekomendasi untuk{" "}
                                {selectedFish.name}: {selectedFish.fcrRange[0]}-
                                {selectedFish.fcrRange[1]}.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Badge
                          variant="outline"
                          className={
                            fcr < selectedFish.fcrRange[0] ||
                            fcr > selectedFish.fcrRange[1]
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }
                        >
                          {fcr}
                        </Badge>
                      </div>
                      <Slider
                        value={[fcr * 100]}
                        min={80}
                        max={200}
                        step={1}
                        onValueChange={(v) => setFcr(v[0] / 100)}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0.8 (sangat efisien)</span>
                        <span>
                          Rekomendasi {selectedFish.name}:{" "}
                          {selectedFish.fcrRange[0]}-{selectedFish.fcrRange[1]}
                        </span>
                        <span>2.0 (kurang efisien)</span>
                      </div>
                    </div>

                    {/* Kandungan Protein Pakan (Grower) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1 text-xs">
                          Kandungan Protein Pakan
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                % protein pakan untuk fase pembesaran (grower).
                                Rekomendasi SNI untuk {selectedFish.name}:{" "}
                                {selectedFish.proteinRange.grower[0]}-
                                {selectedFish.proteinRange.grower[1]}% (grower),{" "}
                                {selectedFish.proteinRange.starter[0]}-
                                {selectedFish.proteinRange.starter[1]}% (starter
                                benih).
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Badge
                          variant="outline"
                          className={
                            proteinPercent < selectedFish.proteinRange.grower[0] ||
                            proteinPercent > selectedFish.proteinRange.grower[1]
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }
                        >
                          {proteinPercent}%
                        </Badge>
                      </div>
                      <Slider
                        value={[proteinPercent]}
                        min={20}
                        max={45}
                        step={1}
                        onValueChange={(v) => setProteinPercent(v[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>
                          SNI grower: {selectedFish.proteinRange.grower[0]}-
                          {selectedFish.proteinRange.grower[1]}%
                        </span>
                        <span>
                          SNI starter: {selectedFish.proteinRange.starter[0]}-
                          {selectedFish.proteinRange.starter[1]}%
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={handleReset}
                    >
                      <RotateCcw className="mr-1.5 h-3 w-3" />
                      Reset ke Default
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              </Tabs>
            </div>

            {/* === Kolom Kanan: Hasil === */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              {!result ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:h-12 sm:w-12">
                      <Calculator className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-sm font-medium">Masukkan ukuran kolam</p>
                    <p className="text-xs text-muted-foreground">
                      Hasil perhitungan akan tampil di sini
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* === Tabbed Result Section === */}
                  <ResultTabs
                    result={result}
                    selectedFish={selectedFish}
                    selectedSystem={selectedSystem}
                    isKja={isKja}
                    fishId={fishId}
                    systemId={systemId}
                    shape={shape}
                    activeTab={resultTab}
                    onTabChange={setResultTab}
                  />
                </>
              )}
            </div>
          </div>
        </main>

        {/* ===== Footer ===== */}
        <footer className="mt-auto border-t border-border/60 bg-muted/30">
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Fish className="h-4 w-4" />
                  <span>
                    <strong className="font-semibold text-foreground">Kalikan</strong>{" "}
                    · Kalkulator Ikan · Budidaya perikanan Indonesia
                  </span>
                </div>
                <p className="max-w-md text-[11px] text-muted-foreground sm:text-xs">
                  Estimasi berdasarkan standar teknis budidaya. Hasil dapat bervariasi
                  tergantung kondisi lapangan.
                </p>
              </div>
              <div className="max-w-xs">
                <DeveloperInfo variant="light" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

