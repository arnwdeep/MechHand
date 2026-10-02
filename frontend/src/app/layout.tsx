import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  Pinyon_Script,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import EditorialFooter from "@/components/EditorialFooter";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
});

const fontVars = [cormorant, cinzel, jakarta, pinyon]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: {
    default: "Shree Rani Gehna — Haute Joaillerie & Live Rate Jewellery",
    template: "%s · Shree Rani Gehna",
  },
  description:
    "Sculptural diamond and gold jewellery priced live at the day's metal rate with transparent artisan price breakdown.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVars} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1816]">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <EditorialFooter />
        </CartProvider>
      </body>
    </html>
  );
}
