"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FishSpecies } from "@/lib/fish-data";

interface FishCardProps {
  fish: FishSpecies;
  selected: boolean;
  onClick: () => void;
}

export function FishCard({ fish, selected, onClick }: FishCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-md border px-1 py-1 text-center transition-colors sm:px-1.5 sm:py-1.5",
        selected
          ? `border-transparent bg-gradient-to-br ${fish.accentColor} text-white shadow-sm`
          : "border-border/60 bg-card hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-700"
      )}
      aria-pressed={selected}
      aria-label={`Pilih ikan ${fish.name}`}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute right-0.5 top-0.5 z-10">
          <CheckCircle2 className="h-3 w-3 fill-white/20 text-white" />
        </div>
      )}

      {/* Fish illustration — fixed height kecil */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center overflow-hidden rounded sm:h-12 sm:w-12",
          selected ? "bg-white/15" : fish.accentBg
        )}
      >
        <img
          src={fish.image}
          alt={`Ilustrasi ikan ${fish.name}`}
          className="h-full w-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Fish name */}
      <p
        className={cn(
          "w-full truncate text-[10px] font-bold leading-tight sm:text-[11px]",
          selected ? "text-white" : "text-foreground"
        )}
      >
        {fish.name}
      </p>

      {/* Scientific name (latin) — italic, kecil */}
      <p
        className={cn(
          "w-full truncate text-[10px] italic leading-tight sm:text-[11px]",
          selected ? "text-white/80" : "text-muted-foreground"
        )}
      >
        {fish.scientificName}
      </p>

      {/* Bottom accent bar */}
      {!selected && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r",
            fish.accentColor
          )}
        />
      )}
    </motion.button>
  );
}
