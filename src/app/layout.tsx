import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { BackgroundSync } from "@/components/pwa/background-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalikan - Kalkulator Ikan & Padat Tebar",
  description:
    "Hitung padat tebar ikan untuk kolam persegi, bulat, atau KJA Sungai. Estimasi produksi: biomassa panen, kebutuhan pakan, dan protein. Mendukung lele, nila, patin, gurame, dan ikan mas.",
  keywords: [
    "kalkulator ikan",
    "kalikan",
    "padat tebar ikan",
    "kalkulator budidaya ikan",
    "budidaya lele",
    "kolam biofloc",
    "kalkulator pakan ikan",
    "estimasi panen ikan",
    "lele",
    "nila",
    "patin",
    "gurame",
    "ikan mas",
  ],
  authors: [{ name: "Kalikan" }],
  manifest: "/manifest.json",
  applicationName: "Kalikan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kalikan",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon-32.png"],
  },
  openGraph: {
    title: "Kalikan - Kalkulator Ikan & Padat Tebar",
    description:
      "Hitung padat tebar ikan & estimasi produksi untuk kolam persegi, bulat, atau KJA Sungai.",
    siteName: "Kalikan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalikan - Kalkulator Ikan & Padat Tebar",
    description:
      "Hitung padat tebar ikan & estimasi produksi untuk kolam persegi, bulat, atau KJA Sungai.",
  },
};

// Viewport untuk PWA mobile (theme-color, viewport-fit)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#0d4f3c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kalikan" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <OfflineIndicator />
          {children}
          <Toaster />
          <InstallPrompt />
          <ServiceWorkerRegister />
          <BackgroundSync />
        </ThemeProvider>
      </body>
    </html>
  );
}
