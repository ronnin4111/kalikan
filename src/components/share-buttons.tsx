"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  MessageCircle,
  Copy,
  FileDown,
  Check,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import type { FishSpecies } from "@/lib/fish-data";

interface ShareButtonsProps {
  result: {
    dimensions: string;
    area: number;
    volume: number | null;
    capacityUnit: string;
    seedCount: number;
    survivalCount: number;
    harvestBiomassKg: number;
    totalFeedKg: number;
    cycleDays: number;
    densityUsed: number;
    seedSizeGram: number;
    harvestSizeGram: number;
    srPercent: number;
    fcr: number;
    proteinPercent: number;
  };
  fish: FishSpecies;
  systemName: string;
}

function formatRp(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function ShareButtons({ result, fish, systemName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🐟 *KALIKAN — Hasil Perhitungan Budidaya*

📋 Skenario:
• Ikan: ${fish.emoji} ${fish.name}
• Sistem: ${systemName}
• Dimensi: ${result.dimensions}
• Luas/Volume: ${formatRp(result.area)} m²${result.volume ? ` / ${formatRp(result.volume)} m³` : ""}

🐟 Produksi:
• Benih ditebar: ${formatRp(result.seedCount)} ekor
• Padat tebar: ${formatRp(result.densityUsed)} ekor/${result.capacityUnit}
• Benih awal: ${result.seedSizeGram} g/ekor
• Target panen: ${result.harvestSizeGram} g/ekor
• Ikan hidup (SR ${result.srPercent}%): ${formatRp(result.survivalCount)} ekor
• Biomassa panen: ${formatRp(result.harvestBiomassKg)} kg

🌾 Pakan:
• Total pakan: ${formatRp(result.totalFeedKg)} kg
• FCR: ${result.fcr}
• Protein grower: ${result.proteinPercent}%

⏱️ Durasi: ${formatRp(result.cycleDays)} hari

Hitung sendiri di: https://kalikan.vercel.app
#Kalikan #BudidayaIkan #Perikanan`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Kalikan — Hasil Hitung Budidaya",
          text: shareText,
          url: "https://kalikan.vercel.app",
        });
        toast.success("Berhasil dibagikan");
      } catch (err) {
        // user cancelled
      }
    } else {
      handleWhatsApp();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Disalin ke clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link aplikasi disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([shareText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalikan-${fish.id}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File diunduh");
  };

  const handlePrintPdf = () => {
    // Open print dialog; user can save as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup diblokir — izinkan popup untuk simpan PDF");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Kalikan — Hasil Hitung ${fish.name}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px 24px; color: #0f172a; line-height: 1.5; }
          h1 { color: #047857; font-size: 24px; margin-bottom: 4px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
          h2 { font-size: 16px; color: #047857; margin-top: 24px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { padding: 4px 0; vertical-align: top; }
          td:first-child { color: #64748b; width: 45%; }
          td:last-child { font-weight: 500; }
          .header { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 2px solid #047857; margin-bottom: 8px; }
          .logo { width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #0d9488); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 500; margin-right: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🐟</div>
          <div>
            <h1>Kalikan — Hasil Perhitungan Budidaya</h1>
            <div class="meta">Dicetak: ${new Date().toLocaleString("id-ID")} · kalikan.vercel.app</div>
          </div>
        </div>

        <h2>📋 Skenario</h2>
        <table>
          <tr><td>Jenis Ikan</td><td>${fish.emoji} ${fish.name}</td></tr>
          <tr><td>Sistem Budidaya</td><td>${systemName}</td></tr>
          <tr><td>Dimensi</td><td>${result.dimensions}</td></tr>
          <tr><td>Luas Permukaan</td><td>${formatRp(result.area)} m²</td></tr>
          ${result.volume !== null ? `<tr><td>Volume Air</td><td>${formatRp(result.volume)} m³</td></tr>` : ""}
        </table>

        <h2>🐟 Produksi</h2>
        <table>
          <tr><td>Benih Ditebar</td><td>${formatRp(result.seedCount)} ekor</td></tr>
          <tr><td>Padat Tebar</td><td>${formatRp(result.densityUsed)} ekor/${result.capacityUnit}</td></tr>
          <tr><td>Ukuran Benih</td><td>${result.seedSizeGram} g/ekor</td></tr>
          <tr><td>Target Panen</td><td>${result.harvestSizeGram} g/ekor</td></tr>
          <tr><td>Survival Rate</td><td>${result.srPercent}%</td></tr>
          <tr><td>Ikan Hidup</td><td>${formatRp(result.survivalCount)} ekor</td></tr>
          <tr><td>Biomassa Panen</td><td><strong>${formatRp(result.harvestBiomassKg)} kg</strong></td></tr>
        </table>

        <h2>🌾 Pakan</h2>
        <table>
          <tr><td>Total Kebutuhan Pakan</td><td><strong>${formatRp(result.totalFeedKg)} kg</strong></td></tr>
          <tr><td>FCR</td><td>${result.fcr}</td></tr>
          <tr><td>Protein Grower</td><td>${result.proteinPercent}%</td></tr>
        </table>

        <h2>⏱️ Durasi Budidaya</h2>
        <table>
          <tr><td>Estimasi Hari</td><td><strong>${formatRp(result.cycleDays)} hari</strong></td></tr>
        </table>

        <p style="margin-top: 24px; padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; font-size: 11px; color: #92400e;">
          ⚠️ Hasil adalah estimasi berdasarkan standar SNI & KKP. Hasil aktual dapat bervariasi tergantung kondisi lapangan.
        </p>

        <div class="footer">
          Kalikan v2.0 · Kalkulator Ikan & Padat Tebar · Berdasarkan SNI & KKP Indonesia
        </div>

        <script>
          window.onload = () => { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Share2 className="h-5 w-5 text-emerald-600" />
            Bagikan & Simpan Hasil
          </CardTitle>
          <CardDescription className="text-xs">
            Bagikan hasil hitungan ke WhatsApp / teman, atau simpan sebagai file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Button
              variant="default"
              size="sm"
              onClick={handleWhatsApp}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Bagikan
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Disalin" : "Salin Teks"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintPdf} className="gap-1.5">
              <FileDown className="h-3.5 w-3.5" />
              Simpan PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              File TXT
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              Salin Link
            </Button>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Preview teks (yang akan dibagikan)
            </Label>
            <pre className="max-h-32 overflow-y-auto rounded-md bg-muted/40 p-2.5 font-mono text-[10px] whitespace-pre-wrap">
              {shareText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
