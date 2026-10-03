import type { Metadata } from "next";
import { Cormorant_Garamond, Pinyon_Script, Italiana } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
});


export const metadata: Metadata = {
  title: "MECHHAND // Cybernetic Chrome & Hand Articulations",
  description: "Futuristic kinetic chrome hardware, liquid alloy ornaments, and cybernetic hand adornments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${pinyon.variable} ${italiana.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-black text-white antialiased font-sans">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="w-full min-h-screen">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
