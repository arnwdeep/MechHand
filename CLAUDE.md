# CLAUDE.md — Shree Rani Gehna

Build guide for Claude Code. This project is a **jewellery e-commerce platform** with **live, rate-based pricing**. Read this whole file before writing code. The **pricing engine and payment flow are the highest-risk parts — they handle money and must be exactly correct and fully tested.**

---

## Project overview

- **Client:** Shree Rani Gehna, an Indian family jeweller.
- **What it does:** sells jewellery online where **prices are computed live** from the day's metal rate (not stored as fixed prices), shown with a **full price breakup**.
- **Launch scope (build this first):** **only diamond jewellery** — diamonds set in **gold** and in **silver**. Plain gold / plain silver are a later addition; keep the engine and catalogue **parameterized** so they slot in without a rewrite.
- **Out of scope for now:** international shipping/multi-currency (future Phase 5).
- **Market:** India only. Currency: **INR (₹)**, `en-IN` digit grouping.

Frontend functionality is specified separately (see `Frontend-Functionality-Spec.md`). This file governs the full project but focuses on backend + the money logic; the frontend must conform to the API contract below.

---

## Tech stack

- **Backend:** FastAPI (Python), PostgreSQL (Neon), Redis (Upstash), Cloudflare R2 (media).
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel.
- **Payments:** Razorpay. **Auth:** phone OTP + Google. **Messaging:** WhatsApp Business API.
- Deploy backend on Railway/Render.

Suggested repo layout:
```
/backend      FastAPI app
  /pricing    isolated pricing engine module (+ its tests)
  /models     SQLAlchemy models
  /api        routers
  /services   razorpay, whatsapp, invoice, auth
/frontend     Next.js app
```

---

## THE PRICING ENGINE (locked — build exactly this)

One **isolated, pure, config-driven, heavily unit-tested** module. It takes a product + the day's rates + config and returns a full price breakup. **It must not read the DB or have side effects** — pass data in, get a result out.

### Formula (confirmed with client)

For a piece:
```
metal_value   = daily_rate[metal, purity] × net_weight_grams
diamond_value = per-piece value entered by owner (editable anytime; 0 if none)
making        = making_rate × gross_weight_grams          # making_rate default 1100, editable per piece
subtotal      = metal_value + diamond_value + making
gst           = subtotal × 0.03                            # 3%
total         = subtotal + gst
```
- **Gold value uses NET weight; making/labour uses GROSS weight.** Every product stores both.
- **No wastage** in the formula.
- Silver pieces follow the same shape (silver rate × net weight + making + 3% GST).
- Rates are **per purity** (18K rate, 22K rate, 14K rate, silver rate). The engine
  **never derives a rate at pricing time** — it looks up an explicit rate row for the
  product's exact (metal, purity), or reports the price unavailable.
- **Entering** rates may start from one pure-metal rate ("100 touch" — 24K gold, 999
  silver). `pricing/purity.py` turns it into suggested per-purity rates (18K = 18/24,
  22K = 22/24, 925 = 0.925); the owner reviews and may edit each one, and they are then
  saved as ordinary per-purity rows. Derivation happens when a rate is **set**, never
  when a price is **computed**, so every price still traces to a rate a person approved
  and a later change to these ratios cannot move a past sale.

### Reference implementation (pseudocode)

```python
def compute_price(product, rates, config) -> PriceResult:
    rate = rates.get((product.metal, product.purity))   # e.g. ("gold","18K")
    if rate is None:
        return PriceResult(rate_available=False, total=None, breakup=[])

    metal_value   = rate * product.net_weight_grams
    diamond_value = product.diamond_value or 0
    making_rate   = product.making_rate or config.default_making_rate   # 1100
    making        = making_rate * product.gross_weight_grams

    subtotal = metal_value + diamond_value + making
    gst      = subtotal * config.gst_rate               # 0.03
    total    = round_amount(subtotal + gst, config.rounding)

    metal_label = "Gold value" if product.metal == "gold" else "Silver value"
    breakup = [{"label": metal_label, "amount": metal_value}]
    if diamond_value > 0:
        breakup.append({"label": "Diamond value", "amount": diamond_value})
    breakup.append({"label": "Making", "amount": making})
    breakup.append({"label": "GST 3%", "amount": gst})

    return PriceResult(rate_available=True, total=total, breakup=breakup, currency="INR")
```

Config object: `{ gst_rate: 0.03, default_making_rate: 1100, rounding: <see open items> }`.

### Unit-test cases (the engine must pass these)

**A — Diamond gold ring (18K).** rate(gold,18K)=₹6,000/g; net=3.000g; diamond_value=₹13,800 (=60,000×0.230); gross=3.500g; making_rate=1100.
→ metal 18,000 · diamond 13,800 · making 3,850 · subtotal 35,650 · GST 1,069.50 · **total 36,719.50**

**B — Silver diamond piece.** rate(silver)=₹90/g; net=10.0g; diamond_value=₹5,000; gross=11.0g; making 1100.
→ silver 900 · diamond 5,000 · making 12,100 · subtotal 18,000 · GST 540 · **total 18,540.00**

**C — No rate set today.** rates has no (gold,18K) → `rate_available=False`, total=None. Storefront must hide price + disable buy.

**D — Custom making rate.** Same as A but making_rate=1500 → making 5,250 · subtotal 37,050 · GST 1,111.50 · **total 38,161.50**

**E — No diamond (future plain-gold case).** diamond_value=0 → breakup omits the Diamond line; metal + making + GST only.

Also test: zero/negative weight rejected; missing purity handled; making_rate=0 allowed; rounding applied consistently.

---

## Data model (core tables)

- **users** — id, phone, email, name, google_id, created_at.
- **metal_rates** — id, metal, purity, rate_per_gram, effective_date, created_at. **APPEND-ONLY** — never UPDATE; insert a new row each time; queries read the latest row per (metal, purity). This keeps every past sale's rate provable.
- **products** — id, name, slug, `type` (`catalogue`|`made_to_order`|`diamond`), metal, purity, **net_weight_grams**, **gross_weight_grams**, **diamond_value** (nullable), **making_rate** (nullable → falls back to config 1100), category, occasion[], images[], videos[], in_stock, quantity, created_at, updated_at. **Never store computed price.**
- **orders** — id, user_id, status, total, **price_snapshot (JSON: breakup + rate + timestamp)**, razorpay_order_id, payment_status, invoice_url, created_at.
- **order_items** — order_id, product_id, price_snapshot (JSON), qty.
- **reviews** — id, product_id, user_id, rating, text, approved, created_at.
- **consultations** — id, name, phone, product_id, preferred_datetime, message, status, created_at.

---

## Redis usage

- **Price-lock snapshot** — on add-to-cart, compute the price and store the full snapshot (breakup + rate + timestamp) under a key with a **TTL**. The Razorpay order is created from this snapshot, never a fresh recompute. This protects the customer if the owner updates the rate mid-session (a single rate update re-prices the whole catalogue).
- **Stock reservation** — reserve the item in Redis on add-to-cart (with TTL) so a one-of-a-kind piece can't be sold twice. Release on payment failure/timeout; commit on success.

---

## Purchase & payment flow (build exactly)

1. View product → engine computes live price (or "unavailable" if no rate today).
2. Add to cart → **write price-lock snapshot (TTL) + reserve stock in Redis.**
3. Checkout → login (OTP/Google) + address.
4. **Create Razorpay order from the snapshot amount** (not a recompute).
5. Customer pays.
6. **Razorpay webhook → backend confirms.** Settlement is driven by the **webhook, not the browser redirect.** Handler must be **idempotent** (duplicate webhooks must not create duplicate orders/invoices).
7. On success: create order, commit stock, generate **GST invoice PDF**, send **WhatsApp** confirmation + invoice.
8. On failure/timeout: release the Redis stock reservation; snapshot expires with its TTL.

---

## API contract (backend ↔ frontend)

- `POST /admin/rates` — set today's rate for a (metal, purity) [admin auth]. One place updates gold/silver → all prices recompute.
- `GET /rates/today` — current rates; frontend uses to detect the no-rate state.
- `GET /products`, `GET /products/{slug}` — product + computed `price` (PriceResult) or `price: null`.
- `POST /cart/add` — creates price-lock snapshot + stock reservation; returns snapshot.
- `POST /checkout/order` — creates Razorpay order from snapshot; returns razorpay_order_id.
- `POST /webhooks/razorpay` — idempotent settlement.
- `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/google`.
- `GET /orders`, `GET /orders/{id}`; `POST /reviews`, `GET /products/{id}/reviews`; `POST /consultations`.

**PriceResult shape** (matches the frontend spec):
```
{ total: number|null, currency: "INR",
  breakup: [{label, amount}], rate_available: boolean }
```

---

## Product paths (PDP behaviour)

- `catalogue` → instant buy (add to cart / buy now).
- `made_to_order` → consultation/quote flow (no direct buy).
- `diamond` → owner sets diamond value per piece; sells as catalogue OR consultation for high-value pieces (owner's choice per product).

At launch, diamond pieces are the catalogue. Owner enters **net weight, gross weight, and diamond value** per piece; gold/silver value and making auto-compute from the daily rate.

---

## Stale-rate rule (must implement)

If no rate row exists for today for a product's (metal, purity): the API returns `price: null` / `rate_available: false`, the storefront **hides prices and disables buying**, and the **admin shows a loud warning** to set today's rate. Never show a stale or zero price.

---

## Build order (mirrors the 4 phases)

1. **P1 — Foundation:** repo + CI, schema, **pricing engine + all unit tests above**, admin daily-rate screen (18K/14K/silver). Exit: owner's hand-calc == system output.
2. **P2 — Storefront:** catalogue + filters, PDP with live price breakup, R2 media pipeline (image + video), SSR + JSON-LD, baby/gifting section structure.
3. **P3 — Commerce:** OTP + Google auth, cart + Redis price-lock + stock reservation, Razorpay order → idempotent webhook, GST invoice PDF, reviews.
4. **P4 — Launch:** consultation/enquiry flow, chatbot, WhatsApp updates, launch on .com, owner handover.

---

## Conventions & guardrails

- **All money math is server-side.** The frontend only *displays* prices and *opens* Razorpay checkout — it never computes or confirms a price.
- The **pricing engine stays pure and isolated** with no DB/network calls; test it in isolation.
- **`metal_rates` is append-only.** Never update or delete a rate row.
- **Never persist a computed price** on a product; always compute from the current rate.
- Payment settlement is **webhook-driven and idempotent**.
- All secrets (DB, Redis, R2, Razorpay keys, WhatsApp) via **environment variables**, never committed.
- Format currency with `Intl.NumberFormat('en-IN')` (frontend) / equivalent (backend/invoice).
- Type-share the PriceResult / Product shapes between backend and frontend where possible.

---

## Open items to confirm (don't hardcode a guess)

- **Rounding rule:** total rounding not yet specified by client — make it a config value (`rounding`), default to 2 decimals, and confirm whether the client wants **nearest rupee**. Keep it in one place so it's a one-line change.
- **Plain gold/silver making rate** — deferred until non-diamond stock is added.
- **Whether the standard fineness ratios match the client's selling practice.** The
  derivation defaults to the metallurgical ratio (22K = 22/24 of pure), but jewellers
  often quote 22K slightly differently. The owner can edit any derived figure before
  saving, so a mismatch is visible rather than silent — but confirm the intended ratios.
- **Baby/newborn section stock** at launch (often plain silver, which is deferred) — confirm whether it opens with the diamond range or later.
