import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatGrams, formatINR, titleCase } from "@/lib/format";
import JewelIllustration from "./JewelIllustration";

export default function ProductCard({ product }: { product: Product }) {
  const madeToOrder = product.type === "made_to_order";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-[#F4F1EA] p-4 sm:p-5 rounded-lg border border-line/60 hover:border-ink/40 transition-all duration-300"
    >
      <div className="relative aspect-3/4 flex items-center justify-center mb-4 overflow-hidden rounded-md bg-white/40">
        <JewelIllustration category={product.category} className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-105" />
        {madeToOrder && (
          <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest font-medium bg-ink text-ivory px-2 py-0.5 rounded-xs">
            Made to Order
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest font-medium bg-ivory text-muted px-2 py-0.5 rounded-xs">
            Sold Out
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-line/50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-ink uppercase group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <p className="text-[11px] text-muted tracking-wide uppercase mt-0.5">
              {titleCase(product.metal)} {product.purity} &bull; {formatGrams(product.gross_weight_grams)}
            </p>
          </div>

          <div className="text-right shrink-0">
            {product.price ? (
              <div className="text-xs font-medium text-ink tracking-wider tabular">
                {formatINR(product.price.total!)}
              </div>
            ) : (
              <div className="text-[11px] text-warn font-medium uppercase tracking-wider">
                On Request
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
