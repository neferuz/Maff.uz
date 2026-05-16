import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { APP_CONFIG } from "@/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShopProvider } from "@/context/shop-context";
import { ThemeProvider } from "@/context/theme-context";

const evolventa = localFont({
  src: [
    {
      path: "../fonts/evolventa/Evolventa-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/evolventa/Evolventa-Oblique.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/evolventa/Evolventa-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/evolventa/Evolventa-BoldOblique.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-evolventa",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: APP_CONFIG.name,
    template: `%s | Maff.uz`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "Maff", 
    "ламинат Ташкент", 
    "купить ламинат в Узбекистане", 
    "паркет Ташкент", 
    "кварцвинил", 
    "межкомнатные двери Ташкент", 
    "напольные покрытия", 
    "дизайн интерьера Ташкент",
    "Kronopol",
    "рассрочка на двери",
    "ламинат в кредит"
  ],
  authors: [{ name: "Maff.uz" }],
  creator: "Maff.uz",
  publisher: "Maff.uz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: "Maff.uz",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maff.uz — Салон напольных покрытий и дверей",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={evolventa.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (!theme && supportDarkMode) theme = 'dark';
                if (!theme) theme = 'light';
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            })();
          `,
        }} />
      </head>
      <body className="antialiased transition-colors duration-300 bg-[var(--bg)] text-[var(--text-primary)]">
        <ThemeProvider>
          <ShopProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
