import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  FISH_SPECIES,
  SYSTEMS,
  type PondShape,
} from "@/lib/fish-data";

// Schema validasi input
const CalcSchema = z.object({
  shape: z.enum(["rectangular", "circular"]),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  diameter: z.number().positive().optional(),
  // Kedalaman KJA (meter) — wajib jika sistem = kja_river
  depth: z.number().positive().optional(),
  fishId: z.string(),
  systemId: z.enum([
    "conventional",
    "biofloc",
    "earthen",
    "tarpaulin",
    "kja_river",
  ]),
  density: z.number().positive(),
  seedSize: z.number().positive(),
  harvestSize: z.number().positive(),
  sr: z.number().min(0).max(100),
  fcr: z.number().positive(),
  // Kandungan protein pakan (%) yang dipilih user untuk fase grower/pembesaran
  proteinPercent: z.number().min(0).max(60),
});

export interface CalcResult {
  area: number; // luas permukaan (m²) — sama untuk semua sistem
  volume: number | null; // volume (m³) — hanya untuk KJA, null untuk sistem lain
  capacityUnit: "m²" | "m³"; // satuan kapasitas (luas untuk kolam, volume untuk KJA)
  shape: PondShape;
  dimensions: string;
  fishName: string;
  fishEmoji: string;
  systemName: string;
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
}

// Fungsi hitung luas
function calcArea(
  shape: PondShape,
  dims: { length?: number; width?: number; diameter?: number }
): number {
  if (shape === "rectangular") {
    return (dims.length ?? 0) * (dims.width ?? 0);
  }
  const r = (dims.diameter ?? 0) / 2;
  return Math.PI * r * r;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CalcSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Input tidak valid",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Validasi dimensi sesuai bentuk
    if (input.shape === "rectangular" && (!input.length || !input.width)) {
      return NextResponse.json(
        { error: "Panjang & lebar wajib diisi untuk kolam persegi" },
        { status: 400 }
      );
    }
    if (input.shape === "circular" && !input.diameter) {
      return NextResponse.json(
        { error: "Diameter wajib diisi untuk kolam bulat" },
        { status: 400 }
      );
    }
    // Validasi kedalaman untuk KJA
    if (input.systemId === "kja_river") {
      if (!input.depth || input.depth <= 0) {
        return NextResponse.json(
          { error: "Kedalaman wajib diisi untuk sistem KJA Sungai" },
          { status: 400 }
        );
      }
      if (input.shape === "circular") {
        return NextResponse.json(
          { error: "KJA Sungai umumnya berbentuk persegi (jaring kotak). Silakan pilih bentuk Persegi." },
          { status: 400 }
        );
      }
    }

    // Cari fish & system
    const fish = FISH_SPECIES.find((f) => f.id === input.fishId);
    if (!fish) {
      return NextResponse.json(
        { error: "Jenis ikan tidak ditemukan" },
        { status: 400 }
      );
    }
    const system = SYSTEMS.find((s) => s.id === input.systemId);
    if (!system) {
      return NextResponse.json(
        { error: "Sistem budidaya tidak ditemukan" },
        { status: 400 }
      );
    }

    // Hitung luas permukaan
    const area = calcArea(input.shape, input);
    if (area <= 0) {
      return NextResponse.json(
        { error: "Luas permukaan harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Tentukan kapasitas & range padat tebar
    const isKja = input.systemId === "kja_river";
    let capacity: number; // luas (m²) atau volume (m³)
    let capacityUnit: "m²" | "m³";
    let volume: number | null = null;
    let densityRange: [number, number];

    if (isKja) {
      // KJA: volume = luas × kedalaman, padat tebar per m³
      volume = area * (input.depth ?? 0);
      capacity = volume;
      capacityUnit = "m³";
      densityRange = fish.densityKja;
    } else {
      capacity = area;
      capacityUnit = "m²";
      densityRange = fish.density[input.systemId];
    }

    // Hitung hasil
    const seedCount = Math.round(capacity * input.density);
    const seedCountMin = Math.round(capacity * densityRange[0]);
    const seedCountMax = Math.round(capacity * densityRange[1]);

    const survivalCount = Math.round(seedCount * (input.sr / 100));
    const initialBiomassKg = (seedCount * input.seedSize) / 1000;
    const harvestBiomassKg = (survivalCount * input.harvestSize) / 1000;
    const biomassGainKg = Math.max(0, harvestBiomassKg - initialBiomassKg);
    const totalFeedKg = biomassGainKg * input.fcr;

    // Estimasi hari panen (pertumbuhan 1.5%/hari)
    const growthRate = 0.015;
    const cycleDays = Math.round(
      Math.log(input.harvestSize / input.seedSize) / Math.log(1 + growthRate)
    );
    const feedKgPerDay = totalFeedKg / Math.max(cycleDays, 1);

    // ============ Perhitungan Protein Pakan ============
    // Asumsi split fase:
    // - Starter (pakan protein tinggi): 30% awal siklus (fase benih)
    // - Grower (pakan protein sesuai input user): 70% akhir siklus (fase pembesaran)
    const starterRatio = 0.3;
    const growerRatio = 0.7;
    const starterDays = Math.round(cycleDays * starterRatio);
    const growerDays = Math.max(cycleDays - starterDays, 1);
    const starterFeedKg = totalFeedKg * starterRatio;
    const growerFeedKg = totalFeedKg * growerRatio;

    // Protein rekomendasi SNI untuk ikan ini
    const proteinRangeStarter = fish.proteinRange.starter;
    const proteinRangeGrower = fish.proteinRange.grower;

    // Protein total (kg) = (pakan starter × % protein starter rata-rata) + (pakan grower × % protein input)
    // Untuk starter kita pakai rata-rata SNI, untuk grower pakai input user
    const starterProteinPercent =
      (proteinRangeStarter[0] + proteinRangeStarter[1]) / 2;
    const starterProteinKg = starterFeedKg * (starterProteinPercent / 100);
    const growerProteinKg = growerFeedKg * (input.proteinPercent / 100);
    const totalProteinKg = starterProteinKg + growerProteinKg;

    // Protein per hari (rata-rata selama siklus)
    const proteinKgPerDay = totalProteinKg / Math.max(cycleDays, 1);
    // Protein per ekor per hari (gram)
    const proteinGramPerFishPerDay =
      (proteinKgPerDay * 1000) / Math.max(seedCount, 1);

    // Warning untuk kandungan protein di luar rekomendasi SNI grower
    let proteinWarning = false;
    let proteinWarningMessage: string | undefined;
    if (input.proteinPercent < proteinRangeGrower[0]) {
      proteinWarning = true;
      proteinWarningMessage = `Kandungan protein ${input.proteinPercent}% di bawah rekomendasi SNI untuk fase pembesaran ${fish.name} (${proteinRangeGrower[0]}-${proteinRangeGrower[1]}%). Pertumbuhan ikan dapat terhambat.`;
    } else if (input.proteinPercent > proteinRangeGrower[1]) {
      proteinWarning = true;
      proteinWarningMessage = `Kandungan protein ${input.proteinPercent}% di atas rekomendasi SNI untuk fase pembesaran ${fish.name} (${proteinRangeGrower[0]}-${proteinRangeGrower[1]}%). Pemborosan biaya & risiko pencemaran air dari protein tidak tercerna.`;
    }

    // Warning padat tebar
    let warning = false;
    let warningMessage: string | undefined;
    if (input.density > densityRange[1]) {
      warning = true;
      warningMessage = `Padat tebar ${input.density} ekor/${capacityUnit} melebihi batas atas rekomendasi (${densityRange[1]} ekor/${capacityUnit}). Risiko kematian & pertumbuhan lambat meningkat.`;
    } else if (input.density < densityRange[0]) {
      warning = true;
      warningMessage = `Padat tebar ${input.density} ekor/${capacityUnit} di bawah rekomendasi minimum (${densityRange[0]} ekor/${capacityUnit}). Kapasitas ${isKja ? "KJA" : "kolam"} belum optimal.`;
    }

    const dimensions = isKja
      ? `${input.length} m × ${input.width} m × ${input.depth} m`
      : input.shape === "rectangular"
        ? `${input.length} m × ${input.width} m`
        : `Ø ${input.diameter} m`;

    const result: CalcResult = {
      area: Math.round(area * 100) / 100,
      volume: volume !== null ? Math.round(volume * 100) / 100 : null,
      capacityUnit,
      shape: input.shape,
      dimensions,
      fishName: fish.name,
      fishEmoji: fish.emoji,
      systemName: system.name,
      densityRange,
      densityUsed: input.density,
      seedCount,
      seedCountMin,
      seedCountMax,
      seedSizeGram: input.seedSize,
      harvestSizeGram: input.harvestSize,
      srPercent: input.sr,
      fcr: input.fcr,
      survivalCount,
      initialBiomassKg: Math.round(initialBiomassKg * 100) / 100,
      harvestBiomassKg: Math.round(harvestBiomassKg * 100) / 100,
      biomassGainKg: Math.round(biomassGainKg * 100) / 100,
      totalFeedKg: Math.round(totalFeedKg * 100) / 100,
      feedKgPerDay: Math.round(feedKgPerDay * 100) / 100,
      cycleDays,
      // Protein
      proteinPercent: input.proteinPercent,
      proteinRangeGrower,
      proteinRangeStarter,
      proteinWarning,
      proteinWarningMessage,
      totalProteinKg: Math.round(totalProteinKg * 100) / 100,
      proteinKgPerDay: Math.round(proteinKgPerDay * 1000) / 1000,
      proteinGramPerFishPerDay: Math.round(proteinGramPerFishPerDay * 100) / 100,
      starterFeedKg: Math.round(starterFeedKg * 100) / 100,
      growerFeedKg: Math.round(growerFeedKg * 100) / 100,
      starterDays,
      growerDays,
      warning,
      warningMessage,
    };

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[API /calculate] error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET untuk list master data (ikan & sistem)
export async function GET() {
  return NextResponse.json({
    fishes: FISH_SPECIES.map((f) => ({
      id: f.id,
      name: f.name,
      scientificName: f.scientificName,
      emoji: f.emoji,
      image: f.image,
      density: f.density,
      densityKja: f.densityKja,
      seedSizeRange: f.seedSizeRange,
      harvestSizeRange: f.harvestSizeRange,
      fcrRange: f.fcrRange,
      srRange: f.srRange,
      proteinRange: f.proteinRange,
      growthRate: f.growthRate,
      expectedDaysRange: f.expectedDaysRange,
      lengthWeight: f.lengthWeight,
      waterQuality: f.waterQuality,
      priceRangePerKg: f.priceRangePerKg,
      description: f.description,
      tips: f.tips,
      references: f.references,
    })),
    systems: SYSTEMS,
    _meta: {
      version: "v2",
      updatedAt: new Date().toISOString(),
      fishCount: FISH_SPECIES.length,
      systemCount: SYSTEMS.length,
    },
  });
}
