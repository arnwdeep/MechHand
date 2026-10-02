"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/format";

/**
 * The buy / enquire action.
 *
 * Cart, price-lock and checkout are Phase 3 work, so the button says what it
 * will do rather than pretending to do it. Nothing here decides a price — it
 * only echoes the total the server already computed.
 */
export default function BuyPanel({ product }: { product: Product }) {
  const [clicked, setClicked] = useState(false);
  const madeToOrder = product.type === "made_to_order";

  if (!product.price) {
    return (
      <div className="mt-6">
        <button
          disabled
          className="w-full bg-line text-muted py-4 rounded-full text-sm cursor-not-allowed"
        >
          Unavailable today
        </button>
        <p className="mt-3 text-xs text-muted text-center leading-relaxed">
          Today&apos;s {product.purity} rate hasn&apos;t been set, so this piece
          can&apos;t be priced or bought yet. Nothing stale is ever shown.
        </p>
      </div>
    );
  }

  if (!product.in_stock) {
    return (
      <button
        disabled
        className="mt-6 w-full bg-line text-muted py-4 rounded-full text-sm cursor-not-allowed"
      >
        Sold
      </button>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setClicked(true)}
        className="w-full bg-ink text-cream py-4 rounded-full text-sm hover:bg-gold transition-colors"
      >
        {madeToOrder ? "Book a consultation" : "Add to cart"}
      </button>

      {clicked && (
        <p className="mt-3 text-xs text-muted bg-cream/70 border border-line rounded-lg px-4 py-3 leading-relaxed">
          {madeToOrder ? (
            <>
              The enquiry form and WhatsApp follow-up arrive in Phase 4. For this
              piece the team would call you to discuss the design and confirm a quote.
            </>
          ) : (
            <>
              Cart and checkout arrive in Phase 3. At that point adding this piece
              locks {formatINR(product.price.total!)} for you, so a rate change while
              you&apos;re paying can&apos;t move the amount.
            </>
          )}
        </p>
      )}
    </div>
  );
}
