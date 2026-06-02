import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Contrato de Licença e Cessão de Uso de Imagem — LPX",
  description:
    "Assine o Contrato de Licença e Cessão de Uso de Imagem da LPX Consultoria e Intermediação Ltda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${urbanist.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
