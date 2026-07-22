"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Truck,
  Package,
  Scale,
  RotateCcw,
  Info,
  Sparkles,
} from "lucide-react";
import { calcProfit, type FishSpecies } from "@/lib/fish-data";

interface ProfitCalculatorProps {
  seedCount: number;
  totalFeedKg: number;
  harvestBiomassKg: number;
  fish: FishSpecies;
}

function formatRp(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function ProfitCalculator({
  seedCount,
  totalFeedKg,
  harvestBiomassKg,
  fish,
}: ProfitCalculatorProps) {
  const [seedCostPerUnit, setSeedCostPerUnit] = useState<number>(
    fish.id === "vannamei" ? 50 : fish.id === "gabus" ? 1500 : fish.id === "baung" ? 1000 : 200
  );
  const [feedCostPerKg, setFeedCostPerKg] = useState<number>(
    fish.id === "vannamei" ? 18000 : fish.id === "gabus" ? 16000 : 12000
  );
  const [sellingPricePerKg, setSellingPricePerKg] = useState<number>(
    Math.round((fish.priceRangePerKg[0] + fish.priceRangePerKg[1]) / 2)
  );
  const [otherCost, setOtherCost] = useState<number>(0);

  const profit = useMemo(
    () =>
      calcProfit({
        seedCount,
        totalFeedKg,
        harvestBiomassKg,
        seedCostPerUnit,
        feedCostPerKg,
        sellingPricePerKg,
        otherCost,
      }),
    [seedCount, totalFeedKg, harvestBiomassKg, seedCostPerUnit, feedCostPerKg, sellingPricePerKg, otherCost]
  );

  const handleReset = () => {
    setOtherCost(0);
    setSeedCostPerUnit(fish.id === "vannamei" ? 50 : fish.id === "gabus" ? 1500 : fish.id === "baung" ? 1000 : 200);
    setFeedCostPerKg(fish.id === "vannamei" ? 18000 : fish.id === "gabus" ? 16000 : 12000);
    setSellingPricePerKg(Math.round((fish.priceRangePerKg[0] + fish.priceRangePerKg[1]) / 2));
  };

  const isProfit = profit.profit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`border-2 shadow-md ${
          isProfit
            ? "border-emerald-200 dark:border-emerald-900"
            : "border-red-200 dark:border-red-900"
        }`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Kalkulator Profit (Rp)
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Per Siklus
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Estimasi modal, omzet, dan laba bersih untuk budidaya {fish.name} dengan
            parameter yang sudah Anda atur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input harga */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="seedCost" className="flex items-center gap-1 text-xs">
                <Package className="h-3 w-3" /> Harga Benih (Rp/ekor)
              </Label>
              <Input
                id="seedCost"
                type="number"
                min="0"
                step="10"
                value={seedCostPerUnit}
                onChange={(e) => setSeedCostPerUnit(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                {formatRp(seedCount)} ekor × {formatRp(seedCostPerUnit)} Rp/ekor
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feedCost" className="flex items-center gap-1 text-xs">
                <Truck className="h-3 w-3" /> Harga Pakan (Rp/kg)
              </Label>
              <Input
                id="feedCost"
                type="number"
                min="0"
                step="100"
                value={feedCostPerKg}
                onChange={(e) => setFeedCostPerKg(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                {formatRp(totalFeedKg)} kg × {formatRp(feedCostPerKg)} Rp/kg
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice" className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3" /> Harga Jual Ikan (Rp/kg)
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="500"
                value={sellingPricePerKg}
                onChange={(e) => setSellingPricePerKg(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                Rekomendasi pasar {fish.name}: {formatRp(fish.priceRangePerKg[0])}–
                {formatRp(fish.priceRangePerKg[1])} Rp/kg
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="otherCost" className="flex items-center gap-1 text-xs">
                <Scale className="h-3 w-3" /> Biaya Lain (listrik, obat, dll)
              </Label>
              <Input
                id="otherCost"
                type="number"
                min="0"
                step="10000"
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-[10px] text-muted-foreground">Rp · opsional</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset harga
          </Button>

          <Separator />

          {/* Hasil */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultRow
              icon={<Package className="h-4 w-4" />}
              label="Modal Benih"
              value={`Rp ${formatRp(profit.totalSeedCost)}`}
              tone="sky"
            />
            <ResultRow
              icon={<Truck className="h-4 w-4" />}
              label="Modal Pakan"
              value={`Rp ${formatRp(profit.totalFeedCost)}`}
              tone="amber"
            />
            {profit.otherCost > 0 && (
              <ResultRow
                icon={<Scale className="h-4 w-4" />}
                label="Biaya Lain"
                value={`Rp ${formatRp(profit.otherCost)}`}
                tone="slate"
              />
            )}
            <ResultRow
              icon={<Wallet className="h-4 w-4" />}
              label="Total Modal"
              value={`Rp ${formatRp(profit.totalCost)}`}
              tone="slate"
              bold
            />
            <ResultRow
              icon={<Coins className="h-4 w-4" />}
              label="Omzet (Hasil Panen)"
              value={`Rp ${formatRp(profit.revenue)}`}
              tone="emerald"
              bold
            />
          </div>

          <Separator />

          {/* Profit highlight */}
          <div
            className={`rounded-lg p-3 sm:p-4 ${
              isProfit
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : "bg-gradient-to-br from-red-500 to-rose-700 text-white"
            } shadow-md`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide opacity-80">
                  {isProfit ? "Laba Bersih" : "Kerugian"}
                </p>
                <p className="mt-1 text-2xl font-bold sm:text-4xl">
                  {isProfit ? "+" : "-"}Rp {formatRp(Math.abs(profit.profit))}
                </p>
                <p className="mt-1 text-[11px] sm:text-xs opacity-80">
                  Margin: {profit.profitMargin}% · ROR: {profit.ror}%
                </p>
              </div>
              <div className="shrink-0">
                {isProfit ? (
                  <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 opacity-80" />
                ) : (
                  <TrendingDown className="h-8 w-8 sm:h-10 sm:w-10 opacity-80" />
                )}
              </div>
            </div>
          </div>

          {/* Break-even */}
          <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Harga Jual Break-even
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Harga minimum agar tidak rugi
                </p>
              </div>
              <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                Rp {formatRp(profit.breakevenPricePerKg)}/kg
              </p>
            </div>
          </div>

          {/* Warning jika rugi */}
          {!isProfit && (
            <Alert className="border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <TrendingDown className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Estimasi Rugi</AlertTitle>
              <AlertDescription className="text-xs">
                Dengan harga jual {formatRp(sellingPricePerKg)} Rp/kg, Anda akan rugi{" "}
                Rp {formatRp(Math.abs(profit.profit))}. Naikkan harga jual ke minimal{" "}
                <strong>Rp {formatRp(profit.breakevenPricePerKg)}/kg</strong> (break-even),
                atau turunkan biaya pakan/benih.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle className="text-sm">Catatan</AlertTitle>
            <AlertDescription className="text-xs space-y-1">
              <p>
                • Harga pasar bisa berfluktuasi — gunakan harga jual aktual dari
                pedagang/pengumpul lokal Anda untuk akurasi tertinggi.
              </p>
              <p>
                • Biaya lain (listrik, obat, transport, tenaga kerja) sering luput
                dihitung — jangan kosongi.
              </p>
              <p>
                • Estimasi tidak termasuk bunga kredit modal kerja (jika pakai pinjaman).
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResultRow({
  icon,
  label,
  value,
  tone,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "sky" | "slate";
  bold?: boolean;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300",
  };
  return (
    <div className={`flex items-center justify-between gap-2 rounded-md p-2.5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className={`text-xs ${bold ? "font-bold" : "font-medium"} shrink-0`}>{label}</span>
      </div>
      <span className={`text-xs sm:text-sm font-mono ${bold ? "font-bold" : "font-semibold"} break-all text-right min-w-0`}>
        {value}
      </span>
    </div>
  );
}
