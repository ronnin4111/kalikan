"use client";

import { motion } from "framer-motion";
import {
  Fish,
  Ruler,
  Wheat,
  ArrowRight,
  TrendingUp,
  Calculator,
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

        {/* ===== CTA: Mulai Hitung ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-1 flex-col items-center justify-center gap-4"
        >
          <motion.button
            type="button"
            onClick={() => onSelectFish(FISH_SPECIES[0])}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-bold shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 sm:px-10 sm:py-5 sm:text-xl"
          >
            <Calculator className="h-6 w-6 sm:h-7 sm:w-7" />
            Mulai Hitung
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6" />
          </motion.button>
          <p className="text-center text-xs text-slate-400 sm:text-sm">
            Pilih jenis ikan & sistem budidaya langsung di halaman kalkulator
          </p>
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
          <p className="text-center text-[10px] text-slate-600 sm:text-xs">
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
        <p className="truncate text-[11px] text-slate-300 sm:text-xs">{desc}</p>
      </div>
    </div>
  );
}
