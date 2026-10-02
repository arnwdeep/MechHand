# Shree Rani Gehna

Jewellery e-commerce with **live, rate-based pricing**. No price is ever stored —
every price is computed from the day's metal rate and shown with a full breakup.

See [CLAUDE.md](CLAUDE.md) for the full build guide and the locked pricing formula.

**Status: Phase 1 (Foundation) complete.** Pricing engine, schema, and the
admin daily-rate API are built and tested. Phase 2 (storefront) is next.

---

## Quick start

Two terminals.

**Backend** (port 8000):

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"

./scripts/dev_db.sh start     # local Postgres + migrations + demo catalogue
.venv/bin/uvicorn main:app --reload --port 8000
```

`dev_db.sh` runs a throwaway Postgres on port 55433 in `backend/.devdb`. It does
not touch any Postgres you already have — on this machine port 5432 is held by a
password-protected EDB install. `stop`, `reset` and `url` do what they say.

**Frontend** (port 3000):

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Then open <http://localhost:3000>.

Interactive API docs: <http://localhost:8000/docs>

## Recording the demo

A three-minute arc that shows the whole value proposition. Both servers running.

**1. Start from an empty morning.**

```bash
cd backend && ./scripts/dev_db.sh demo
```

The catalogue now looks like it does before the owner sets the day's rate:
every piece reads **“price on request”**, the buy buttons are disabled, and a
strip across the top names exactly which rates are missing. Open
<http://localhost:3000/products> and show this first — it is the guarantee that
a customer can never be quoted yesterday's gold price.

**2. Show the owner's screen.** <http://localhost:3000/admin/rates> — one table,
a loud warning, and a single form. Point out that this is the *only* screen that
moves prices.

**3. Set the 18K rate to ₹6,000.** The warning clears, the strip fills in, and
every 18K piece in the catalogue now has a price. Nothing was edited on any
product — no price is stored anywhere.

**4. Open a piece.** <http://localhost:3000/products/diamond-solitaire-ring>
shows the full breakup: gold value on net weight, the diamond value, making on
gross weight, GST at 3%, total **₹36,719.50** — the client's own hand
calculation.

**5. Or set every purity from one number.** On the owner screen, "From one pure
rate" → enter ₹8,000/g for pure gold → it works out 22K ₹7,333.33, 18K ₹6,000.00,
14K ₹4,666.67, each row showing how many pieces it affects. Tick, adjust, save.

**6. Change 18K to ₹6,800 and go back.** The ring becomes ₹39,191.50 and the
necklace ₹6,75,628.50, while the 14K, 22K and silver pieces do not move at all,
because rates are held per purity. This is the moment worth recording.

**7. Show the history.** Back on the owner screen: both rates are still there.
Rate rows are append-only, so the rate behind every past sale stays provable.

To get back to a full catalogue afterwards, run `./scripts/dev_db.sh start`.

## Checking the engine against a hand calculation

<http://localhost:8000/dev/calculator> — **needs no database.** Type in a
piece's weights and the day's rate and it shows the breakup the customer would
see. One-click presets load the five locked spec cases and tell you whether the
engine still agrees with the client's hand calculation:

```
Case A · Diamond gold ring 18K   → ✓ matches the client's hand calculation (₹36,719.50)
```

The page does no arithmetic. It posts to `/dev/price-preview`, which calls the
same `compute_price` the storefront uses, so what you check is the real engine
and not a copy of it. Leaving the rate blank reproduces the no-rate state, and
the rounding dropdown previews what nearest-rupee would do without editing
`.env`.

Not mounted when `APP_ENV=production`.

## Tests

```bash
cd backend

# The money logic — pure, no DB needed. Run this constantly.
.venv/bin/python -m pytest pricing/tests -v

# API + schema tests need a throwaway Postgres (JSONB, ARRAY, and the
# append-only trigger have no SQLite equivalent). They skip without this var.
createdb srg_test
TEST_DATABASE_URL=postgresql+psycopg://localhost/srg_test \
  .venv/bin/python -m pytest tests -v
```

CI runs both on every push, with lint.

---

## Where the money logic lives

```
backend/pricing/          the engine — pure, no DB, no network, no clock
  engine.py               compute_price(product, rates, config) -> PriceResult
  types.py                PricingProduct, RateTable, PriceResult, validation
  rounding.py             the one place the rounding rule is decided
  tests/test_engine.py    spec cases A-E + edge cases
backend/services/
  pricing_service.py      the ONLY adapter from a DB row to the engine
  rates.py                reads/writes metal_rates (insert-only)

frontend/src/
  lib/types.ts            mirrors backend/api/schemas.py
  lib/format.ts           en-IN currency formatting — the only "math" here
  components/             PriceBreakup, ProductCard, RateManager, RateStrip
  app/products/[slug]/    PDP, server-rendered with JSON-LD
  app/admin/rates/        the daily-rate screen
  app/api/admin/rates/    proxy that keeps the admin key server-side
```

The frontend contains **no pricing arithmetic at all** — not even summing the
breakup lines to check a total. It renders `PriceResult` and nothing more. Pages
fetch with `cache: "no-store"`, so a rate change is visible on the next request
and a price can never be served from a stale cache.

The engine takes data in and returns a result. It cannot read the database,
call out to anything, or look at the clock. That is what makes it testable in
isolation, and the tests are the contract with the client's hand calculation.

### The formula

```
metal_value   = daily_rate[metal, purity] x net_weight_grams     # NET weight
diamond_value = per-piece value entered by the owner
making        = making_rate x gross_weight_grams                 # GROSS weight
subtotal      = metal_value + diamond_value + making
gst           = subtotal x 0.03
total         = subtotal + gst
```

Gold/silver value uses **net** weight; making uses **gross**. No wastage.
Rates are looked up per purity (22K, 18K, 14K, 925). The engine never derives a
rate while pricing — it finds an explicit rate row for the piece's exact purity,
or reports the price unavailable.

### Setting rates from one pure-metal rate

The owner can type a single **pure gold rate** ("100 touch" / 24K) and the system
works out 22K, 18K, 14K and the rest. Two things keep this safe:

1. **It is derived when the rate is set, never when a price is computed.** The
   engine still looks up an explicit rate row for a product's exact purity. Every
   price traces to a rate a person approved, and changing the ratios later cannot
   move a past sale.
2. **The owner sees and can edit every figure before saving.** The standard ratio
   (22K = 22/24) is only a default; the trade does not always quote it that way.

The screen also shows how many pieces sit behind each purity, so the owner knows
what a rate change is about to move.


---

## Rules this codebase holds to

These are invariants, not preferences. Each one is enforced in code and pinned
by a test.

| Rule | How it is enforced |
|---|---|
| All money math is server-side | The frontend only displays `PriceResult` and opens Razorpay checkout |
| Money is never a float | `Decimal` end to end; `Numeric` columns; snapshot amounts stored as strings |
| No computed price is ever stored | `products` has no price column; a test asserts it |
| `metal_rates` is append-only | Insert-only service, ORM `before_update`/`before_delete` guards, **and** a Postgres trigger |
| Never show a stale or zero price | No rate today → `price: null`, `is_buyable: false`, and a named warning on `/rates/today` |
| The engine stays pure | No DB/network imports in `pricing/`; tests run with no database |
| Rounding is one config value | `ROUNDING` env var, read in `pricing/rounding.py` only |

"Today" is always **IST** (`core/time.py`). Deriving the date from a UTC server
clock would expire the day's rate 5.5 hours early and blank the storefront each
evening.

---

## API (Phase 1)

| Endpoint | Purpose |
|---|---|
| `POST /admin/rates` | Set the rate for one (metal, purity). Always inserts. |
| `GET /admin/rates/history` | Every rate ever set for a purity — the audit trail. |
| `GET /rates/today` | Today's rates + which purities live products still need. |
| `GET /products` | Catalogue with live prices and filters. |
| `GET /products/{slug}` | PDP with the full breakup. |
| `GET /admin/rates/derive` | Suggest per-purity rates from a pure rate. Saves nothing. |
| `POST /admin/rates/bulk` | Save several reviewed rates at once, all or nothing. |
| `POST /dev/price-preview` | Dev only. Prices a hypothetical piece, no DB. |
| `GET /dev/calculator` | Dev only. The hand-calc checker above. |

`PriceResult` is the shared shape between backend and frontend:

```json
{ "total": 36719.50, "currency": "INR",
  "breakup": [{"label": "Gold value", "amount": 18000.00}],
  "rate_available": true }
```

When no rate is set today, `price` is `null` and `is_buyable` is `false`.

---

## Still open with the client

- **Rounding rule** — currently 2 decimals. If they want nearest rupee, change
  `ROUNDING=nearest_rupee`. One value, one place. Note that nearest-rupee makes
  the breakup lines no longer sum exactly to the total, so we should confirm
  whether they want the rounding shown as its own line on the invoice.
- **Plain gold/silver making rate** and the full 20K/22K/24K purity list. The
  rate table and engine already handle any purity; nothing is hardcoded to 18K.
- **Baby/newborn section** stock at launch — often plain silver, which is deferred.
