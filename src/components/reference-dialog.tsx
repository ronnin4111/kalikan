"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Ruler,
  Fish,
  Wheat,
  Beaker,
  TrendingUp,
  Clock,
  AlertTriangle,
  ExternalLink,
  Droplets,
  Wallet,
  CalendarDays,
  Activity,
  Thermometer,
} from "lucide-react";
import { FISH_SPECIES, SYSTEMS } from "@/lib/fish-data";

export function ReferenceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Referensi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 py-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Referensi Perhitungan Kalikan
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Panduan lengkap rumus, asumsi, dan sumber data yang digunakan dalam
            aplikasi ini.
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6 pb-4">
            {/* ===== Section 1: Luas & Volume ===== */}
            <RefSection
              icon={<Ruler className="h-5 w-5" />}
              title="1. Perhitungan Luas & Volume"
              tone="emerald"
            >
              <Formula
                label="Kolam Persegi / Persegi Panjang"
                formula="Luas = Panjang (m) × Lebar (m)"
                example="Contoh: 4 m × 3 m = 12 m²"
              />
              <Formula
                label="Kolam Bulat"
                formula="Luas = π × r²    (r = diameter / 2)"
                example="Contoh: Ø 3 m → r = 1,5 m → π × 1,5² = 7,07 m²"
              />
              <Formula
                label="KJA Sungai (Keramba Jaring Apung)"
                formula="Volume = Panjang (m) × Lebar (m) × Kedalaman (m)"
                example="Contoh: 4 m × 3 m × 2 m = 24 m³"
              />
              <Note>
                Untuk kolam (Konvensional, Biofloc, Tanah, Terpal) perhitungan
                berbasis <strong>luas permukaan (m²)</strong>. Untuk KJA Sungai
                berbasis <strong>volume (m³)</strong> karena ikan dibudidayakan
                dalam kolom air yang terendam.
              </Note>

              <Subtitle>Konversi Panjang (cm) ↔ Berat (gram)</Subtitle>
              <Formula
                label="Rumus Length-Weight Relationship"
                formula="W = a × L^b    →    L = (W / a)^(1/b)

W = berat (gram), L = panjang total (cm)
a, b = konstanta per spesies (FishBase/SeaLifeBase)"
                example="Contoh Lele 9g: L = (9 / 0.00776)^(1/2.97) = 1160^0.337 ≈ 10.4 cm"
              />

              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ikan</TableHead>
                      <TableHead className="text-xs text-center">a</TableHead>
                      <TableHead className="text-xs text-center">b</TableHead>
                      <TableHead className="text-xs text-center">5 cm →</TableHead>
                      <TableHead className="text-xs text-center">10 cm →</TableHead>
                      <TableHead className="text-xs text-center">30 cm →</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FISH_SPECIES.map((f) => {
                      const w5 = (f.lengthWeight.a * Math.pow(5, f.lengthWeight.b)).toFixed(1);
                      const w10 = (f.lengthWeight.a * Math.pow(10, f.lengthWeight.b)).toFixed(1);
                      const w30 = (f.lengthWeight.a * Math.pow(30, f.lengthWeight.b)).toFixed(1);
                      return (
                        <TableRow key={f.id}>
                          <TableCell className="text-xs font-medium">
                            {f.emoji} {f.name}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono">
                            {f.lengthWeight.a}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono">
                            {f.lengthWeight.b}
                          </TableCell>
                          <TableCell className="text-xs text-center">{w5} g</TableCell>
                          <TableCell className="text-xs text-center">{w10} g</TableCell>
                          <TableCell className="text-xs text-center">{w30} g</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <Note>
                <strong>Sumber:</strong> Konstanta a & b dari FishBase/SeaLifeBase
                (Froese & Pauly). Rumus W = a × L^b adalah standar internasional
                untuk estimasi berat ikan dari panjang. Aplikasi menampilkan
                konversi cm otomatis di slider ukuran benih & target panen.
              </Note>
            </RefSection>

            {/* ===== Section 2: Padat Tebar ===== */}
            <RefSection
              icon={<Fish className="h-5 w-5" />}
              title="2. Padat Tebar & Jumlah Benih"
              tone="teal"
            >
              <Formula
                label="Kolam (berbasis luas)"
                formula="Jumlah Benih = Luas (m²) × Padat Tebar (ekor/m²)"
                example="Contoh: 12 m² × 750 ekor/m² = 9.000 ekor"
              />
              <Formula
                label="KJA Sungai (berbasis volume)"
                formula="Jumlah Benih = Volume (m³) × Padat Tebar (ekor/m³)"
                example="Contoh: 24 m³ × 150 ekor/m³ = 3.600 ekor"
              />
              <Formula
                label="Rentang Aman"
                formula="Min = Kapasitas × padat tebar minimum rekomendasi
Maks = Kapasitas × padat tebar maksimum rekomendasi"
                example="Contoh: 12 m² × (500–1000) ekor/m² = 6.000–12.000 ekor"
              />

              <Subtitle>Tabel Padat Tebar Referensi (ekor/m² atau ekor/m³)</Subtitle>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ikan</TableHead>
                      <TableHead className="text-xs">Nama Ilmiah</TableHead>
                      <TableHead className="text-xs text-center">Konvensional</TableHead>
                      <TableHead className="text-xs text-center">Biofloc</TableHead>
                      <TableHead className="text-xs text-center">Tanah</TableHead>
                      <TableHead className="text-xs text-center">Terpal</TableHead>
                      <TableHead className="text-xs text-center">KJA (m³)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FISH_SPECIES.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap">
                          {f.emoji} {f.name}
                        </TableCell>
                        <TableCell className="text-xs italic text-muted-foreground whitespace-nowrap">
                          {f.scientificName}
                        </TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {f.density.conventional[0]}–{f.density.conventional[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {f.density.biofloc[0]}–{f.density.biofloc[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {f.density.earthen[0]}–{f.density.earthen[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {f.density.tarpaulin[0]}–{f.density.tarpaulin[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {f.densityKja[0]}–{f.densityKja[1]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Note>
                Satuan untuk KJA adalah <strong>ekor/m³</strong> (volume),
                sedangkan sistem lain <strong>ekor/m²</strong> (luas).
              </Note>
            </RefSection>

            {/* ===== Section 3: Biomassa & Produksi ===== */}
            <RefSection
              icon={<TrendingUp className="h-5 w-5" />}
              title="3. Biomassa & Estimasi Produksi"
              tone="emerald"
            >
              <Formula
                label="Ikan Hidup (Survival)"
                formula="Ikan Hidup = Jumlah Benih × (SR / 100)"
                example="Contoh: 9.000 ekor × (88% / 100) = 7.920 ekor"
              />
              <Formula
                label="Biomassa Awal"
                formula="Biomassa Awal (kg) = (Jumlah Benih × Ukuran Benih (gram)) / 1000"
                example="Contoh: (9.000 × 9 g) / 1000 = 81 kg"
              />
              <Formula
                label="Biomassa Panen"
                formula="Biomassa Panen (kg) = (Ikan Hidup × Ukuran Panen (gram)) / 1000"
                example="Contoh: (7.920 × 150 g) / 1000 = 1.188 kg"
              />
              <Formula
                label="Pertambahan Biomassa"
                formula="Pertambahan = Biomassa Panen − Biomassa Awal"
                example="Contoh: 1.188 − 81 = 1.107 kg"
              />
              <Note>
                <strong>SR (Survival Rate)</strong> = persentase ikan yang
                bertahan hidup hingga panen. <strong>Ukuran benih</strong> =
                berat rata-rata benih saat ditebar (gram/ekor).{" "}
                <strong>Ukuran panen</strong> = target berat saat dipanen.
              </Note>
            </RefSection>

            {/* ===== Section 4: Pakan ===== */}
            <RefSection
              icon={<Wheat className="h-5 w-5" />}
              title="4. Kebutuhan Pakan & FCR"
              tone="amber"
            >
              <Formula
                label="Total Kebutuhan Pakan"
                formula="Total Pakan (kg) = Pertambahan Biomassa (kg) × FCR"
                example="Contoh: 1.107 kg × 1,05 = 1.162,35 kg"
              />
              <Formula
                label="Pakan per Hari (rata-rata)"
                formula="Pakan/Hari = Total Pakan / Hari Siklus"
                example="Contoh: 1.162,35 kg / 189 hari = 6,15 kg/hari"
              />
              <Formula
                label="FCR (Feed Conversion Ratio)"
                formula="FCR = Total Pakan (kg) / Pertambahan Biomassa (kg)"
                example="Semakin rendah FCR semakin efisien. Range di app: 0.8 – 2.0"
              />

              <Subtitle>Split Fase Budidaya (Pemberian Pakan Bertahap)</Subtitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="border-sky-200 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <CardContent className="p-3">
                    <Badge className="mb-1.5 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      Fase Starter
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <strong>30% awal siklus</strong> — pakan protein tinggi
                      untuk fase benih. Pakan starter = Total Pakan × 30%.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <CardContent className="p-3">
                    <Badge className="mb-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Fase Grower
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      <strong>70% akhir siklus</strong> — pakan pembesaran sesuai
                      % protein yang dipilih user. Pakan grower = Total Pakan × 70%.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Note>
                <strong>Catatan:</strong> Pemberian pakan sebenarnya tidak merata
                setiap hari. Awal siklus ~3-5% dari biomassa/hari, menurun menjadi
                ~1-2% di akhir. Frekuensi 2-4 kali sehari. Angka di app adalah{" "}
                <strong>rata-rata</strong> selama siklus untuk estimasi total.
              </Note>
            </RefSection>

            {/* ===== Section 5: Estimasi Durasi ===== */}
            <RefSection
              icon={<Clock className="h-5 w-5" />}
              title="5. Estimasi Durasi Budidaya (SGR per Ikan)"
              tone="teal"
            >
              <Formula
                label="Rumus SGR (Specific Growth Rate)"
                formula="SGR = (ln(Bobot Akhir) − ln(Bobot Awal)) / Hari × 100  (% per hari)"
                example="SGR mengukur laju pertumbuhan spesifik harian ikan."
              />
              <Formula
                label="Estimasi Hari Budidaya"
                formula="Hari = ln(Ukuran Panen / Ukuran Benih) / ln(1 + SGR/100)"
                example="Contoh Lele: ln(140/9) / ln(1 + 4/100) = ln(15,56) / ln(1,04) = 2,744 / 0,0392 ≈ 70 hari"
              />
              <Formula
                label="SGR yang dipakai"
                formula="SGR app = rata-rata (min + max) / 2  per jenis ikan"
                example="Lele: (3 + 5) / 2 = 4% per hari → estimasi 70 hari (standar 60-90 hari ✓)"
              />

              <Subtitle>Tabel SGR & Standar Durasi per Jenis Ikan</Subtitle>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ikan</TableHead>
                      <TableHead className="text-xs text-center">SGR (%/hari)</TableHead>
                      <TableHead className="text-xs text-center">Standar Panen (hari)</TableHead>
                      <TableHead className="text-xs text-center">Ukuran Panen (g)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FISH_SPECIES.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-xs font-medium">
                          {f.emoji} {f.name}
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold text-emerald-700 dark:text-emerald-400">
                          {f.growthRate[0]}-{f.growthRate[1]}%
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {f.expectedDaysRange[0]}-{f.expectedDaysRange[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {f.harvestSizeRange[0]}-{f.harvestSizeRange[1]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Subtitle>Komponen yang Mempengaruhi Durasi Budidaya</Subtitle>
              <div className="space-y-2">
                <ComponentItem
                  title="1. SGR (Specific Growth Rate)"
                  desc="Laju pertumbuhan spesifik per jenis ikan. Lele tumbuh cepat (3-5%/hari), gurame lambat (1.5-2.5%/hari)."
                />
                <ComponentItem
                  title="2. Ukuran Benih Awal"
                  desc="Benih lebih besar = panen lebih cepat. Lele 9g → 140g butuh 70 hari; jika benih 5g butuh lebih lama."
                />
                <ComponentItem
                  title="3. Target Ukuran Panen"
                  desc="Panen lebih besar = durasi lebih lama. Lele 9g → 200g butuh ~85 hari vs → 100g butuh ~58 hari."
                />
                <ComponentItem
                  title="4. Suhu Air"
                  desc="Suhu optimal 25-30°C. Suhu rendah memperlambat metabolisme & pertumbuhan."
                />
                <ComponentItem
                  title="5. Kualitas Pakan & Protein"
                  desc="Pakan protein sesuai SNI (Lele 28-32% grower) mengoptimalkan SGR. Protein terlalu rendah = pertumbuhan lambat."
                />
                <ComponentItem
                  title="6. Padat Tebar"
                  desc="Padat tebar tinggi (>rekomendasi) menyebabkan stres & kompetisi pakan → pertumbuhan lambat."
                />
                <ComponentItem
                  title="7. Kualitas Air (DO, pH, Amonia)"
                  desc="Oksigen terlarut (DO) ≥ 4 mg/L, pH 6.5-8.5, amonia rendah. Air buruk = pertumbuhan terhambat."
                />
                <ComponentItem
                  title="8. Sistem Budidaya"
                  desc="Biofloc & KJA sungai biasanya pertumbuhan lebih cepat dari kolam tanah karena oksigen & kualitas air lebih baik."
                />
              </div>

              <Note>
                <strong>Verifikasi contoh Lele:</strong> Benih 9g → panen 140g,
                SGR 4%/hari → 70 hari. Ini sesuai standar budidaya lele Indonesia
                (60-90 hari). Estimasi sebelumnya (184 hari) SALAH karena pakai
                asumsi 1.5%/hari yang terlalu rendah. Sekarang app pakai SGR per
                ikan berdasarkan jurnal akuakultur.
              </Note>

              <Formula
                label="Hari per Fase Pakan"
                formula="Hari Starter = Hari Siklus × 30%
Hari Grower = Hari Siklus − Hari Starter"
                example="Contoh Lele 70 hari: 70 × 0,3 = 21 hari starter; 70 − 21 = 49 hari grower"
              />
            </RefSection>

            {/* ===== Section 6: Protein ===== */}
            <RefSection
              icon={<Beaker className="h-5 w-5" />}
              title="6. Perhitungan Protein Pakan"
              tone="emerald"
            >
              <Formula
                label="Protein dari Fase Starter"
                formula="Protein Starter (kg) = Pakan Starter (kg) × (% Protein Starter SNI / 100)"
                example="Contoh: 348,7 kg × (37,5% / 100) = 130,8 kg"
              />
              <Formula
                label="Protein dari Fase Grower"
                formula="Protein Grower (kg) = Pakan Grower (kg) × (% Protein Input User / 100)"
                example="Contoh: 813,6 kg × (30% / 100) = 244,1 kg"
              />
              <Formula
                label="Total Protein"
                formula="Total Protein = Protein Starter + Protein Grower"
                example="Contoh: 130,8 + 244,1 = 374,9 kg"
              />
              <Formula
                label="Protein per Hari"
                formula="Protein/Hari = Total Protein / Hari Siklus"
                example="Contoh: 374,9 / 189 = 1,98 kg/hari"
              />
              <Formula
                label="Protein per Ekor per Hari"
                formula="Protein/Ekor/Hari (gram) = (Protein/Hari × 1000) / Jumlah Benih"
                example="Contoh: (1,98 × 1000) / 9.000 = 0,22 g/ekor/hari"
              />

              <Subtitle>Tabel Kandungan Protein SNI per Jenis Ikan</Subtitle>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ikan</TableHead>
                      <TableHead className="text-xs text-center">
                        Starter (Benih)
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Grower (Pembesaran)
                      </TableHead>
                      <TableHead className="text-xs text-center">FCR</TableHead>
                      <TableHead className="text-xs text-center">SR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FISH_SPECIES.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-xs font-medium">
                          {f.emoji} {f.name}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {f.proteinRange.starter[0]}–{f.proteinRange.starter[1]}%
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold text-emerald-700 dark:text-emerald-400">
                          {f.proteinRange.grower[0]}–{f.proteinRange.grower[1]}%
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {f.fcrRange[0]}–{f.fcrRange[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {f.srRange[0]}–{f.srRange[1]}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Note>
                Untuk fase <strong>starter</strong>, app menggunakan rata-rata % SNI
                otomatis. Untuk fase <strong>grower</strong>, user bisa atur %
                protein via slider (20-45%). Warning muncul jika di luar rekomendasi
                SNI grower.
              </Note>
            </RefSection>

            {/* ===== Section 7: Warning System ===== */}
            <RefSection
              icon={<AlertTriangle className="h-5 w-5" />}
              title="7. Sistem Peringatan (Warning)"
              tone="amber"
            >
              <div className="space-y-2">
                <WarningItem
                  condition="Padat tebar > batas atas rekomendasi"
                  message="Risiko kematian & pertumbuhan lambat meningkat. Kualitas air menurun cepat."
                />
                <WarningItem
                  condition="Padat tebar < batas bawah rekomendasi"
                  message="Kapasitas kolam/KJA belum optimal. Produksi bisa ditingkatkan."
                />
                <WarningItem
                  condition="Protein pakan < SNI grower"
                  message="Pertumbuhan ikan dapat terhambat karena kekurangan nutrisi."
                />
                <WarningItem
                  condition="Protein pakan > SNI grower"
                  message="Pemborosan biaya & risiko pencemaran air dari protein tidak tercerna."
                />
                <WarningItem
                  condition="FCR di luar rekomendasi per ikan"
                  message="Badge FCR berubah jadi amber. FCR tinggi = efisiensi rendah."
                />
              </div>
            </RefSection>

            {/* ===== Section 8: Sistem Budidaya ===== */}
            <RefSection
              icon={<Fish className="h-5 w-5" />}
              title="8. Sistem Budidaya yang Didukung"
              tone="teal"
            >
              <div className="space-y-3">
                {SYSTEMS.map((s) => (
                  <Card key={s.id} className="border-border/60">
                    <CardContent className="p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {s.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {s.pros.map((p, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {s.id === "kja_river" && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Berbasis Volume
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RefSection>

            {/* ===== Section 8.5: Manajemen Air ===== */}
            <RefSection
              icon={<Droplets className="h-5 w-5" />}
              title="8.5 Manajemen Air & Volume Kolam"
              tone="teal"
            >
              <Formula
                label="Volume Air Total"
                formula="Volume (m³) = Luas Permukaan (m²) × Kedalaman (m)
Volume (liter) = Volume (m³) × 1000"
                example="Contoh: 12 m² × 1,25 m = 15 m³ = 15.000 liter"
              />
              <Formula
                label="Penggantian Air Harian"
                formula="Penggantian/Hari (liter) = Volume (liter) × (% penggantian / 100)"
                example="Contoh: 15.000 L × (3,5% / 100) = 525 liter/hari (Biofloc)"
              />

              <Subtitle>Standar Kedalaman & Penggantian Air per Sistem</Subtitle>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Sistem</TableHead>
                      <TableHead className="text-xs text-center">Kedalaman Ideal (m)</TableHead>
                      <TableHead className="text-xs text-center">Penggantian Air (%/hari)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SYSTEMS.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-xs text-center font-semibold text-emerald-700 dark:text-emerald-400">
                          {s.depthRange[0]}-{s.depthRange[1]}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {s.id === "kja_river" ? "Mengalir kontinyu" : `${s.waterExchangeRate[0]}-${s.waterExchangeRate[1]}%`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Note>
                <strong>Kenapa KJA pakai volume (m³), kolam pakai luas (m²)?</strong>
                <br />
                • <strong>KJA</strong>: ikan mengisi seluruh volume jaring yang
                terendam, air mengalir bebas → padat tebar per m³ (KKP & jurnal).
                <br />
                • <strong>Kolam</strong>: terjadi stratifikasi oksigen (lapisan
                atas kaya O₂, bawah miskin O₂), ikan dominan di permukaan →
                padat tebar per m² (SNI/KKP).
                <br />• <strong>Kedalaman tetap penting</strong> untuk kolam
                (stabilitas suhu, zona fotosintesis) → app beri warning jika di
                luar range ideal.
              </Note>

              <Subtitle>Kenapa Kedalaman Penting untuk Kolam?</Subtitle>
              <div className="space-y-2">
                <ComponentItem
                  title="1. Stratifikasi Oksigen"
                  desc="Lapisan atas (0-50cm) kaya oksigen dari fotosintesis & kontak udara. Lapisan bawah miskin O₂ & ada amonia. Kedalaman ideal menjaga keseimbangan."
                />
                <ComponentItem
                  title="2. Stabilitas Suhu"
                  desc="Kolam terlalu dangkal (<0.5m) suhu fluktuatif cepat → ikan stres. Terlalu dalam (>2m) stratifikasi kuat → lapisan bawah anoxia."
                />
                <ComponentItem
                  title="3. Zona Fotosintesis"
                  desc="Fitoplankton butuh cahaya matahari (zona euphotic ~50-80cm). Kedalaman ideal mendukung rantai makanan alami."
                />
                <ComponentItem
                  title="4. Manajemen Air"
                  desc="Volume air menentukan kebutuhan penggantian air harian. Biofloc paling hemat (2-5%/hari), kolam tanah paling borbor (5-15%/hari)."
                />
              </div>
            </RefSection>

            {/* ===== Section 9: Kualitas Air ===== */}
            <RefSection
              icon={<Activity className="h-5 w-5" />}
              title="9. Parameter Kualitas Air"
              tone="cyan"
            >
              <Note>
                Kualitas air adalah faktor terpenting yang menentukan keberhasilan
                budidaya. Aplikasi mengevaluasi 5 parameter utama dan memberi
                warning otomatis berdasarkan range optimal per jenis ikan.
              </Note>

              <Subtitle>Tabel Parameter Kualitas Air per Jenis Ikan</Subtitle>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ikan</TableHead>
                      <TableHead className="text-xs">Nama Ilmiah</TableHead>
                      <TableHead className="text-xs text-center">DO (mg/L)</TableHead>
                      <TableHead className="text-xs text-center">pH</TableHead>
                      <TableHead className="text-xs text-center">Amonia (mg/L)</TableHead>
                      <TableHead className="text-xs text-center">Suhu (°C)</TableHead>
                      <TableHead className="text-xs text-center">Salinitas (ppt)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FISH_SPECIES.map((f) => {
                      const wq = f.waterQuality;
                      return (
                        <TableRow key={f.id}>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            {f.emoji} {f.name}
                          </TableCell>
                          <TableCell className="text-xs italic text-muted-foreground whitespace-nowrap">
                            {f.scientificName}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                            {wq.doRange[0]}–{wq.doRange[1]}
                            <div className="text-[10px] text-red-600 dark:text-red-400">
                              kritis &lt;{wq.doCritical}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                            {wq.phRange[0]}–{wq.phRange[1]}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                            ≤{wq.ammoniaMax}
                            <div className="text-[10px] text-red-600 dark:text-red-400">
                              kritis &gt;{wq.ammoniaCritical}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                            {wq.tempRange[0]}–{wq.tempRange[1]}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono whitespace-nowrap">
                            {wq.salinityRange[0]}–{wq.salinityRange[1]}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <Subtitle>Penjelasan Parameter</Subtitle>
              <div className="space-y-2">
                <ComponentItem
                  title="1. DO (Dissolved Oxygen / Oksigen Terlarut)"
                  desc="Oksigen yang terlarut dalam air. DO < batas kritis (umumnya 1-3 mg/L) menyebabkan ikan lemas dan mati. Biofloc & KJA butuh DO ≥ 4 mg/L karena padat tebar tinggi."
                />
                <ComponentItem
                  title="2. pH Air"
                  desc="Tingkat keasaman. Range optimal 6.5-8.5 untuk kebanyakan ikan air tawar. pH < 5 atau > 10 bisa fatal. Pengapuran (kapur tohor) menaikkan pH; dolomit menstabilkan."
                />
                <ComponentItem
                  title="3. Amonia Total (NH₃ + NH₄⁺)"
                  desc="Hasil metabolisme protein ikan. Amonia tidak terionisasi (NH₃) bersifat toksik. Batas aman: ≤ 0.1 mg/L. Di atas 0.5 mg/L kritis → keracunan insang."
                />
                <ComponentItem
                  title="4. Suhu Air"
                  desc="Pengaruh metabolisme & nafsu makan ikan. Ikan tropis optimal 25-30°C. Suhu < 18°C memperlambat pertumbuhan; > 35°C berbahaya. Udang vannamei optimal 28-32°C."
                />
                <ComponentItem
                  title="5. Salinitas (ppt)"
                  desc="Konsentrasi garam. Ikan air tawar: 0-5 ppt. Udang vannamei euryhaline: 5-30 ppt. Nila merah lebih tahan salinitas (0-18 ppt) dari nila biasa."
                />
              </div>
              <Note>
                <strong>Sumber:</strong> SNI 7588:2009 (Budi Daya Ikan Air Tawar),
                Boyd &amp; Tucker (2012) <em>Pond Aquaculture Water Quality
                Management</em>, dan FAO Aquaculture Manuals.
              </Note>
            </RefSection>

            {/* ===== Section 10: Profit & Kalender Panen ===== */}
            <RefSection
              icon={<Wallet className="h-5 w-5" />}
              title="10. Kalkulator Profit & Kalender Panen"
              tone="emerald"
            >
              <Formula
                label="Modal Benih"
                formula="Modal Benih (Rp) = Jumlah Benih × Harga per Ekor"
                example="Contoh: 9.000 ekor × Rp 200/ekor = Rp 1.800.000"
              />
              <Formula
                label="Modal Pakan"
                formula="Modal Pakan (Rp) = Total Pakan (kg) × Harga per Kg"
                example="Contoh: 1.162 kg × Rp 12.000/kg = Rp 13.944.000"
              />
              <Formula
                label="Total Modal"
                formula="Total Modal = Modal Benih + Modal Pakan + Biaya Lain"
                example="Contoh: 1.800.000 + 13.944.000 + 2.000.000 = Rp 17.744.000"
              />
              <Formula
                label="Omzet (Pendapatan)"
                formula="Omzet (Rp) = Biomassa Panen (kg) × Harga Jual per Kg"
                example="Contoh: 1.188 kg × Rp 25.000/kg = Rp 29.700.000"
              />
              <Formula
                label="Laba Bersih"
                formula="Laba = Omzet − Total Modal"
                example="Contoh: 29.700.000 − 17.744.000 = Rp 11.956.000"
              />
              <Formula
                label="Margin & ROR"
                formula="Margin (%) = (Laba / Omzet) × 100
ROR = Return on Revenue = Margin"
                example="Contoh: 11.956.000 / 29.700.000 × 100 = 40.3%"
              />
              <Formula
                label="Harga Jual Break-even"
                formula="Break-even (Rp/kg) = Total Modal / Biomassa Panen"
                example="Harga minimum agar tidak rugi: 17.744.000 / 1.188 = Rp 14.936/kg"
              />

              <Subtitle>Kalender Panen & Fase Budidaya</Subtitle>
              <Formula
                label="Tanggal Tebar → Tanggal Panen"
                formula="Tanggal Panen = Tanggal Tebar + Hari Siklus (SGR)"
                example="Tebar 1 Januari + 70 hari = 12 Maret (estimasi panen)"
              />
              <Formula
                label="Fase Starter (0-30% awal siklus)"
                formula="Hari Starter = Hari Siklus × 30%
Tanggal Starter → Grower = Tebar + Hari Starter"
                example="Contoh 70 hari: 70 × 0.3 = 21 hari starter"
              />
              <Formula
                label="Fase Grower (30-90% tengah siklus)"
                formula="Hari Grower = Hari Siklus × 60%"
                example="Contoh 70 hari: 70 × 0.6 = 42 hari grower"
              />
              <Formula
                label="Fase Finisher (90-100% akhir siklus)"
                formula="Hari Finisher = Hari Siklus × 10%"
                example="Persiapan panen — pakan dikurangi, kualitas daging optimal"
              />
              <Formula
                label="H-7 Puasa Pakan"
                formula="Tanggal Puasa = Tanggal Panen − 7 hari"
                example="Stop pakan 5-7 hari sebelum panen agar perut kosong, transport aman"
              />

              <Note>
                <strong>Catatan:</strong> Jadwal pakan mingguan dihitung dengan{" "}
                <em>feeding rate</em> menurun dari ~5% biomassa/hari (awal) →
                ~1% (akhir), mengikuti pola pertumbuhan eksponensial. Total pakan
                dikalibrasi agar match dengan total kebutuhan pakan dari FCR.
              </Note>
            </RefSection>

            {/* ===== Section 11: Sumber Referensi ===== */}
            <RefSection
              icon={<BookOpen className="h-5 w-5" />}
              title="11. Sumber Referensi"
              tone="emerald"
            >
              <div className="space-y-2 text-xs">
                <SourceItem
                  title="SNI 01-7242-2006 — Pakan Buatan untuk Ikan Lele & Nila"
                  desc="Standar Nasional Indonesia untuk pakan ikan lele & nila (komposisi protein, lemak, serat, abu)."
                />
                <SourceItem
                  title="SNI 8221:2015 — Pakan Buatan untuk Udang Vannamei"
                  desc="Standar kadar protein 30-45% untuk udang vannamei (Litopenaeus vannamei)."
                />
                <SourceItem
                  title="SNI 8121.1:2015 — Budi Daya Ikan Gabus"
                  desc="Standar budidaya ikan gabus (Channa striata), protein 32-45%."
                />
                <SourceItem
                  title="SNI 8121.2:2015 — Budi Daya Ikan Baung"
                  desc="Standar budidaya ikan baung (Hemibagrus nemurus), protein 28-38%."
                />
                <SourceItem
                  title="SNI 7588:2009 — Budi Daya Ikan Air Tawar"
                  desc="Standar parameter kualitas air untuk budidaya ikan air tawar (DO, pH, amonia, suhu)."
                />
                <SourceItem
                  title="KKP — Kementerian Kelautan dan Perikanan"
                  desc="Master data pakan ikan terdaftar, standar teknis budidaya, dan pedoman padat tebar per sistem."
                />
                <SourceItem
                  title="FishBase & SeaLifeBase (Froese & Pauly)"
                  desc="Konstanta length-weight relationship (W = a × L^b) per spesies ikan untuk konversi panjang-berat."
                />
                <SourceItem
                  title="Boyd & Tucker (2012) — Pond Aquaculture Water Quality Management"
                  desc="Buku rujukan standar internasional untuk manajemen kualitas air tambak & kolam akuakultur."
                />
                <SourceItem
                  title="FAO Aquaculture Manuals (2018-onwards)"
                  desc="Panduan akuakultur FAO termasuk udang vannamei & nila merah (red tilapia) strain."
                />
                <SourceItem
                  title="PDSKN KKP — Pusat Data Statistik Kelautan dan Perikanan"
                  desc="Data harga pasar ikan & udang Indonesia (untuk kalkulator profit)."
                />
                <SourceItem
                  title="Jurnal UBB (Sebayang, 2020) — Pakan Lele Sangkuriang"
                  desc="Penelitian protein 36% optimal untuk benih lele."
                />
                <SourceItem
                  title="Jurnal Undip (Larasati et al.) — Nila di KJA"
                  desc="Padat tebar 67-173 ekor/m³ untuk KJA nila."
                />
                <SourceItem
                  title="BRIN — Produktivitas Nila KJA"
                  desc="Padat tebar 100 ekor/m³ menghasilkan 900 kg/120 hari."
                />
                <SourceItem
                  title="Jurnal IPB — Pakan Gabus & Nila Merah"
                  desc="Protein 40-45% starter untuk gabus; nila merah di tambak payau (salinitas 0-18 ppt)."
                />
                <SourceItem
                  title="Jurnal UNRI — Pakan Baung"
                  desc="Protein 32-38% untuk pembesaran ikan baung (Hemibagrus nemurus)."
                />
                <SourceItem
                  title="Jurnal BBPAP Situbondo — Vannamei"
                  desc="Padat tebar 50-400 ekor/m² untuk tambak vannamei semi-intensif hingga biofloc."
                />
                <SourceItem
                  title="Jurnal Unram (Abidin) — Ikan Mas"
                  desc="Kebutuhan protein ikan mas 25-30% (SNI 2006), SR 80-100%."
                />
                <SourceItem
                  title="OpenJurnal — Ikan Mas di KJA"
                  desc="Padat tebar 306 ekor/m³ untuk benih ikan mas 5 cm."
                />
              </div>
              <Note>
                <strong>Disclaimer:</strong> Semua angka di aplikasi ini adalah{" "}
                <strong>estimasi berdasarkan standar teknis & jurnal</strong>.
                Hasil aktual dapat bervariasi tergantung kondisi lapangan,
                kualitas benih, manajemen air, iklim, dan praktik budidaya.
                Gunakan sebagai panduan awal, bukan jaminan produksi.
              </Note>
            </RefSection>

            <Separator />
            <p className="text-center text-xs text-muted-foreground pb-2">
              Kalikan v2.0 · 9 Jenis Ikan · Kalkulator Ikan, Padat Tebar, Profit & Kalender Panen
              Perikanan
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Sub-komponen ----------

function RefSection({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "emerald" | "teal" | "amber";
  children: React.ReactNode;
}) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-2 pl-1">{children}</div>
    </section>
  );
}

function Formula({
  label,
  formula,
  example,
}: {
  label: string;
  formula: string;
  example?: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-3">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs text-emerald-700 dark:text-emerald-400">
        {formula}
      </pre>
      {example && (
        <p className="mt-1.5 text-[11px] text-muted-foreground italic">
          {example}
        </p>
      )}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-sky-200 bg-sky-50/60 p-3 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-200">
      {children}
    </div>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function ComponentItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function WarningItem({
  condition,
  message,
}: {
  condition: string;
  message: string;
}) {
  return (
    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
          {condition}
        </p>
        <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/80">
          {message}
        </p>
      </div>
    </div>
  );
}

function SourceItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md border border-border/60 p-2.5">
      <p className="flex items-start gap-1.5 text-xs font-semibold">
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
        {title}
      </p>
      <p className="mt-1 pl-4 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}
