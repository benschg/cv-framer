import type { Metadata } from "next";
import {
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Source_Sans_3,
  Work_Sans,
  Merriweather,
  Playfair_Display,
  PT_Serif
} from "next/font/google";
import "@/styles/globals.css";
import "@/styles/cv.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-lato",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-pt-serif",
});

export const metadata: Metadata = {
  title: "CV Builder - Create Professional CVs",
  description:
    "Build stunning, job-winning CVs with AI-powered customization. Use the Werbeflaechen self-marketing framework to showcase your best self.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable}
          ${roboto.variable}
          ${openSans.variable}
          ${lato.variable}
          ${montserrat.variable}
          ${sourceSans.variable}
          ${workSans.variable}
          ${merriweather.variable}
          ${playfair.variable}
          ${ptSerif.variable}
          font-sans antialiased
        `}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
