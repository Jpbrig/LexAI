import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexAI — Assistente Jurídico com Inteligência Artificial",
  description:
    "Monitore processos judiciais automaticamente com IA. Consulte o DataJud, receba alertas de movimentações e obtenha resumos inteligentes de decisões. Para advogados brasileiros.",
  keywords: ["advogado", "processo judicial", "datajud", "cnj", "inteligência artificial", "jurídico", "brasil"],
  authors: [{ name: "LexAI" }],
  openGraph: {
    title: "LexAI — Assistente Jurídico com IA",
    description: "Automatize o acompanhamento de processos judiciais com Inteligência Artificial.",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
