"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98290 12345",
    addressLine1: "Flat 402, Royal Palms Residency",
    addressLine2: "Civil Lines, Near Raj Mandir",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wire">("upi");
  const [upiId, setUpiId] = useState("aarav@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8921");
  const [expiry, setExpiry] = useState("08/28");
  const [cvv, setCvv] = useState("•••");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Live Bullion Rate Lock Countdown Timer (15 minutes)
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const discount = promoApplied ? Math.round(subtotal * 0.05) : 0;
  const finalTotal = subtotal - discount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "ROYAL1914" || promoCode.trim().toUpperCase() === "HERITAGE") {
      setPromoApplied(true);
    } else {
      alert("Invalid Atelier Code. Try 'ROYAL1914' for VIP Salon privilege.");
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      clearCart();
      router.push("/checkout/success");
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="w-full bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="text-center max-w-md space-y-4">
          <h1
            className="text-3xl font-normal italic font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Your Atelier Bag is Empty
          </h1>
          <p className="text-xs text-[#5B564F]">
            Select a bespoke diamond or gold masterpiece to proceed with live bullion rate checkout.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors"
          >
            Explore The Collection &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] pt-24 sm:pt-28 pb-24">
      {/* Top Banner */}
      <div className="px-5 sm:px-10 lg:px-12 py-6 border-b border-black/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
            CONFIDENTIAL ATELIER DESPATCH
          </span>
          <h1
            className="text-3xl sm:text-4xl font-normal italic tracking-wide text-[#1A1816] font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Private Salon Checkout
          </h1>
        </div>

        {/* Live Gold Rate Lock Pill */}
        <div className="flex items-center gap-3 bg-[#F4F1EA] border border-black/15 px-4 py-2 rounded-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2A6E48] animate-pulse" />
          <div className="text-xs">
            <span className="text-[#8C857B] uppercase tracking-wider block text-[10px]">
              Live Rate Locked
            </span>
            <span className="font-mono font-semibold tabular">{formatTimer(secondsLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 w-full border-b border-black/15">
        {/* Left Column: Delivery & Payment Details (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 space-y-10 border-b lg:border-b-0 lg:border-r border-black/15">
          {/* Step 1: Client Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-black/10 pb-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1816] text-[#FAF8F5] text-xs flex items-center justify-center font-mono">
                1
              </span>
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1816]">
                Client &amp; Certificate Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  Full Legal Name (For BIS Hallmark Registry)
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  Email (For Tax Invoice &amp; Diamond Report)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  Mobile Phone (For WhatsApp Insured OTP)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans tabular"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Insured Delivery Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-black/10 pb-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1816] text-[#FAF8F5] text-xs flex items-center justify-center font-mono">
                2
              </span>
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1816]">
                Insured Armoured Courier Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  Flat / Suite / House / Building
                </label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  Street Address &amp; Landmark
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F]">
                  PIN Code (Pan-India Insured)
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-white/70 border border-black/20 px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-mono tabular"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-black/10 pb-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1816] text-[#FAF8F5] text-xs flex items-center justify-center font-mono">
                3
              </span>
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1816]">
                Secure Payment Channel
              </h2>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: "upi", label: "Instant UPI" },
                { id: "card", label: "Credit/Debit Card" },
                { id: "netbanking", label: "Net Banking" },
                { id: "wire", label: "RTGS / Wire" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-3 px-2 border rounded-xs uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                      : "border-black/20 bg-white/50 text-[#1A1816] hover:border-black"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Selected Method Details */}
            <div className="p-4 bg-white/80 border border-black/15 rounded-xs text-xs space-y-3">
              {paymentMethod === "upi" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F] block">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okaxis / mobile@upi"
                      className="flex-1 bg-transparent border border-black/30 px-3 py-2 rounded-xs focus:outline-none focus:border-black font-mono"
                    />
                    <button
                      type="button"
                      className="bg-[#2A6E48] text-white px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-xs"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8C857B]">
                    Supported: Google Pay, PhonePe, Paytm, BHIM, Cred UPI. Instant payment request will be sent.
                  </p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F] block">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-transparent border border-black/30 px-3 py-2 rounded-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F] block">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-transparent border border-black/30 px-3 py-2 rounded-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F] block">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-transparent border border-black/30 px-3 py-2 rounded-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#5B564F] block">
                    Choose Bank Portal
                  </label>
                  <select className="w-full bg-transparent border border-black/30 px-3 py-2 rounded-xs text-xs font-sans">
                    <option>HDFC Bank Corporate / Retail</option>
                    <option>ICICI Bank Wealth Management</option>
                    <option>State Bank of India (SBI)</option>
                    <option>Axis Bank Private Banking</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === "wire" && (
                <div className="text-xs space-y-1.5 text-[#5B564F]">
                  <p className="font-semibold text-black">Atelier RTGS / Bank Wire Account:</p>
                  <p>Bank: HDFC Bank, MI Road Branch, Jaipur</p>
                  <p>A/C Name: Shree Rani Gehna Jewellers Pvt Ltd</p>
                  <p>IFSC: HDFC0000054 &bull; A/C: 50200019140088</p>
                  <p className="text-[10px] text-[#8C857B]">
                    Orders above ₹5,00,000 can be settled directly via bank wire with instant proof upload.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Transparent Price Lock (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 bg-[#F4F1EA] space-y-8">
          <div>
            <h2
              className="text-2xl font-normal italic tracking-wide font-serif border-b border-black/10 pb-2"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Order Breakdown &bull; {items.length} {items.length === 1 ? "Piece" : "Pieces"}
            </h2>

            {/* Items summary */}
            <div className="divide-y divide-black/10 py-4 space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex gap-4">
                  <div className="relative w-16 h-16 bg-white/70 border border-black/10 rounded-xs shrink-0 overflow-hidden flex items-center justify-center p-1">
                    <Image src={item.imageSrc} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-semibold leading-snug">{item.name}</h4>
                      <span className="text-xs font-semibold tabular">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C857B] uppercase tracking-wider mt-0.5">
                      {item.purity} {item.metal} &bull; Qty: {item.quantity} {item.size && `• Size ${item.size}`}
                    </p>
                    {item.engraving && (
                      <p className="text-[10px] text-[#9E8056] italic">
                        Engraving: &ldquo;{item.engraving}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code Box */}
          <div className="border-t border-black/10 pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="VIP Atelier Code (e.g. ROYAL1914)"
                className="flex-1 bg-white/70 border border-black/20 px-3 py-2 text-xs rounded-xs uppercase font-mono placeholder:text-muted/50"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-black cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <p className="text-[11px] text-[#2A6E48] font-medium mt-1">
                &check; VIP Privilege Code &lsquo;ROYAL1914&rsquo; applied (5% atelier courtesy).
              </p>
            )}
          </div>

          {/* Transparent Money Math Table */}
          <div className="space-y-2 border-t border-black/10 pt-4 text-xs">
            <div className="flex justify-between text-[#5B564F]">
              <span>Subtotal (Net Metal + Diamonds + Making)</span>
              <span className="tabular">{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#2A6E48] font-medium">
                <span>VIP Courtesy Discount</span>
                <span className="tabular">&minus; {formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#5B564F]">
              <span>GST (3% Indian Standard)</span>
              <span className="text-[10px] text-[#2A6E48] font-medium uppercase">Included</span>
            </div>
            <div className="flex justify-between text-[#5B564F]">
              <span>Armoured Express Delivery &amp; Insurance</span>
              <span className="text-[10px] text-[#2A6E48] font-medium uppercase">Complimentary</span>
            </div>

            <div className="flex justify-between text-base font-semibold pt-3 border-t border-black/10 text-black">
              <span>Grand Total</span>
              <span className="tabular text-lg">{formatINR(finalTotal)}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin text-sm">&bull;</span>
                  <span>Connecting to Live Secure Bullion Gateway...</span>
                </>
              ) : (
                <span>Confirm &amp; Place Order &bull; {formatINR(finalTotal)}</span>
              )}
            </button>

            <div className="text-[10px] text-center text-[#8C857B] space-y-1">
              <p>&bull; 100% Insured Transit by BVC / Sequel Logistics</p>
              <p>&bull; Official BIS Hallmark Seal &bull; GIA/IGI Diamond Report Included</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
