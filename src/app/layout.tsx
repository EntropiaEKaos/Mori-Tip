import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Mori — Rede social de pousadas e viagens",
  description:
    "Descubra pousadas incríveis, compartilhe fotos com filtros, participe de lives e converse com anfitriões.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full bg-[#fdfaf4] text-[#0f0f11] antialiased selection:bg-[#c5a84a]/20">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
