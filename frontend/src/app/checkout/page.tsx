import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Private Salon Checkout — Shree Rani Gehna",
  description: "Secure live bullion rate locked checkout for luxury diamond and gold jewellery orders.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
