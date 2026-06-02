import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Termo de Autorização de Uso de Imagem — LPX Marketing",
  description:
    "Assine o Termo de Autorização de Uso de Imagem da LPX Marketing de forma rápida e segura.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
