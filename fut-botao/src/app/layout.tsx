import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Futebol de Botão Online",
  description: "O clássico jogo de futebol de botão agora online! Jogue com seus amigos com times do Athletico, Coritiba, Flamengo, São Paulo, Grêmio, Sport e Vasco.",
  keywords: ["futebol de botão", "jogo online", "futebol", "button football"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 font-sans">{children}</body>
    </html>
  );
}
