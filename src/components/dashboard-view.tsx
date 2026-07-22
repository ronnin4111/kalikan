"use client";

import { motion } from "framer-motion";
import {
  Fish,
  Ruler,
  Wheat,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { FISH_SPECIES, type FishSpecies } from "@/lib/fish-data";
import { DeveloperInfo } from "@/components/developer-info";

interface DashboardViewProps {
  onSelectFish: (fish: FishSpecies) => void;
}

export function DashboardView({ onSelectFish }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* ===== Hero Banner (gambar referensi) ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-cyan-400/20"
        >
          <img
            src="/hero-banner.png"
            alt="Kalikan - Kalkulator Ikan untuk Budidaya Perikanan"
            className="w-full max-h-48 object-cover sm:max-h-none"
          />
        </motion.div>

        {/* ===== Logo & Tagline ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="-mt-4 flex flex-col items-center text-center"
        >
          {/* Logo KALIKAN */}
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">
            <span className="text-cyan-300">KALI</span>
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              KAN
            </span>
          </h1>

          {/* Badge KALKULATOR IKAN */}
          <div className="mt-2 rounded-full bg-cyan-500/20 px-4 py-1 ring-1 ring-cyan-400/40">
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-200 sm:text-sm">
              KALKULATOR IKAN
            </p>
          </div>

          {/* Tagline */}
          <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">
            Hitung Padat Tebar Ikan,{" "}
            <span className="font-semibold text-emerald-400">Akurat & Mudah</span>
          </p>
        </motion.div>

        {/* ===== Middle: 3 Fitur Utama ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-4"
        >
          <FeaturePanel
            icon={<Fish className="h-6 w-6" />}
            title="Padat Tebar Akurat"
            desc="Berdasarkan SNI & KKP · 9 jenis ikan"
            color="emerald"
          />
          <FeaturePanel
            icon={<Ruler className="h-6 w-6" />}
            title="Semua Bentuk Kolam"
            desc="Persegi, bulat, KJA sungai"
            color="cyan"
          />
          <FeaturePanel
            icon={<Wheat className="h-6 w-6" />}
            title="Estimasi Pakan & Protein"
            desc="FCR + SNI protein + jadwal mingguan"
            color="emerald"
          />
          <FeaturePanel
            icon={<TrendingUp className="h-6 w-6" />}
            title="Profit & Kalender Panen"
            desc="Modal, omzet, laba bersih + timeline"
            color="cyan"
          />
        </motion.div>

        {/* ===== Bottom: 5 Ikan Clickable ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex-1"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300 sm:text-base">
              <Fish className="h-4 w-4 text-cyan-400" />
              Pilih Jenis Ikan
            </h2>
            <span className="text-[10px] text-slate-400 sm:text-xs">
              Klik untuk mulai hitung →
            </span>
          </div>

          {/* Bar ikan — clickable. 11 ikan → grid 3-4 cols (mobile 3 cols) */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-blue-950/60 p-3 ring-1 ring-cyan-500/20 backdrop-blur sm:grid-cols-4 sm:gap-3 sm:p-4 lg:grid-cols-4">
            {FISH_SPECIES.map((fish, idx) => (
              <motion.button
                key={fish.id}
                type="button"
                onClick={() => onSelectFish(fish)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05, type: "spring" }}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex min-h-[4.5rem] flex-col items-center gap-0.5 overflow-hidden rounded-md bg-gradient-to-b from-white/5 to-white/0 px-1 py-1.5 transition-all hover:bg-white/10 hover:ring-1 hover:ring-cyan-400/50 sm:px-1.5 sm:py-2"
                aria-label={`Hitung padat tebar untuk ${fish.name} (${fish.scientificName})`}
                title={`${fish.name} — ${fish.scientificName}`}
              >
                {/* Fish illustration */}
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-white/95 sm:h-12 sm:w-12">
                  <img
                    src={fish.image}
                    alt={`Ikan ${fish.name}`}
                    className="h-full w-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Nama ikan */}
                <p className="text-[10px] font-bold leading-tight text-white sm:text-[11px]">
                  {fish.name}
                </p>

                {/* Nama latin (italic, kecil) */}
                <p className="text-[8px] italic leading-tight text-slate-400 sm:text-[9px] line-clamp-1">
                  {fish.scientificName}
                </p>

                {/* Arrow indicator */}
                <div className="absolute right-0.5 top-0.5 rounded-full bg-cyan-500/0 p-0.5 text-cyan-400 opacity-0 transition-all group-hover:bg-cyan-500/20 group-hover:opacity-100">
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ===== Developer Info + Footer hint ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 space-y-3"
        >
          <div className="mx-auto max-w-md">
            <DeveloperInfo variant="dark" />
          </div>
          <p className="text-center text-[10px] text-slate-500 sm:text-xs">
            Kalikan · PWA · Bekerja offline · Berdasarkan standar SNI & KKP Indonesia
          </p>
          <p className="text-center text-[9px] text-slate-600 sm:text-[10px]">
            📱 Install sebagai PWA untuk akses cepat dari home screen
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- Sub-komponen FeaturePanel ----------
function FeaturePanel({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "emerald" | "cyan";
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-600/5 ring-emerald-400/30 text-emerald-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 ring-cyan-400/30 text-cyan-400",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} p-3 ring-1 backdrop-blur`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ${color === "emerald" ? "text-emerald-400" : "text-cyan-400"}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-white sm:text-sm">{title}</p>
        <p className="truncate text-[10px] text-slate-300 sm:text-xs">{desc}</p>
      </div>
    </div>
  );
}
