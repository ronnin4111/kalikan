"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildGrowthCurve, type FishSpecies } from "@/lib/fish-data";
import { TrendingUp, Wheat } from "lucide-react";

interface GrowthChartProps {
  cycleDays: number;
  seedCount: number;
  survivalRate: number; // %
  seedSizeGram: number;
  harvestSizeGram: number;
  totalFeedKg: number;
  fish: FishSpecies;
}

export function GrowthChart({
  cycleDays,
  seedCount,
  survivalRate,
  seedSizeGram,
  harvestSizeGram,
  totalFeedKg,
  fish,
}: GrowthChartProps) {
  const data = buildGrowthCurve({
    cycleDays,
    seedCount,
    survivalRate,
    seedSizeGram,
    harvestSizeGram,
    totalFeedKg,
    sampleEveryDays: Math.max(1, Math.floor(cycleDays / 30)),
  });

  if (data.length === 0) return null;

  const maxBiomass = Math.max(...data.map((d) => d.biomassKg));
  const maxFeed = Math.max(...data.map((d) => d.cumulativeFeedKg));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Kurva Pertumbuhan Biomassa
          </CardTitle>
          <CardDescription className="text-xs">
            Estimasi biomassa & kumulatif pakan sepanjang siklus budidaya {fish.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Hari ke-0" value={`${(seedCount * seedSizeGram / 1000).toFixed(1)} kg`} tone="sky" />
            <Stat label={`Hari ke-${cycleDays}`} value={`${maxBiomass.toFixed(1)} kg`} tone="emerald" />
            <Stat label="Total Pakan" value={`${totalFeedKg.toFixed(1)} kg`} tone="amber" />
            <Stat label="Bobot Panen" value={`${harvestSizeGram} g/ekor`} tone="teal" />
          </div>

          <div className="h-52 w-full sm:h-80 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="biomassGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="feedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  label={{ value: "Hari", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#64748b" } }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  label={{ value: "Biomassa (kg)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#64748b" } }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      biomassKg: "Biomassa",
                      cumulativeFeedKg: "Kumulatif Pakan",
                    };
                    return [`${Number(value).toLocaleString("id-ID")} kg`, labels[name] || name];
                  }}
                  labelFormatter={(label) => `Hari ke-${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      biomassKg: "Biomassa (kg)",
                      cumulativeFeedKg: "Kumulatif Pakan (kg)",
                    };
                    return <span style={{ color: "#475569" }}>{labels[value] || value}</span>;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeFeedKg"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#feedGrad)"
                  name="cumulativeFeedKg"
                />
                <Area
                  type="monotone"
                  dataKey="biomassKg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#biomassGrad)"
                  name="biomassKg"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Biomassa
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Kumulatif Pakan
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {fish.emoji} {fish.name} · SR {survivalRate}% · FCR
            </Badge>
          </div>

          <div className="rounded-md bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            <strong className="text-foreground">Catatan kurva:</strong> Pertumbuhan
            biomassa mengikuti model eksponensial W = W₀ × (W_panen / W₀)^(t/T),
            dengan SR menurun linear dari 100% → {survivalRate}% selama siklus. Pakan
            kumulatif diasumsikan distribusi merata. Untuk akurasi lebih tinggi,
            gunakan jadwal pakan mingguan (di atas) yang memperhitungkan feeding rate
            menurun dari 5% → 1% biomassa/hari.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "sky" | "teal";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
  };
  return (
    <div className={`rounded-md p-2 ${tones[tone]}`}>
      <p className="text-[10px] font-medium opacity-80">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
