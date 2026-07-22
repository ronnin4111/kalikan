// Data referensi padat tebar untuk berbagai jenis ikan & sistem budidaya
// Sumber: Standar teknis budidaya Kementerian Kelautan dan Perikanan Indonesia (KKP),
// SNI pakan ikan, FishBase/SeaLifeBase (Froese & Pauly), dan jurnal akuakultur.

export type PondShape = "rectangular" | "circular";

export type CultivationSystem =
  | "conventional"
  | "biofloc"
  | "earthen"
  | "tarpaulin"
  | "kja_river"; // Keramba Jaring Apung di sungai/waduk/danau

// ---------- Parameter kualitas air ideal per spesies ----------
// Sumber:
// - Boyd & Tucker "Pond Aquaculture Water Quality Management" (1998/2012)
// - SNI 7588:2009 — Budi Daya Ikan Air Tawar (kualitas air)
// - FAO Aquaculture Manuals (2018-onwards)
// - Jurnal akuakultur Indonesia (BRIN, IPB, UGM)
export interface WaterQualityParams {
  // Oksigen terlarut (mg/L)
  doRange: [number, number];
  doCritical: number; // batas kritis (di bawah ini = bahaya)
  // pH air
  phRange: [number, number];
  phCritical: [number, number]; // [min berbahaya, max berbahaya]
  // Amonia total (mg/L NH3-N) — toksik jika > 0.1 mg/L (Unionized NH3)
  ammoniaMax: number;
  ammoniaCritical: number;
  // Suhu optimal (°C)
  tempRange: [number, number];
  tempCritical: [number, number]; // [min berbahaya, max berbahaya]
  // Salinitas (ppt) — untuk udang & ikan euryhaline
  salinityRange: [number, number];
}

export interface FishSpecies {
  id: string;
  name: string;
  // Nama ilmiah (latin) — untuk identifikasi spesies & menghindari ambiguitas
  // (mis. Nila vs Nila Merah = spesies berbeda)
  scientificName: string;
  emoji: string;
  // Path gambar ilustrasi ikan di /public
  image: string;
  // Warna aksen untuk card dashboard (Tailwind gradient classes)
  accentColor: string;
  accentBg: string;
  accentText: string;
  // Padat tebar (ekor/m²) per sistem budidaya [min, max]
  // Untuk KJA, perhitungan berbasis volume (m³) — lihat field densityKja
  density: {
    conventional: [number, number];
    biofloc: [number, number];
    earthen: [number, number];
    tarpaulin: [number, number];
  };
  // Padat tebar KJA (ekor/m³) — berbasis volume, bukan luas
  // Sumber: penelitian KKP & jurnal akuakultur Indonesia
  densityKja: [number, number];
  // Ukuran benih awal (gram/ekor)
  seedSizeRange: [number, number];
  // Ukuran panen target (gram/ekor)
  harvestSizeRange: [number, number];
  // FCR (Feed Conversion Ratio) tipikal
  fcrRange: [number, number];
  // Survival Rate tipikal (%)
  srRange: [number, number];
  // Kandungan protein pakan (% as-fed) per fase budidaya
  // starter = fase benih, grower = fase pembesaran
  // Sumber: SNI pakan ikan & jurnal akuakultur Indonesia
  proteinRange: {
    starter: [number, number];
    grower: [number, number];
  };
  // Specific Growth Rate (SGR) — laju pertumbuhan spesifik harian (% per hari)
  // Sumber: jurnal akuakultur Indonesia (SGR = (ln(bobot akhir) - ln(bobot awal)) / hari × 100)
  growthRate: [number, number];
  // Rentang durasi budidaya standar (hari) — dari tebar benih hingga panen
  // Sumber: pedoman teknis budidaya KKP
  expectedDaysRange: [number, number];
  // Konstanta length-weight relationship W = a × L^b
  // W = berat (gram), L = panjang total (cm)
  // Sumber: FishBase/SeaLifeBase (Froese & Pauly)
  lengthWeight: {
    a: number;
    b: number;
  };
  // Parameter kualitas air ideal (DO, pH, amonia, suhu, salinitas)
  waterQuality: WaterQualityParams;
  // Harga pasar referensi (Rp/kg) —- estimasi 2024-2025, untuk kalkulator profit
  // Sumber: PDSKN (Pusat Data Statistik Kelautan dan Perikanan), BPS, market brief
  priceRangePerKg: [number, number];
  // Deskripsi singkat
  description: string;
  tips: string[];
  // Daftar sumber referensi ilmiah (untuk halaman Referensi)
  references: string[];
}

export const FISH_SPECIES: FishSpecies[] = [
  // =====================================================
  // 1. LELE (Clarias gariepinus) — karnivora, air tawar
  // =====================================================
  {
    id: "lele",
    name: "Lele",
    scientificName: "Clarias gariepinus",
    emoji: "🐟",
    image: "/fish-lele.png",
    accentColor: "from-slate-500 to-slate-700",
    accentBg: "bg-slate-50 dark:bg-slate-950/40",
    accentText: "text-slate-700 dark:text-slate-300",
    density: {
      conventional: [100, 200],
      biofloc: [500, 1000],
      earthen: [50, 100],
      tarpaulin: [200, 400],
    },
    seedSizeRange: [1, 12], // 1g ≈ 5 cm (SeaLifeBase LWR)
    harvestSizeRange: [100, 1000],
    fcrRange: [0.9, 1.2],
    srRange: [80, 95],
    densityKja: [100, 200],
    // SNI 01-7242-2006 pakan ikan lele; Jurnal UBB (protein 36% optimal benih)
    proteinRange: {
      starter: [35, 40],
      grower: [28, 32],
    },
    // SGR lele 3-5%/hari (jurnal akuakultur); panen 60-90 hari
    growthRate: [3, 5],
    expectedDaysRange: [60, 90],
    // SeaLifeBase Bayesian: Clarias gariepinus
    lengthWeight: { a: 0.00776, b: 2.97 },
    // Kualitas air: Boyd & Tucker 2012; SNI 7588:2009
    waterQuality: {
      doRange: [3, 6],
      doCritical: 1.5,
      phRange: [6.5, 8.5],
      phCritical: [5.5, 9.5],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.5,
      tempRange: [25, 30],
      tempCritical: [18, 35],
      salinityRange: [0, 3],
    },
    priceRangePerKg: [18000, 28000],
    description:
      "Ikan lele adalah komoditas unggulan dengan pertumbuhan cepat dan permintaan tinggi. Tahan kondisi air kurang baik.",
    tips: [
      "Lele cocok dipelihara di berbagai sistem, termasuk biofloc dengan padat tebar tinggi.",
      "Panen bisa dilakukan setelah 60-90 hari pemeliharaan.",
      "Jaga kualitas air, terutama kadar amonia dan oksigen terlarut.",
    ],
    references: [
      "SNI 01-7242-2006 — Pakan Buatan untuk Ikan Lele",
      "SNI 7588:2009 — Budi Daya Ikan Air Tawar",
      "SeaLifeBase — Clarias gariepinus (LWR Bayesian)",
      "Jurnal UBB (Sebayang, 2020) — protein 36% optimal benih lele",
      "Boyd & Tucker (2012) — Pond Aquaculture Water Quality Management",
    ],
  },
  // =====================================================
  // 2. NILA (Oreochromis niloticus) — omnivora, air tawar
  // =====================================================
  {
    id: "nila",
    name: "Nila",
    scientificName: "Oreochromis niloticus",
    emoji: "🐠",
    image: "/fish-nila.png",
    accentColor: "from-sky-500 to-blue-600",
    accentBg: "bg-sky-50 dark:bg-sky-950/40",
    accentText: "text-sky-700 dark:text-sky-300",
    density: {
      conventional: [50, 100],
      biofloc: [200, 400],
      earthen: [30, 60],
      tarpaulin: [100, 200],
    },
    seedSizeRange: [2, 8], // 2g ≈ 5.5 cm (FishBase LWR), dibulatkan dari 1.5g
    harvestSizeRange: [150, 1000],
    fcrRange: [1.0, 1.4],
    srRange: [75, 90],
    // KJA: jurnal Undip Larasati (67-173 ekor/m³); BRIN 100 ekor/m³
    densityKja: [80, 150],
    // SNI 01-7242-2006 pakan buatan untuk ikan nila
    proteinRange: {
      starter: [32, 36],
      grower: [28, 30],
    },
    // SGR nila 2.5-4%/hari (jurnal Undip/UNIPA 2.74-4.49%); panen 90-120 hari
    growthRate: [2.5, 4],
    expectedDaysRange: [90, 120],
    // FishBase: Oreochromis niloticus
    lengthWeight: { a: 0.0115, b: 3.05 },
    waterQuality: {
      doRange: [4, 7],
      doCritical: 2,
      phRange: [6.5, 8.5],
      phCritical: [5.0, 10.0],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.5,
      tempRange: [25, 30],
      tempCritical: [15, 38],
      salinityRange: [0, 12],
    },
    priceRangePerKg: [22000, 35000],
    description:
      "Nila tahan banting dan mudah dibudidayakan. Cocok untuk pemula dengan pertumbuhan yang stabil.",
    tips: [
      "Nila rentang benih unggul seperti Nirwana atau Gesit untuk hasil maksimal.",
      "Hindari padat tebar berlebih agar pertumbuhan tidak terhambat.",
      "Panen ideal di umur 4-5 bulan.",
    ],
    references: [
      "SNI 01-7242-2006 — Pakan Buatan untuk Ikan Nila",
      "FishBase — Oreochromis niloticus (LWR Bayesian)",
      "Jurnal Undip (Larasati et al.) — Nila di KJA: 67-173 ekor/m³",
      "BRIN — Produktivitas Nila KJA: 100 ekor/m³ (900 kg/120 hari)",
      "Boyd & Tucker (2012) — Pond Aquaculture Water Quality Management",
    ],
  },
  // =====================================================
  // 3. PATIN (Pangasius hypophthalmus) — karnivora, air tawar
  // =====================================================
  {
    id: "patin",
    name: "Patin",
    scientificName: "Pangasius hypophthalmus",
    emoji: "🐡",
    image: "/fish-patin.png",
    accentColor: "from-cyan-500 to-teal-600",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/40",
    accentText: "text-cyan-700 dark:text-cyan-300",
    density: {
      conventional: [50, 100],
      biofloc: [200, 300],
      earthen: [40, 80],
      tarpaulin: [100, 150],
    },
    seedSizeRange: [1, 10], // 1g ≈ 5 cm (FishBase LWR)
    harvestSizeRange: [300, 1000],
    fcrRange: [1.1, 1.5],
    srRange: [75, 88],
    // KJA: patin cocok di air mengalir; max 5 kg/m³ biomassa
    densityKja: [50, 100],
    // KKP master data pakan patin; karnivora butuh protein tinggi
    proteinRange: {
      starter: [38, 42],
      grower: [30, 33],
    },
    // SGR patin 2-3%/hari; panen 120-180 hari (4-6 bulan)
    growthRate: [2, 3],
    expectedDaysRange: [120, 180],
    // FishBase: Pangasius hypophthalmus
    lengthWeight: { a: 0.0056, b: 3.18 },
    waterQuality: {
      doRange: [4, 6],
      doCritical: 2,
      phRange: [6.5, 8.0],
      phCritical: [5.5, 9.0],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.4,
      tempRange: [26, 30],
      tempCritical: [18, 36],
      salinityRange: [0, 4],
    },
    priceRangePerKg: [25000, 38000],
    description:
      "Ikan patin bernilai ekonomi tinggi dengan permintaan pasar restoran. Butuh kualitas air baik.",
    tips: [
      "Patin butuh oksigen terlarut tinggi (>4 mg/L), sediakan aerator.",
      "Pakan patin biasanya mengandung protein 28-32%.",
      "Panen di ukuran 300-600 gram setelah 4-6 bulan.",
    ],
    references: [
      "KKP — Master Data Pakan Patin (protein 28-32%, KJA max 5 kg/m³ biomassa)",
      "FishBase — Pangasius hypophthalmus (LWR Bayesian)",
      "SNI 7588:2009 — Budi Daya Ikan Air Tawar",
      "Jurnal BRIN — Patin di KJA Sungai",
    ],
  },
  // =====================================================
  // 4. GURAME (Osphronemus goramy) — omnivora, air tawar
  // =====================================================
  {
    id: "gurame",
    name: "Gurame",
    scientificName: "Osphronemus goramy",
    emoji: "🪼",
    image: "/fish-gurame.png",
    accentColor: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
    accentText: "text-amber-700 dark:text-amber-300",
    density: {
      conventional: [20, 40],
      biofloc: [60, 100],
      earthen: [15, 30],
      tarpaulin: [40, 70],
    },
    seedSizeRange: [2, 20], // 2g ≈ 4.9 cm (FishBase LWR), mendekati 5 cm
    harvestSizeRange: [300, 1000],
    fcrRange: [1.3, 1.8],
    srRange: [70, 85],
    // KJA: gurame jarang di KJA (lebih cocok kolam), padat rendah
    densityKja: [30, 60],
    // SNI pakan gurame; omnivora, protein lebih rendah
    proteinRange: {
      starter: [30, 35],
      grower: [25, 28],
    },
    // SGR gurame 1.5-2.5%/hari (pertumbuhan lambat); panen 180-240 hari (6-8 bulan)
    growthRate: [1.5, 2.5],
    expectedDaysRange: [180, 240],
    // FishBase: Osphronemus goramy
    lengthWeight: { a: 0.0183, b: 2.96 },
    waterQuality: {
      doRange: [4, 7],
      doCritical: 2.5,
      phRange: [6.5, 8.0],
      phCritical: [5.5, 9.5],
      ammoniaMax: 0.05,
      ammoniaCritical: 0.3,
      tempRange: [25, 30],
      tempCritical: [20, 35],
      salinityRange: [0, 2],
    },
    priceRangePerKg: [45000, 70000],
    description:
      "Gurame bernilai jual tinggi namun pertumbuhan lambat. Cocok untuk budidaya jangka panjang.",
    tips: [
      "Gurame pertumbuhannya lambat, butuh kesabaran 6-8 bulan untuk panen.",
      "Berikan pakan alami seperti daun papaya, kangkung sebagai suplemen.",
      "Hindari padat tebar tinggi karena gurame butuh ruang gerak.",
    ],
    references: [
      "SNI 7588:2009 — Budi Daya Ikan Air Tawar",
      "FishBase — Osphronemus goramy (LWR Bayesian)",
      "Jurnal IPB — Pakan Gurame (protein 25-28% grower)",
      "Pedoman Teknis Budidaya KKP — Gurame",
    ],
  },
  // =====================================================
  // 5. IKAN MAS (Cyprinus carpio) — omnivora, air tawar
  // =====================================================
  {
    id: "mas",
    name: "Ikan Mas",
    scientificName: "Cyprinus carpio",
    emoji: "🐟",
    image: "/fish-mas.png",
    accentColor: "from-orange-500 to-red-600",
    accentBg: "bg-orange-50 dark:bg-orange-950/40",
    accentText: "text-orange-700 dark:text-orange-300",
    density: {
      conventional: [50, 100],
      biofloc: [150, 300],
      earthen: [30, 60],
      tarpaulin: [80, 150],
    },
    seedSizeRange: [2, 15], // 2g ≈ 5.5 cm (FishBase LWR), dibulatkan dari 1.5g
    harvestSizeRange: [200, 1000],
    fcrRange: [1.1, 1.5],
    srRange: [75, 90],
    // KJA: ikan mas populer di KJA; 306 ekor/m³ untuk benih, 80-150 pembesaran
    densityKja: [80, 150],
    // SNI 2006 pakan ikan mas (25-30%); Jurnal Unram
    proteinRange: {
      starter: [32, 36],
      grower: [25, 30],
    },
    // SGR ikan mas 2-3%/hari; panen 120-150 hari (4-5 bulan)
    growthRate: [2, 3],
    expectedDaysRange: [120, 150],
    // FishBase: Cyprinus carpio
    lengthWeight: { a: 0.0113, b: 3.05 },
    waterQuality: {
      doRange: [5, 8],
      doCritical: 3,
      phRange: [6.5, 8.5],
      phCritical: [5.5, 9.5],
      ammoniaMax: 0.05,
      ammoniaCritical: 0.3,
      tempRange: [20, 25],
      tempCritical: [12, 32],
      salinityRange: [0, 5],
    },
    priceRangePerKg: [28000, 40000],
    description:
      "Ikan mas (kancr) populer di dataran tinggi. Sensitif terhadap perubahan suhu dan oksigen.",
    tips: [
      "Ikan mas cocok di air mengalir atau bersuhu sejuk (20-25°C).",
      "Jaga kualitas air karena ikan mas sensitif polutan.",
      "Panen pada ukuran 200-400 gram setelah 4-5 bulan.",
    ],
    references: [
      "SNI 01-7242-2006 — Pakan Buatan untuk Ikan Mas",
      "SNI 7588:2009 — Budi Daya Ikan Air Tawar",
      "FishBase — Cyprinus carpio (LWR Bayesian)",
      "Jurnal Unram (Abidin) — protein 25-30%, SR 80-100%",
      "OpenJurnal — Ikan Mas di KJA: 306 ekor/m³ (benih 5 cm)",
    ],
  },
  // =====================================================
  // 6. UDANG VANNAMEI (Litopenaeus vannamei) — air payau
  // Sumber: SNI 8221:2015, FAO Vannamei Manual, Jurnal BBPAP Situbondo
  // =====================================================
  {
    id: "vannamei",
    name: "Udang Vannamei",
    scientificName: "Litopenaeus vannamei",
    emoji: "🦐",
    image: "/fish-lele.png", // fallback image; udang belum punya ilustrasi sendiri
    accentColor: "from-pink-500 to-rose-600",
    accentBg: "bg-pink-50 dark:bg-pink-950/40",
    accentText: "text-pink-700 dark:text-pink-300",
    density: {
      conventional: [50, 100], // tambak semi-intensif
      biofloc: [200, 400], // tambak biofloc intensif (PL/m²)
      earthen: [20, 50], // tambak tradisional ekstensif
      tarpaulin: [150, 300], // tambak terpal intensif
    },
    seedSizeRange: [0.01, 0.05], // PL (post-larva) ~0.01g
    harvestSizeRange: [10, 25], // 10-25 g/ekor (size 30-90)
    fcrRange: [1.2, 1.8],
    srRange: [70, 90],
    // KJA: udang tidak umum di KJA sungai, lebih cocok tambak
    densityKja: [0, 0],
    // SNI 8221:2015 — Pakan Udang Vannamei; protein 30-40%
    proteinRange: {
      starter: [38, 45],
      grower: [30, 35],
    },
    // SGR vannamei 3-5%/hari (jurnal BBPAP); panen 90-120 hari
    growthRate: [3, 5],
    expectedDaysRange: [90, 120],
    // FishBase: Litopenaeus vannamei (LWR)
    lengthWeight: { a: 0.0125, b: 2.95 },
    waterQuality: {
      doRange: [4, 7],
      doCritical: 2.5,
      phRange: [7.5, 8.5],
      phCritical: [6.5, 9.5],
      ammoniaMax: 0.15,
      ammoniaCritical: 0.6,
      tempRange: [28, 32],
      tempCritical: [20, 36],
      salinityRange: [5, 30], // euryhaline
    },
    priceRangePerKg: [55000, 85000], // size 40-60
    description:
      "Udang vannamei komoditas ekspor dengan nilai jual tinggi. Budidaya intensif di tambak semi/biofloc.",
    tips: [
      "Udang vannamei butuh salinitas 5-30 ppt, cocok di tambak pesisir.",
      "Kualitas air sangat krusial — DO ≥ 4 mg/L, amonia < 0.1 mg/L.",
      "Panen 90-120 hari dengan ukuran 30-60 ekor/kg.",
      "Hindari padat tebar tinggi tanpa aerasi kuat & biosecurity ketat.",
    ],
    references: [
      "SNI 8221:2015 — Pakan Buatan untuk Udang Vannamei",
      "FAO (2018) — Aquaculture Feed and Fertilizer Resources Information System",
      "Jurnal BBPAP Situbondo — Padat tebar 50-400 ekor/m²",
      "Boyd & Tucker (2012) — Pond Aquaculture Water Quality Management",
      "FishBase — Litopenaeus vannamei (LWR)",
    ],
  },
  // =====================================================
  // 7. GABUS (Channa striata) — karnivora, air tawar
  // Sumber: SNI 8121.1:2015 — Budi Daya Ikan Gabus, jurnal IPB/Unlam
  // =====================================================
  {
    id: "gabus",
    name: "Gabus",
    scientificName: "Channa striata",
    emoji: "🐍",
    image: "/fish-lele.png", // fallback
    accentColor: "from-zinc-600 to-stone-800",
    accentBg: "bg-stone-50 dark:bg-stone-950/40",
    accentText: "text-stone-700 dark:text-stone-300",
    density: {
      conventional: [30, 60],
      biofloc: [80, 150],
      earthen: [15, 40],
      tarpaulin: [60, 120],
    },
    seedSizeRange: [1, 15], // benih 1-15g
    harvestSizeRange: [250, 800],
    fcrRange: [1.1, 1.6],
    srRange: [70, 88],
    // KJA: gabus jarang di KJA (karnivora agresif)
    densityKja: [20, 50],
    // SNI pakan gabus (belum ada SNI khusus); jurnal IPB protein 38-42%
    proteinRange: {
      starter: [40, 45],
      grower: [32, 36],
    },
    // SGR gabus 1.5-2.5%/hari; panen 150-180 hari (5-6 bulan)
    growthRate: [1.5, 2.5],
    expectedDaysRange: [150, 180],
    // FishBase: Channa striata
    lengthWeight: { a: 0.0061, b: 3.07 },
    waterQuality: {
      doRange: [3, 6], // gabus tahan DO rendah (labyrinth accessory)
      doCritical: 1.0,
      phRange: [6.0, 8.5],
      phCritical: [5.0, 9.5],
      ammoniaMax: 0.2,
      ammoniaCritical: 0.8,
      tempRange: [25, 32],
      tempCritical: [18, 38],
      salinityRange: [0, 5],
    },
    priceRangePerKg: [50000, 75000],
    description:
      "Ikan gabus bernilai ekonomi tinggi untuk pasar ekspor (fillet) & lokal. Tahan kondisi air rendah oksigen.",
    tips: [
      "Gabus karnivora agresif — beri pakan ruji/lele kecil atau pakan buatan protein >32%.",
      "Sediakan tempat persembunyian (paralon/bambu) untuk mengurangi kanibalisme.",
      "Panen 5-6 bulan dengan ukuran 300-500 g/ekor.",
    ],
    references: [
      "SNI 8121.1:2015 — Budi Daya Ikan Gabus",
      "Jurnal IPB — Pakan Gabus (protein 40-45% starter)",
      "FishBase — Channa striata (LWR)",
      "Pedoman Teknis Budidaya KKP — Ikan Gabus",
    ],
  },
  // =====================================================
  // 8. BAUNG (Hemibagrus nemurus) — omnivora-karnivora, air tawar
  // Sumber: SNI 8121.2:2015, jurnal UNRI/UNJA
  // =====================================================
  {
    id: "baung",
    name: "Baung",
    scientificName: "Hemibagrus nemurus",
    emoji: "🐟",
    image: "/fish-lele.png", // fallback
    accentColor: "from-yellow-600 to-amber-700",
    accentBg: "bg-yellow-50 dark:bg-yellow-950/40",
    accentText: "text-yellow-700 dark:text-yellow-300",
    density: {
      conventional: [30, 60],
      biofloc: [80, 150],
      earthen: [20, 40],
      tarpaulin: [50, 100],
    },
    seedSizeRange: [2, 20],
    harvestSizeRange: [200, 600],
    fcrRange: [1.2, 1.7],
    srRange: [70, 85],
    densityKja: [40, 80],
    // Pakan baung belum ada SNI khusus; jurnal UNRI protein 32-38%
    proteinRange: {
      starter: [35, 40],
      grower: [28, 32],
    },
    // SGR baung 2-3%/hari; panen 150-200 hari (5-7 bulan)
    growthRate: [2, 3],
    expectedDaysRange: [150, 200],
    // FishBase: Hemibagrus nemurus
    lengthWeight: { a: 0.0089, b: 3.02 },
    waterQuality: {
      doRange: [4, 6],
      doCritical: 2,
      phRange: [6.5, 8.0],
      phCritical: [5.5, 9.0],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.5,
      tempRange: [25, 30],
      tempCritical: [18, 36],
      salinityRange: [0, 3],
    },
    priceRangePerKg: [40000, 60000],
    description:
      "Ikan baung demersal sungai, permintaan pasar lokal tinggi. Cocok di kolam air mengalir atau KJA sungai.",
    tips: [
      "Baung suka air mengalir dengan DO ≥ 4 mg/L.",
      "Pakan alami: cacing, ikan kecil; pakan buatan protein 28-32% grower.",
      "Panen 5-7 bulan dengan ukuran 250-400 g/ekor.",
    ],
    references: [
      "SNI 8121.2:2015 — Budi Daya Ikan Baung",
      "Jurnal UNRI — Pakan Baung (protein 32-38%)",
      "FishBase — Hemibagrus nemurus (LWR)",
      "Pedoman Teknis Budidaya KKP — Ikan Baung",
    ],
  },
  // =====================================================
  // 9. NILA MERAH (Oreochromis sp. red strain / Red Tilapia)
  // Sumber: jurnal IPB, FAO Cultured Aquatic Species
  // =====================================================
  {
    id: "nila-merah",
    name: "Nila Merah",
    scientificName: "Oreochromis sp. (red strain)",
    emoji: "🐠",
    image: "/fish-nila.png", // fallback
    accentColor: "from-red-500 to-rose-700",
    accentBg: "bg-red-50 dark:bg-red-950/40",
    accentText: "text-red-700 dark:text-red-300",
    density: {
      conventional: [50, 100],
      biofloc: [200, 400],
      earthen: [30, 60],
      tarpaulin: [100, 200],
    },
    seedSizeRange: [2, 10],
    harvestSizeRange: [200, 800],
    fcrRange: [1.1, 1.5],
    srRange: [75, 90],
    densityKja: [80, 150],
    // SNI pakan nila merah belum spesifik, mengikuti SNI 01-7242-2006 nila
    proteinRange: {
      starter: [32, 38],
      grower: [28, 32],
    },
    // SGR nila merah 2.5-4%/hari; panen 90-120 hari
    growthRate: [2.5, 4],
    expectedDaysRange: [90, 120],
    // FishBase: Oreochromis sp. (LWR Mendez-style)
    lengthWeight: { a: 0.0123, b: 3.04 },
    waterQuality: {
      doRange: [4, 7],
      doCritical: 2,
      phRange: [6.5, 8.5],
      phCritical: [5.0, 10.0],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.5,
      tempRange: [25, 30],
      tempCritical: [15, 38],
      salinityRange: [0, 18], // nila merah lebih tahan salinitas dari nila biasa
    },
    priceRangePerKg: [35000, 50000],
    description:
      "Nila merah lebih bernilai jual daripada nila hitam, permintaan restoran tinggi. Toleran salinitas hingga 18 ppt.",
    tips: [
      "Nila merah cocok di tambak payau (salinitas 0-18 ppt).",
      "Warna merah bisa pudar jika pakan rendah astaxanthin — tambahkan suplemen warna.",
      "Panen 90-120 hari dengan ukuran 250-400 g/ekor.",
    ],
    references: [
      "SNI 01-7242-2006 — Pakan Buatan untuk Ikan Nila (rujukan)",
      "FAO (2020) — Cultured Aquatic Species: Oreochromis sp. red strain",
      "Jurnal IPB — Nila Merah di Tambak Payau",
      "FishBase — Oreochromis sp. (LWR Bayesian)",
    ],
  },
  // =====================================================
  // 10. BAWAL AIR TAWAR (Piaractus brachypomus) — omnivora, air tawar
  // Sumber: SNI 8121.3:2015 — Budi Daya Ikan Bawal Air Tawar, jurnal IPB/Unsoed
  // =====================================================
  {
    id: "bawal",
    name: "Bawal Air Tawar",
    scientificName: "Piaractus brachypomus",
    emoji: "🐡",
    image: "/fish-patin.png", // fallback — bentuk badan mirip patin (compressed)
    accentColor: "from-indigo-500 to-violet-600",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
    accentText: "text-indigo-700 dark:text-indigo-300",
    density: {
      conventional: [25, 50],
      biofloc: [80, 200],
      earthen: [15, 40],
      tarpaulin: [50, 100],
    },
    seedSizeRange: [5, 30],
    harvestSizeRange: [300, 800],
    fcrRange: [1.3, 1.8],
    srRange: [75, 90],
    // KJA: bawal bisa di KJA sungai/waduk; 30-80 ekor/m³
    densityKja: [30, 80],
    // SNI pakan bawal; omnivora, protein 25-32% grower
    proteinRange: {
      starter: [32, 38],
      grower: [25, 30],
    },
    // SGR bawal 2-3%/hari; panen 150-210 hari (5-7 bulan)
    growthRate: [2, 3],
    expectedDaysRange: [150, 210],
    // FishBase: Piaractus brachypomus
    lengthWeight: { a: 0.0389, b: 2.89 },
    waterQuality: {
      doRange: [4, 6],
      doCritical: 2,
      phRange: [6.0, 8.0],
      phCritical: [5.0, 9.0],
      ammoniaMax: 0.1,
      ammoniaCritical: 0.5,
      tempRange: [25, 30],
      tempCritical: [18, 35],
      salinityRange: [0, 5],
    },
    priceRangePerKg: [30000, 45000],
    description:
      "Bawal air tawar (Piaractus brachypomus) asal Amerika Selatan, sudah lama diintroduksi & populer di Indonesia. Bentuk badan pipih, pertumbuhan cepat, omnivora.",
    tips: [
      "Bawal omnivora — pakai pakan protein 25-30% grower, suka pakan alami (daun-daunan, kangkung).",
      "Bentuk badan pipih — sediakan ruang gerak cukup, hindari padat tebar berlebih.",
      "Panen 5-7 bulan dengan ukuran 400-600 g/ekor.",
      "Toleran kualitas air sedang (DO ≥ 4 mg/L, pH 6-8).",
    ],
    references: [
      "SNI 8121.3:2015 — Budi Daya Ikan Bawal Air Tawar",
      "Jurnal IPB — Pakan Bawal Air Tawar (protein 25-32%)",
      "FishBase — Piaractus brachypomus (LWR Bayesian)",
      "Pedoman Teknis Budidaya KKP — Bawal Air Tawar",
    ],
  },
  // =====================================================
  // 11. KAKAP PUTIH (Lates calcarifer) — karnivora, euryhaline (air tawar/payau/laut)
  // Sumber: SNI 8222:2015 — Budi Daya Ikan Kakap Putih, FAO Barramundi Manual
  // =====================================================
  {
    id: "kakap-putih",
    name: "Kakap Putih",
    scientificName: "Lates calcarifer",
    emoji: "🐟",
    image: "/fish-patin.png", // fallback — silinder mirip patin
    accentColor: "from-slate-400 to-cyan-700",
    accentBg: "bg-slate-50 dark:bg-slate-950/40",
    accentText: "text-slate-700 dark:text-cyan-300",
    density: {
      conventional: [20, 40],
      biofloc: [60, 150],
      earthen: [10, 25],
      tarpaulin: [30, 80],
    },
    seedSizeRange: [5, 30],
    harvestSizeRange: [500, 1500],
    fcrRange: [1.2, 1.7],
    srRange: [80, 95],
    // KJA: kakap putih populer di KJA laut/sungai, 30-80 ekor/m³
    densityKja: [30, 80],
    // SNI pakan kakap putih; karnivora, protein 38-45% starter
    proteinRange: {
      starter: [40, 48],
      grower: [32, 38],
    },
    // SGR kakap putih 2-3.5%/hari; panen 120-180 hari (4-6 bulan)
    growthRate: [2, 3.5],
    expectedDaysRange: [120, 180],
    // FishBase: Lates calcarifer
    lengthWeight: { a: 0.0087, b: 3.05 },
    waterQuality: {
      doRange: [5, 8],
      doCritical: 3,
      phRange: [7.0, 8.5],
      phCritical: [6.0, 9.5],
      ammoniaMax: 0.05,
      ammoniaCritical: 0.3,
      tempRange: [26, 32],
      tempCritical: [18, 38],
      // Euryhaline: 0-35 ppt (tawar sampai laut)
      salinityRange: [0, 35],
    },
    priceRangePerKg: [60000, 95000],
    description:
      "Kakap putih (Asian seabass / barramundi) komoditas premium bernilai ekspor. Karnivora agresif, euryhaline — bisa dibudidayakan di air tawar, payau, maupun laut.",
    tips: [
      "Kakap putih karnivora — pakan ruji (ikan kecil/trash fish) atau pakan buatan protein 32-38% grower.",
      "Bisa di kolam air tawar, tambak payau, atau KJA laut. Salinitas 0-35 ppt.",
      "Panen 4-6 bulan dengan ukuran 500-1000 g/ekor.",
      "Sensitif kualitas air — DO ≥ 5 mg/L, amonia < 0.05 mg/L wajib dijaga.",
      "Sediakan tempat persembunyian untuk mengurangi kanibalisme pada fase benih.",
    ],
    references: [
      "SNI 8222:2015 — Budi Daya Ikan Kakap Putih",
      "FAO (2019) — Barramundi Aquaculture Manual",
      "FishBase — Lates calcarifer (LWR Bayesian)",
      "Jurnal UGM — Kakap Putih di KJA Laut (padat tebar 30-80 ekor/m³)",
      "ACIAR — Barramundi Feed & Nutrition (protein 32-45%)",
    ],
  },
];

export interface SystemInfo {
  id: CultivationSystem;
  name: string;
  description: string;
  pros: string[];
  // Kedalaman air ideal (meter) — [min, max]
  // Sumber: pedoman teknis budidaya KKP & standar akuakultur Indonesia
  depthRange: [number, number];
  // Tingkat penggantian air harian (% dari volume total)
  // Sumber: pedoman manajemen air KKP
  waterExchangeRate: [number, number]; // % per hari
}

export const SYSTEMS: SystemInfo[] = [
  {
    id: "conventional",
    name: "Konvensional (Kolam Semen)",
    description: "Kolam beton/ semen dengan sistem air tergenang dan aerasi terbatas.",
    pros: ["Investasi menengah", "Perawatan rutin", "Stabil untuk berbagai iklim"],
    depthRange: [0.8, 1.2],
    waterExchangeRate: [5, 10],
  },
  {
    id: "biofloc",
    name: "Biofloc",
    description:
      "Sistem budidaya padat dengan teknologi bakteri pembentuk floc untuk mendegradasi limbah.",
    pros: [
      "Padat tebar tinggi",
      "Hemat air",
      "Pakan alami dari floc",
      "Butuh ketrampilan khusus",
    ],
    depthRange: [1.0, 1.5],
    waterExchangeRate: [2, 5],
  },
  {
    id: "earthen",
    name: "Kolam Tanah",
    description: "Kolam galian tanah tradisional dengan sumber air alami.",
    pros: ["Biaya murah", "Skala luas", "Mengandalkan ekosistem alami"],
    depthRange: [1.0, 1.5],
    waterExchangeRate: [5, 15],
  },
  {
    id: "tarpaulin",
    name: "Kolam Terpal",
    description: "Kolam dengan lapisan terpal, fleksibel dan hemat lahan.",
    pros: ["Hemat lahan", "Investasi ringan", "Mudah dipindah", "Populer di perkotaan"],
    depthRange: [0.6, 1.0],
    waterExchangeRate: [5, 10],
  },
  {
    id: "kja_river",
    name: "KJA Sungai (Keramba Jaring Apung)",
    description:
      "Keramba jaring apung di perairan mengalir (sungai/waduk/danau). Ikan dipelihara dalam jaring berdimensi volume (m³). Oksigen & limbah terbawa arus alami.",
    pros: [
      "Oksigen alami dari arus",
      "Limbah terbawa air",
      "Pertumbuhan cepat",
      "Tidak butuh lahan",
      "Cocok untuk patin, nila, mas",
    ],
    depthRange: [1.5, 2.5],
    waterExchangeRate: [100, 100], // KJA air mengalir kontinyu (100%+ per hari)
  },
];

// ---------- Fungsi util ----------

// Helpers numerik anti-crash. Semua perhitungan di app harus melewati
// helper ini untuk mencegah NaN/Infinity yang bisa membuat React render
// tabel dengan ribuan baris NaN (browser crash/hang).

/** Clamp ke range [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  if (!isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/** Bulat ke N desimal, aman terhadap NaN/Infinity. */
export function safeRound(v: number, decimals = 0): number {
  if (!isFinite(v) || isNaN(v)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(v * factor) / factor;
}

/** Bagi aman — kembalikan 0 jika pembagi 0/NaN/Infinity. */
export function safeDiv(a: number, b: number): number {
  if (!isFinite(a) || !isFinite(b) || b === 0) return 0;
  return a / b;
}

/**
 * Hitung luas permukaan kolam berdasarkan bentuk dan dimensi.
 * - Persegi: Panjang × Lebar
 * - Bulat: π × r² (r = diameter / 2)
 */
export function calcArea(
  shape: PondShape,
  dims: { length?: number; width?: number; diameter?: number }
): number {
  if (shape === "rectangular") {
    return (dims.length ?? 0) * (dims.width ?? 0);
  }
  // circular
  const r = (dims.diameter ?? 0) / 2;
  return Math.PI * r * r;
}

/** Hitung hari siklus dari SGR & rasio panen/benih. Aman & di-clamp. */
export function calcCycleDays(
  seedSizeGram: number,
  harvestSizeGram: number,
  growthRatePct: number
): number {
  // Guard terhadap 0/NaN/Infinity
  if (!isFinite(seedSizeGram) || !isFinite(harvestSizeGram) || !isFinite(growthRatePct)) {
    return 90; // default fallback
  }
  if (seedSizeGram <= 0 || harvestSizeGram <= 0 || growthRatePct <= 0) {
    return 90;
  }
  const ratio = harvestSizeGram / seedSizeGram;
  if (!isFinite(ratio) || ratio <= 1) return 90;
  const logRatio = Math.log(ratio);
  const logGrowth = Math.log(1 + growthRatePct / 100);
  if (!isFinite(logRatio) || !isFinite(logGrowth) || logGrowth === 0) return 90;
  const days = Math.round(logRatio / logGrowth);
  // Clamp ke rentang masuk akal: 30-540 hari (1.5 bulan - 1.5 tahun)
  return clamp(days, 30, 540);
}

// ---------- Fungsi konversi panjang (cm) ↔ berat (gram) ----------
// Berdasarkan rumus length-weight relationship: W = a × L^b
// Sumber: FishBase/SeaLifeBase (Froese & Pauly)

/**
 * Konversi panjang (cm) → berat (gram)
 * W = a × L^b
 */
export function lengthToWeight(lengthCm: number, fish: FishSpecies): number {
  const { a, b } = fish.lengthWeight;
  return a * Math.pow(lengthCm, b);
}

/**
 * Konversi berat (gram) → panjang (cm)
 * L = (W / a)^(1/b)
 */
export function weightToLength(weightGram: number, fish: FishSpecies): number {
  const { a, b } = fish.lengthWeight;
  if (!isFinite(weightGram) || weightGram <= 0 || a <= 0 || b <= 0) return 0;
  const result = Math.pow(weightGram / a, 1 / b);
  return isFinite(result) ? result : 0;
}

export function getFishById(id: string): FishSpecies | undefined {
  return FISH_SPECIES.find((f) => f.id === id);
}

export function getSystemById(id: CultivationSystem): SystemInfo | undefined {
  return SYSTEMS.find((s) => s.id === id);
}

// ---------- Fungsi kualitas air ----------
// Cek apakah parameter kualitas air dalam range ideal (untuk warning)
export interface WaterQualityCheck {
  doWarning: boolean;
  doMessage?: string;
  phWarning: boolean;
  phMessage?: string;
  ammoniaWarning: boolean;
  ammoniaMessage?: string;
  tempWarning: boolean;
  tempMessage?: string;
  salinityWarning: boolean;
  salinityMessage?: string;
  overall: "good" | "warning" | "critical";
}

export function checkWaterQuality(
  fish: FishSpecies,
  params: { do: number; ph: number; ammonia: number; temp: number; salinity: number }
): WaterQualityCheck {
  const wq = fish.waterQuality;
  let doWarning = false,
    phWarning = false,
    ammoniaWarning = false,
    tempWarning = false,
    salinityWarning = false;
  let doMessage: string | undefined,
    phMessage: string | undefined,
    ammoniaMessage: string | undefined,
    tempMessage: string | undefined,
    salinityMessage: string | undefined;
  let critical = false;

  // DO
  if (params.do < wq.doCritical) {
    doWarning = true;
    critical = true;
    doMessage = `DO ${params.do} mg/L di bawah batas kritis (${wq.doCritical} mg/L) — ikan bisa mati. Segera pasang aerator/air mengalir.`;
  } else if (params.do < wq.doRange[0]) {
    doWarning = true;
    doMessage = `DO ${params.do} mg/L di bawah optimal (${wq.doRange[0]}-${wq.doRange[1]} mg/L). Pertumbuhan & nafsu makan menurun.`;
  }

  // pH
  if (params.ph < wq.phCritical[0] || params.ph > wq.phCritical[1]) {
    phWarning = true;
    critical = true;
    phMessage = `pH ${params.ph} di luar batas kritis (${wq.phCritical[0]}-${wq.phCritical[1]}). Ikan stres berat & bisa mati.`;
  } else if (params.ph < wq.phRange[0] || params.ph > wq.phRange[1]) {
    phWarning = true;
    phMessage = `pH ${params.ph} di luar optimal (${wq.phRange[0]}-${wq.phRange[1]}). Metabolisme terganggu.`;
  }

  // Amonia
  if (params.ammonia > wq.ammoniaCritical) {
    ammoniaWarning = true;
    critical = true;
    ammoniaMessage = `Amonia ${params.ammonia} mg/L di atas batas kritis (${wq.ammoniaCritical} mg/L). Keracunan amonia → kematian massal. Ganti 50% air segera.`;
  } else if (params.ammonia > wq.ammoniaMax) {
    ammoniaWarning = true;
    ammoniaMessage = `Amonia ${params.ammonia} mg/L melebihi ambang aman (${wq.ammoniaMax} mg/L). Insang rusak, pertumbuhan lambat.`;
  }

  // Suhu
  if (params.temp < wq.tempCritical[0] || params.temp > wq.tempCritical[1]) {
    tempWarning = true;
    critical = true;
    tempMessage = `Suhu ${params.temp}°C di luar batas kritis (${wq.tempCritical[0]}-${wq.tempCritical[1]}°C). Ikan bisa mati.`;
  } else if (params.temp < wq.tempRange[0] || params.temp > wq.tempRange[1]) {
    tempWarning = true;
    tempMessage = `Suhu ${params.temp}°C di luar optimal (${wq.tempRange[0]}-${wq.tempRange[1]}°C). Pertumbuhan menurun.`;
  }

  // Salinitas (hanya warning untuk udang & ikan euryhaline)
  if (params.salinity < wq.salinityRange[0] || params.salinity > wq.salinityRange[1]) {
    salinityWarning = true;
    salinityMessage = `Salinitas ${params.salinity} ppt di luar rekomendasi (${wq.salinityRange[0]}-${wq.salinityRange[1]} ppt).`;
  }

  return {
    doWarning,
    doMessage,
    phWarning,
    phMessage,
    ammoniaWarning,
    ammoniaMessage,
    tempWarning,
    tempMessage,
    salinityWarning,
    salinityMessage,
    overall: critical ? "critical" : (doWarning || phWarning || ammoniaWarning || tempWarning || salinityWarning) ? "warning" : "good",
  };
}

// ---------- Tabel fase pakan per minggu ----------
export interface WeeklyFeedRow {
  week: number;
  startDay: number;
  endDay: number;
  phase: "starter" | "grower" | "finisher";
  feedPerDayKg: number;
  feedPerWeekKg: number;
  biomassKg: number;
  // Feeding rate (% biomassa/hari)
  feedingRate: number;
  // Estimasi berat ikan rata-rata (gram/ekor) di akhir minggu
  fishWeightGram: number;
}

// Bangun jadwal pakan mingguan
// Asumsi:
// - Feeding rate menurun dari ~5% biomassa/hari (awal) → ~1% (akhir)
// - Fase starter = 30% awal siklus, grower = 60% tengah, finisher = 10% akhir
export function buildWeeklyFeedSchedule(opts: {
  cycleDays: number;
  totalFeedKg: number;
  seedCount: number;
  seedSizeGram: number;
  harvestSizeGram: number;
}): WeeklyFeedRow[] {
  const { totalFeedKg, seedCount } = opts;
  // Clamp semua input ke angka masuk akal — semua harus finite & > 0
  const cycleDays = isFinite(opts.cycleDays) ? Math.max(1, Math.min(540, Math.round(opts.cycleDays))) : 90;
  const seedSizeGram = isFinite(opts.seedSizeGram) && opts.seedSizeGram > 0 ? opts.seedSizeGram : 1;
  const harvestSizeGram = isFinite(opts.harvestSizeGram) && opts.harvestSizeGram > 0 ? opts.harvestSizeGram : 100;
  if (seedCount <= 0 || totalFeedKg <= 0) return [];

  const weeks: WeeklyFeedRow[] = [];
  // Cap totalWeeks ke maksimum 80 (560 hari) — lebih dari itu tidak praktis untuk display.
  const totalWeeks = Math.min(80, Math.max(1, Math.ceil(cycleDays / 7)));

  // Pertumbuhan eksponensial: berat(t) = seedSize × (harvest/seed)^(t/cycleDays)
  // Guard terhadap NaN/Infinity di Math.pow
  const growthExponentBase = harvestSizeGram / seedSizeGram;
  const safeExponentBase = isFinite(growthExponentBase) && growthExponentBase > 0 ? growthExponentBase : 1;

  for (let w = 1; w <= totalWeeks; w++) {
    const startDay = (w - 1) * 7 + 1;
    const endDay = Math.min(w * 7, cycleDays);
    const midDay = (startDay + endDay) / 2;
    const ratio = midDay / cycleDays; // 0..1

    // Berat ikan di akhir minggu (eksponensial)
    const exponent = endDay / cycleDays;
    const rawWeight = Math.pow(safeExponentBase, exponent);
    const fishWeightGram = isFinite(rawWeight) ? rawWeight * seedSizeGram : seedSizeGram;
    const biomassKg = (seedCount * fishWeightGram) / 1000;

    // Feeding rate menurun dari 5% → 1%
    const feedingRate = 5 - 4 * ratio; // 5% awal, 1% akhir

    // Pakan per hari: feedingRate% × biomassa saat itu
    const feedPerDayKg = (biomassKg * feedingRate) / 100;
    const feedPerWeekKg = feedPerDayKg * (endDay - startDay + 1);

    // Fase: 0-30% starter, 30-90% grower, 90-100% finisher
    let phase: "starter" | "grower" | "finisher" = "grower";
    if (ratio < 0.3) phase = "starter";
    else if (ratio > 0.9) phase = "finisher";

    weeks.push({
      week: w,
      startDay,
      endDay,
      phase,
      feedPerDayKg: safeRound(feedPerDayKg, 2),
      feedPerWeekKg: safeRound(feedPerWeekKg, 2),
      biomassKg: safeRound(biomassKg, 2),
      feedingRate: safeRound(feedingRate, 2),
      fishWeightGram: safeRound(fishWeightGram, 1),
    });
  }

  // Skala total pakan agar sum-nya = totalFeedKg (kalibrasi)
  const computedTotal = weeks.reduce((s, w) => s + w.feedPerWeekKg, 0);
  if (computedTotal > 0 && isFinite(computedTotal)) {
    const scale = totalFeedKg / computedTotal;
    if (isFinite(scale)) {
      weeks.forEach((w) => {
        w.feedPerDayKg = safeRound(w.feedPerDayKg * scale, 2);
        w.feedPerWeekKg = safeRound(w.feedPerWeekKg * scale, 2);
      });
    }
  }

  return weeks;
}

// ---------- Kurva pertumbuhan biomassa ----------
export interface GrowthPoint {
  day: number;
  biomassKg: number;
  fishWeightGram: number;
  cumulativeFeedKg: number;
}

// Bangun kurva pertumbuhan biomassa (sample setiap N hari untuk chart)
export function buildGrowthCurve(opts: {
  cycleDays: number;
  seedCount: number;
  survivalRate: number; // %
  seedSizeGram: number;
  harvestSizeGram: number;
  totalFeedKg: number;
  sampleEveryDays?: number;
}): GrowthPoint[] {
  // Clamp semua input ke range aman — anti NaN/Infinity
  const cycleDays = isFinite(opts.cycleDays) && opts.cycleDays > 0 ? Math.min(540, Math.round(opts.cycleDays)) : 90;
  const seedCount = isFinite(opts.seedCount) && opts.seedCount > 0 ? opts.seedCount : 0;
  const survivalRate = isFinite(opts.survivalRate) ? Math.max(0, Math.min(100, opts.survivalRate)) : 80;
  const seedSizeGram = isFinite(opts.seedSizeGram) && opts.seedSizeGram > 0 ? opts.seedSizeGram : 1;
  const harvestSizeGram = isFinite(opts.harvestSizeGram) && opts.harvestSizeGram > 0 ? opts.harvestSizeGram : 100;
  const totalFeedKg = isFinite(opts.totalFeedKg) ? Math.max(0, opts.totalFeedKg) : 0;
  if (seedCount <= 0) return [];

  // Pastikan sampleEveryDays menghasilkan maksimum ~60 titik (lebih dari itu chart berat)
  let sampleEveryDays = opts.sampleEveryDays ?? 7;
  const minStep = Math.max(1, Math.ceil(cycleDays / 60));
  if (sampleEveryDays < minStep) sampleEveryDays = minStep;

  const points: GrowthPoint[] = [];
  const survivors = seedCount * (survivalRate / 100);
  // Guard Math.pow base
  const exponentBase = harvestSizeGram / seedSizeGram;
  const safeBase = isFinite(exponentBase) && exponentBase > 0 ? exponentBase : 1;

  // SR dimulai 100% di hari 0, turun ke survivalRate di hari panen (linear)
  for (let d = 0; d <= cycleDays; d += sampleEveryDays) {
    const dayRatio = d / cycleDays;
    const rawWeight = Math.pow(safeBase, dayRatio);
    const fishWeightGram = isFinite(rawWeight) ? rawWeight * seedSizeGram : seedSizeGram;
    const currentSurvivors = seedCount * (1 - (1 - survivalRate / 100) * dayRatio);
    const biomassKg = (currentSurvivors * fishWeightGram) / 1000;
    const cumulativeFeedKg = (totalFeedKg * dayRatio);
    points.push({
      day: d,
      biomassKg: safeRound(biomassKg, 2),
      fishWeightGram: safeRound(fishWeightGram, 1),
      cumulativeFeedKg: safeRound(cumulativeFeedKg, 2),
    });
  }
  return points;
}

// ---------- Kalkulator profit ----------
export interface ProfitCalc {
  // Input
  seedCostPerUnit: number; // Rp per ekor benih
  feedCostPerKg: number; // Rp per kg pakan
  sellingPricePerKg: number; // Rp per kg ikan panen
  // Output
  totalSeedCost: number; // Rp
  totalFeedCost: number; // Rp
  otherCost: number; // Rp (listrik, obat, dll, default 0)
  totalCost: number; // Rp
  revenue: number; // Rp
  profit: number; // Rp
  profitMargin: number; // %
  breakevenPricePerKg: number; // Rp
  ror: number; // Return on Revenue (profit/revenue)
}

export function calcProfit(opts: {
  seedCount: number;
  totalFeedKg: number;
  harvestBiomassKg: number;
  seedCostPerUnit: number;
  feedCostPerKg: number;
  sellingPricePerKg: number;
  otherCost?: number;
}): ProfitCalc {
  const safe = (v: number, fallback = 0) =>
    isFinite(v) && !isNaN(v) ? v : fallback;

  const seedCount = safe(opts.seedCount);
  const totalFeedKg = safe(opts.totalFeedKg);
  const harvestBiomassKg = safe(opts.harvestBiomassKg);
  const seedCostPerUnit = safe(opts.seedCostPerUnit);
  const feedCostPerKg = safe(opts.feedCostPerKg);
  const sellingPricePerKg = safe(opts.sellingPricePerKg);
  const otherCost = safe(opts.otherCost ?? 0);

  const totalSeedCost = seedCount * seedCostPerUnit;
  const totalFeedCost = totalFeedKg * feedCostPerKg;
  const totalCost = totalSeedCost + totalFeedCost + otherCost;
  const revenue = harvestBiomassKg * sellingPricePerKg;
  const profit = revenue - totalCost;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const breakevenPricePerKg = harvestBiomassKg > 0 ? totalCost / harvestBiomassKg : 0;
  const ror = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    seedCostPerUnit,
    feedCostPerKg,
    sellingPricePerKg,
    totalSeedCost: Math.round(totalSeedCost),
    totalFeedCost: Math.round(totalFeedCost),
    otherCost,
    totalCost: Math.round(totalCost),
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    profitMargin: Math.round(profitMargin * 100) / 100,
    breakevenPricePerKg: Math.round(breakevenPricePerKg),
    ror: Math.round(ror * 100) / 100,
  };
}
