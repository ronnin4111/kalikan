"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Thermometer,
  Activity,
  FlaskConical,
  Waves,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { checkWaterQuality, type FishSpecies } from "@/lib/fish-data";

interface WaterQualityFormProps {
  fish: FishSpecies;
  // Optional callback so parent can read latest input
  onChange?: (params: { do: number; ph: number; ammonia: number; temp: number; salinity: number }) => void;
}

const STORAGE_KEY = "kalikan-water-quality";

interface StoredParams {
  do: number;
  ph: number;
  ammonia: number;
  temp: number;
  salinity: number;
}

function defaultParams(fish: FishSpecies): StoredParams {
  const wq = fish.waterQuality;
  return {
    do: Math.round((wq.doRange[0] + wq.doRange[1]) / 2 * 10) / 10,
    ph: Math.round((wq.phRange[0] + wq.phRange[1]) / 2 * 10) / 10,
    ammonia: 0.05,
    temp: Math.round((wq.tempRange[0] + wq.tempRange[1]) / 2 * 10) / 10,
    salinity: Math.round((wq.salinityRange[0] + wq.salinityRange[1]) / 2 * 10) / 10,
  };
}

export function WaterQualityForm({ fish, onChange }: WaterQualityFormProps) {
  const [params, setParams] = useState<StoredParams>(() => {
    if (typeof window === "undefined") return defaultParams(fish);
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${fish.id}`);
      if (stored) return JSON.parse(stored) as StoredParams;
    } catch {}
    return defaultParams(fish);
  });

  // Reset ke default ketika ganti ikan
  useEffect(() => {
    queueMicrotask(() => setParams((prev) => {
      // Cek apakah parameter lama masih masuk akal untuk ikan baru
      const wq = fish.waterQuality;
      const withinRange = (v: number, r: [number, number]) => v >= r[0] * 0.5 && v <= r[1] * 1.5;
      if (
        withinRange(prev.do, wq.doRange) &&
        withinRange(prev.temp, wq.tempRange) &&
        prev.ph >= 5 && prev.ph <= 10
      ) {
        return prev; // tetap pakai nilai user
      }
      return defaultParams(fish);
    }));
  }, [fish]);

  // Persist ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}-${fish.id}`, JSON.stringify(params));
    } catch {}
  }, [fish, params]);

  // Notify parent
  useEffect(() => {
    onChange?.(params);
  }, [params, onChange]);

  const check = useMemo(() => checkWaterQuality(fish, params), [fish, params]);

  const wq = fish.waterQuality;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Droplets className="h-5 w-5 text-cyan-600" />
            Kualitas Air
            <Badge
              className={`ml-auto gap-1 text-[10px] ${
                check.overall === "good"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : check.overall === "warning"
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {check.overall === "good" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : check.overall === "warning" ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <AlertOctagon className="h-3 w-3" />
              )}
              {check.overall === "good"
                ? "Kondisi Baik"
                : check.overall === "warning"
                  ? "Perlu Perhatian"
                  : "Kritis"}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Masukkan hasil ukur parameter air Anda. Sistem akan otomatis
            membandingkan dengan range optimal untuk {fish.name} (SNI 7588:2009 &
            Boyd &amp; Tucker 2012).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DO */}
          <ParamRow
            icon={<Activity className="h-3.5 w-3.5 text-cyan-600" />}
            label="Oksigen Terlarut (DO)"
            value={params.do}
            unit="mg/L"
            range={wq.doRange}
            critical={wq.doCritical}
            warning={check.doWarning}
            message={check.doMessage}
            onChange={(v) => setParams({ ...params, do: v })}
            min={0}
            max={Math.max(10, wq.doRange[1] + 2)}
            step={0.1}
            color="cyan"
          />
          {/* pH */}
          <ParamRow
            icon={<FlaskConical className="h-3.5 w-3.5 text-purple-600" />}
            label="pH Air"
            value={params.ph}
            unit=""
            range={wq.phRange}
            critical={wq.phCritical}
            warning={check.phWarning}
            message={check.phMessage}
            onChange={(v) => setParams({ ...params, ph: v })}
            min={4}
            max={11}
            step={0.1}
            color="purple"
          />
          {/* Amonia */}
          <ParamRow
            icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
            label="Amonia Total (NH₃-N)"
            value={params.ammonia}
            unit="mg/L"
            range={[0, wq.ammoniaMax]}
            critical={wq.ammoniaCritical}
            warning={check.ammoniaWarning}
            message={check.ammoniaMessage}
            onChange={(v) => setParams({ ...params, ammonia: v })}
            min={0}
            max={Math.max(1, wq.ammoniaCritical * 2)}
            step={0.01}
            color="amber"
          />
          {/* Suhu */}
          <ParamRow
            icon={<Thermometer className="h-3.5 w-3.5 text-red-600" />}
            label="Suhu Air"
            value={params.temp}
            unit="°C"
            range={wq.tempRange}
            critical={wq.tempCritical}
            warning={check.tempWarning}
            message={check.tempMessage}
            onChange={(v) => setParams({ ...params, temp: v })}
            min={Math.max(5, wq.tempCritical[0] - 5)}
            max={Math.min(45, wq.tempCritical[1] + 5)}
            step={0.5}
            color="red"
          />
          {/* Salinitas */}
          {wq.salinityRange[1] > 0 && (
            <ParamRow
              icon={<Waves className="h-3.5 w-3.5 text-blue-600" />}
              label="Salinitas"
              value={params.salinity}
              unit="ppt"
              range={wq.salinityRange}
              critical={[wq.salinityRange[0] / 2, wq.salinityRange[1] * 2]}
              warning={check.salinityWarning}
              message={check.salinityMessage}
              onChange={(v) => setParams({ ...params, salinity: v })}
              min={0}
              max={Math.max(35, wq.salinityRange[1] + 5)}
              step={0.5}
              color="blue"
            />
          )}

          {/* Tabel range referensi */}
          <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Range Optimal {fish.name}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] sm:grid-cols-3">
              <RangeItem label="DO" range={`${wq.doRange[0]}-${wq.doRange[1]} mg/L`} critical={`< ${wq.doCritical}`} />
              <RangeItem label="pH" range={`${wq.phRange[0]}-${wq.phRange[1]}`} critical={`${wq.phCritical[0]} atau > ${wq.phCritical[1]}`} />
              <RangeItem label="Amonia" range={`≤ ${wq.ammoniaMax} mg/L`} critical={`> ${wq.ammoniaCritical}`} />
              <RangeItem label="Suhu" range={`${wq.tempRange[0]}-${wq.tempRange[1]} °C`} critical={`${wq.tempCritical[0]} atau > ${wq.tempCritical[1]}`} />
              <RangeItem label="Salinitas" range={`${wq.salinityRange[0]}-${wq.salinityRange[1]} ppt`} critical="—" />
            </div>
          </div>

          {/* Aggregate warnings */}
          {check.overall !== "good" && (
            <Alert
              className={
                check.overall === "critical"
                  ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
                  : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
              }
            >
              <AlertOctagon className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                {check.overall === "critical"
                  ? "⚠️ Kondisi Air Kritis — Tindakan Darurat"
                  : "Kualitas Air Perlu Diperbaiki"}
              </AlertTitle>
              <AlertDescription className="space-y-1.5 text-xs">
                {check.doMessage && <p>• {check.doMessage}</p>}
                {check.phMessage && <p>• {check.phMessage}</p>}
                {check.ammoniaMessage && <p>• {check.ammoniaMessage}</p>}
                {check.tempMessage && <p>• {check.tempMessage}</p>}
                {check.salinityMessage && <p>• {check.salinityMessage}</p>}
              </AlertDescription>
            </Alert>
          )}

          {check.overall === "good" && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                Kualitas Air Optimal
              </AlertTitle>
              <AlertDescription className="text-xs">
                Semua parameter air berada dalam range ideal untuk {fish.name}.
                Pertumbuhan ikan akan optimal.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ParamRow({
  icon,
  label,
  value,
  unit,
  range,
  warning,
  message,
  onChange,
  min,
  max,
  step,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  range: [number, number];
  critical: number | [number, number];
  warning: boolean;
  message?: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  color: "cyan" | "purple" | "amber" | "red" | "blue";
}) {
  const colorClasses = {
    cyan: "text-cyan-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs">
          {icon}
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-7 w-20 text-right text-xs"
          />
          {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
      />
      <div className="flex items-center justify-between">
        <p className={`text-[10px] ${warning ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
          Optimal: {range[0]}–{range[1]} {unit}
        </p>
        {warning && message && (
          <Badge variant="outline" className={`gap-1 text-[9px] ${colorClasses[color]}`}>
            <AlertTriangle className="h-2.5 w-2.5" />
            {warning ? "Warning" : "OK"}
          </Badge>
        )}
      </div>
    </div>
  );
}

function RangeItem({
  label,
  range,
  critical,
}: {
  label: string;
  range: string;
  critical: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{range}</span>
      <span className="text-[9px] text-red-600 dark:text-red-400">Kritis: {critical}</span>
    </div>
  );
}
