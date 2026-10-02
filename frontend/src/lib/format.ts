/**
 * Display formatting. en-IN digit grouping throughout: ₹36,719.50, not ₹36,719.50
 * with western grouping — Indian grouping is 2,2,3 (₹6,55,852.50).
 */

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plain = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹36,719.50 */
export function formatINR(amount: number): string {
  return rupees.format(amount);
}

/** 36,719.50 — for table columns where the ₹ sits in the header. */
export function formatAmount(amount: number): string {
  return plain.format(amount);
}

/** 3.5 g */
export function formatGrams(grams: number): string {
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(grams)} g`;
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
