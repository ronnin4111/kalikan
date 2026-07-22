"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import { saveToHistory, type HistoryEntry } from "@/components/history-panel";
import type { FishSpecies, CultivationSystem, PondShape } from "@/lib/fish-data";

interface SaveScenarioButtonProps {
  result: {
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
  };
  fishId: string;
  systemId: CultivationSystem;
  shape: PondShape;
  compact?: boolean;
}

export function SaveScenarioButton({
  result,
  fishId,
  systemId,
  shape,
  compact,
}: SaveScenarioButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry: Omit<HistoryEntry, "id" | "timestamp"> = {
      fishId,
      systemId,
      shape,
      dimensions: result.dimensions,
      area: result.area,
      volume: result.volume,
      capacityUnit: result.capacityUnit,
      densityUsed: result.densityUsed,
      seedCount: result.seedCount,
      survivalCount: result.survivalCount,
      harvestBiomassKg: result.harvestBiomassKg,
      totalFeedKg: result.totalFeedKg,
      cycleDays: result.cycleDays,
      seedSizeGram: result.seedSizeGram,
      harvestSizeGram: result.harvestSizeGram,
      srPercent: result.srPercent,
      fcr: result.fcr,
      proteinPercent: result.proteinPercent,
    };
    saveToHistory(entry);
    setSaved(true);
    toast.success("Skenario disimpan ke riwayat");
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size={compact ? "sm" : "default"}
      onClick={handleSave}
      className="gap-1.5"
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" />
          Tersimpan
        </>
      ) : (
        <>
          <Bookmark className="h-3.5 w-3.5" />
          Simpan
        </>
      )}
    </Button>
  );
}
