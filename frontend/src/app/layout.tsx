import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "MECHHAND // Cybernetic Chrome & Hand Articulations",
  description: "Futuristic kinetic chrome hardware, liquid alloy ornaments, and cybernetic hand adornments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={syne.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-black text-white antialiased font-sans">
        <Header />
        <main className="w-full min-h-screen">{children}</main>
      </body>
    </html>
  );
}
