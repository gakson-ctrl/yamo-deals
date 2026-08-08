# YaMo Deals — Build Brief for Claude Code
**CLAUDE.md | v1.0 | 07 August 2026**
**ONE CEILING Innovation Hub | Yaoundé, Cameroon pilot**

> Read this file at the start of every Claude Code session. No exceptions.

---

## 0. Non-negotiables (read before every session)

- **French primary, English toggle.** All UI copy is written in French first. English is a real second language managed via `next-intl` — not an afterthought. All string literals must go through `t()` — zero hardcoded UI strings in components.
- **Max 6 taps to confirmed order.** Any customer flow that exceeds 6 taps from home screen to order confirmation is a UX defect — fix before advancing to the next session.
- **Max 2 taps to accept an order (merchant).** Accept button → confirm prep time → done. No more.
- **Merchant manually marks delivery status.** No rider dashboard in MVP. Status transitions: `pending → accepted → preparing → ready → delivered`. Merchant drives each step.
- **Cash on delivery is the only active payment method.** POSSA, MTN MoMo, and Orange Money appear as disabled "Bientôt disponible" tiles in the payment selector. No payment logic for them — placeholder UI only.
- **Demo watermark.** A small `DÉMO` badge in the top-right corner of every page. Remove only when going to production.
- **All order mutations through server-side RPCs.** Never write to `orders`, `order_items`, or `restaurants` tables directly from the client. Always through a Next.js route handler calling a Supabase RPC.
- **`str_replace` for edits, not full-file rewrites.** Small, scoped commits. Avoid regenerating large files when only one section changes.
- **Due-diligence checklist at the end of every session.** No exceptions before advancing.
- **Deferred items go in `YAMO_Deferred_Items_Backlog.md`.** Never dropped silently.

---

## 1. Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 14, App Router | Server components + route handlers — same as POSSA/BANKO |
| Language | TypeScript (strict) | Compile-time safety on order/menu mutations |
| Backend | Supabase (Postgres + Auth + RLS + Realtime + Storage) | Realtime for live order status; Storage for restaurant/menu photos |
| Styling | Tailwind CSS | Token-driven utility classes — extend in `tailwind.config.ts` |
| Components | shadcn/ui | Unstyled accessible primitives, themed to YaMo tokens |
| Icons | Tabler (outline) | `@tabler/icons-react` — outline only |
| Fonts | Sora (display) + Inter (body) | Google Fonts, loaded via `next/font/google` |
| Cart state | Zustand | Client-only cart — persist to sessionStorage |
| Data fetching | @tanstack/react-query | Cache + optimistic updates for menu and order feeds |
| Forms | react-hook-form + zod | Zod schemas are the validation contract |
| i18n | next-intl | FR primary, EN toggle; locale stored in cookie |
| Animation | Framer Motion | Micro-interactions only (cart drawer, status steps) |
| Deployment | Vercel | Same pipeline as BANKO/POSSA |
| Dev (Windows) | PowerShell | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` before `npx`/`supabase` CLI |

---

## 2. Design Tokens (locked — extend in `tailwind.config.ts`)

```ts
// tailwind.config.ts — colors extension
colors: {
  yamo: {
    red:     '#E63927',   // Primary: CTAs, active nav, logo
    'red-hover': '#C92D1E',
    'red-light': '#FDF0EE', // Surface tint
    mango:   '#F5A623',   // Secondary: ratings, urgency badges
    'mango-light': '#FFF4E6',
    cream:   '#FDF8F2',   // Page background
    ebony:   '#1A1A2E',   // Headings, bottom nav
    fern:    '#27AE60',   // Success: confirmed, online, delivered
    'fern-light': '#EBF7EE',
    ash:     '#6B7280',   // Muted / secondary text
    fog:     '#E5E7EB',   // Borders, dividers
    white:   '#FFFFFF',
    error:   '#C0392B',
  }
}

// Typography
fontFamily: {
  sora:  ['Sora', 'system-ui', 'sans-serif'],  // Display, headings
  inter: ['Inter', 'system-ui', 'sans-serif'],  // Body, UI
}

// Border radius
borderRadius: {
  'yamo-card': '16px',    // Cards, restaurant tiles, menu items
  'yamo-pill': '24px',    // Primary CTAs, tags
  'yamo-chip': '8px',     // Badges, category pills, status chips
  'yamo-input': '10px',   // Form inputs, search bar
}
```

**Rule:** Never hardcode hex values in components. Always use Tailwind classes derived from these tokens.

**Price formatting:**
```ts
// lib/format.ts
export const formatFCFA = (amount: number): string =>
  new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
// Output: "1 500 FCFA" (with narrow no-break space)
```

---

## 3. i18n Spec

```
messages/
  fr.json   ← primary (write this first always)
  en.json   ← secondary (translate after FR is confirmed)
```

**Locale detection order:**
1. Cookie `NEXT_LOCALE` (set by language toggle in header)
2. `Accept-Language` browser header
3. Default: `fr`

**Key naming convention:**
```json
{
  "nav": { "home": "Accueil", "orders": "Commandes" },
  "restaurant": { "delivery_time": "Livraison estimée", "min_order": "Min. commande" },
  "order": { "status_pending": "En attente", "status_accepted": "Acceptée" },
  "payment": { "cash": "Paiement à la livraison", "coming_soon": "Bientôt disponible" }
}
```

**Non-translatable:** restaurant names, menu item names, Cameroonian addresses — these stay as entered by the merchant. Only UI chrome is translated.

---

## 4. Data Model (Supabase Schema)

```sql
-- Extends Supabase auth.users
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users,
  phone        text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role         text NOT NULL DEFAULT 'customer', -- 'customer' | 'merchant'
  avatar_url   text,
  locale       text NOT NULL DEFAULT 'fr',       -- 'fr' | 'en'
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid REFERENCES profiles(id) NOT NULL,
  name          text NOT NULL,
  description   text,
  cover_url     text,
  logo_url      text,
  categories    text[] NOT NULL DEFAULT '{}',    -- ['cameroonian','grillades']
  address       text NOT NULL,
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  delivery_fee  numeric(8,0) NOT NULL DEFAULT 500,  -- FCFA
  min_order     numeric(8,0) NOT NULL DEFAULT 1000, -- FCFA
  avg_prep_time int NOT NULL DEFAULT 20,            -- minutes
  is_open       boolean NOT NULL DEFAULT false,
  rating        numeric(2,1) DEFAULT 0,
  rating_count  int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE menu_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  display_order int NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id   uuid REFERENCES menu_categories(id),
  name          text NOT NULL,
  description   text,
  price         numeric(8,0) NOT NULL,           -- FCFA, whole numbers only
  image_url     text,
  is_available  boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid REFERENCES profiles(id) NOT NULL,
  restaurant_id    uuid REFERENCES restaurants(id) NOT NULL,
  status           text NOT NULL DEFAULT 'pending',
  -- 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
  total_amount     numeric(10,0) NOT NULL,        -- FCFA, sum of items
  delivery_fee     numeric(8,0) NOT NULL,         -- snapshot at order time
  delivery_address text NOT NULL,
  note_to_kitchen  text,
  promo_code       text,
  payment_method   text NOT NULL DEFAULT 'cash',  -- 'cash' only in MVP
  prep_time_min    int,                           -- set by merchant on accept
  created_at       timestamptz DEFAULT now(),
  accepted_at      timestamptz,
  ready_at         timestamptz,
  delivered_at     timestamptz
);

CREATE TABLE order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id),
  name         text NOT NULL,       -- snapshot of name at order time
  unit_price   numeric(8,0) NOT NULL, -- snapshot of price at order time
  quantity     int NOT NULL DEFAULT 1,
  CHECK (quantity > 0)
);

CREATE TABLE reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES profiles(id) NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
  order_id      uuid REFERENCES orders(id) UNIQUE NOT NULL, -- one review per order
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz DEFAULT now()
);
```

**RLS rules (implement in S0 migration):**
- `profiles`: user reads/writes own row only.
- `restaurants`: public read; owner writes own restaurant only.
- `menu_items`: public read (is_available=true); restaurant owner writes.
- `orders`: customer reads own orders; restaurant owner reads orders for their restaurant.
- `order_items`: follows order RLS.
- `reviews`: public read; authenticated customer inserts for own completed orders only.

**Realtime:** Enable on `orders` table. Merchant subscribes to `restaurant_id=eq.{id}` channel for live incoming orders. Customer subscribes to `id=eq.{order_id}` for live status updates.

---

## 5. Key RPCs (server authority — never direct client writes)

| RPC | Effect |
|---|---|
| `place_order(customer_id, restaurant_id, items[], delivery_address, note, promo_code)` | Validates items + prices (server re-fetches prices — never trust client), computes total, inserts order + order_items atomically. |
| `accept_order(order_id, merchant_id, prep_time_min)` | Validates merchant owns restaurant; sets status=accepted, accepted_at=now(), prep_time_min. |
| `update_order_status(order_id, merchant_id, new_status)` | Validates merchant ownership + valid transition; updates status + timestamp. |
| `cancel_order(order_id, actor_id)` | Customer can cancel only when status=pending. Merchant can cancel at any point. |

---

## 6. Payment Module Spec

**MVP (active):** Cash on delivery only. No server logic — order is placed with `payment_method='cash'`. Confirmation screen shows: *"Payez en espèces à la livraison."*

**Coming soon (placeholder UI only — no logic, no backend):**
```tsx
// components/PaymentMethodSelector.tsx
const methods = [
  { id: 'cash',    label: 'Espèces à la livraison', available: true  },
  { id: 'possa',   label: 'POSSA',                  available: false },
  { id: 'momo',    label: 'MTN MoMo',               available: false },
  { id: 'om',      label: 'Orange Money',            available: false },
];
// Disabled methods show "Bientôt disponible" badge, non-selectable
```

---

## 7. Session Plan

| # | Goal | Key files | Acceptance criteria |
|---|---|---|---|
| **S0** | Scaffold + tokens + auth | `tailwind.config.ts`, `globals.css`, `next.config`, fonts, `lib/format.ts`, `messages/fr.json`, `messages/en.json`, auth pages | App boots; design tokens + both fonts render; `formatFCFA` unit-tested; FR/EN toggle works; phone OTP (any 6 digits in demo); role routing (`/customer` vs `/merchant`); lint + typecheck clean |
| **S1** | Seed data + Customer Home | `supabase/seed.sql` (8 restaurants, categories, menu items), `app/(customer)/page.tsx`, `RestaurantCard`, `CategoryPill` | Home renders with seeded restaurants; category pills filter correctly; RestaurantCard shows name, rating, ETA, min order, delivery fee |
| **S2** | Restaurant page + menu | `app/(customer)/restaurant/[id]/page.tsx`, `MenuItemCard`, `MenuSection` | Full menu renders grouped by category; each item shows photo placeholder, name, price, add button; sticky header on scroll |
| **S3** | Cart state + Cart drawer | `lib/cart-store.ts` (Zustand), `components/CartDrawer.tsx`, `components/FloatingCartBar.tsx` | Add/remove/quantity works; cart persists on page reload (sessionStorage); floating bar shows item count + total; drawer slides up from bottom |
| **S4** | Checkout + confirmation | `app/(customer)/checkout/page.tsx`, `place_order` RPC, confirmation screen | place_order RPC validates prices server-side; order inserted in Supabase; confirmation shows order ID + estimated time; cart cleared |
| **S5** | Merchant home + live orders | `app/(merchant)/page.tsx`, `app/(merchant)/orders/page.tsx`, `MerchantOrderCard` | Dashboard shows today's stats (orders, revenue); Live Orders tab shows pending orders from Supabase Realtime; sound/visual alert on new order |
| **S6** | Order lifecycle + Realtime | `accept_order` RPC, `update_order_status` RPC, `OrderStatusStepper` (customer) | Merchant accepts order → customer's tracking screen updates in real-time without refresh; all status transitions work; prep time countdown visible |
| **S7** | Menu Manager (merchant) | `app/(merchant)/menu/page.tsx`, add/edit/toggle availability | Merchant adds item with photo upload (Supabase Storage); edits name/price/availability; changes reflect on customer-facing menu immediately |
| **S8** | Order Tracking (customer) | `app/(customer)/orders/[id]/page.tsx`, `OrderStatusStepper` | 4-step stepper (Confirmée → En préparation → Prêt → Livré); live Supabase subscription; each step shows timestamp when reached |
| **S9** | Search + filters | `app/(customer)/search/page.tsx` | Full-text search on restaurant name + category; filters: cuisine, min rating, max delivery fee, open now; results update on each filter change |
| **S10** | Profile + address + history | `app/(customer)/profile/page.tsx`, address CRUD, `app/(customer)/orders/page.tsx` | Profile edits save; address book (add/edit/delete/set default); order history with reorder CTA that pre-fills cart |
| **S11** | Reviews flow | Post-delivery review prompt, `app/(customer)/review/[order_id]/page.tsx` | Review prompt appears 30 min after delivered_at (simulated); star rating + optional comment; one review per order enforced by DB constraint |
| **S12** | Merchant earnings | `app/(merchant)/earnings/page.tsx` | Revenue by day (last 7), by week (last 4), by month (last 3); total orders; avg order value; all computed from orders table |

---

## 8. Seed Data Spec (S1)

8 sample Yaoundé restaurants. One INSERT per restaurant. French names and descriptions. Realistic Yaoundé coordinates (centre-ville zone: ~3.87°N 11.52°E).

| # | Name | Category | Delivery fee | Min order | Avg prep |
|---|---|---|---|---|---|
| 1 | Chez Maman Beti | cameroonian, traditionnel | 300 FCFA | 1 500 | 25 min |
| 2 | Soya King Mvog-Ada | grillades, soya | 200 FCFA | 1 000 | 15 min |
| 3 | La Cabane Sandwich | snack, sandwich, fast-food | 300 FCFA | 800 | 10 min |
| 4 | Pizzeria Il Gusto | pizza, italien | 500 FCFA | 2 500 | 30 min |
| 5 | Brasa Poulet Braisé | grillades, poulet | 300 FCFA | 1 500 | 20 min |
| 6 | Boulangerie des Beignets | breakfast, pâtisserie | 200 FCFA | 500 | 10 min |
| 7 | Bar Le Pirogue | drinks, bar-restaurant | 300 FCFA | 1 000 | 15 min |
| 8 | Saveurs d'Afrique | pan-african, camerounais | 400 FCFA | 2 000 | 25 min |

Each restaurant gets 8–12 menu items in 2–3 categories. Prices: 500–8 000 FCFA. All copy French.

---

## 9. Iconography System

Custom flat SVG icons at 24×24 grid. Style: 2px stroke, rounded linecaps/joins, single color (currentColor), flat fills where used.

**Food category icons:** `poulet-braise`, `soya-brochette`, `beignets`, `ndole`, `eru-soupe`, `riz-complet`, `pizza`, `sandwich`, `boissons`, `desserts`

**Status icons:** `commande-confirmee`, `en-preparation`, `livreur-en-route`, `livre`, `temps-estime`, `adresse-livraison`

Store in `public/icons/` as individual SVG files. Export a sprite at `public/icons/sprite.svg`.

Background tile colors per category icon:
- Grillades/Poulet/Soya → `yamo-red-light` (#FDF0EE)
- Snack/Sandwich/Pizza → `yamo-mango-light` (#FFF4E6)
- Local/Ndolé/Eru/Riz → `yamo-fern-light` (#EBF7EE)
- Boissons/Desserts → alternates

---

## 10. Open Flags

| # | Flag | Blocks | Default in brief |
|---|---|---|---|
| 🚩1 | SMS provider for real OTP (Cameroon) | Phone OTP in production | Demo accepts any 6-digit code; SMS wired when provider confirmed (Africa's Talking, HelloDuty) |
| 🚩2 | Supabase region — data residency | Prod project creation | Pick Africa region (closest: eu-west-1 or af-south-1) before prod |
| 🚩3 | Photo hosting — Supabase Storage vs CDN | Restaurant cover photos, menu item images | MVP: Supabase Storage (simple). CDN migration at scale. |
| 🚩4 | POSSA payment integration timing | Payment module going live | Placeholder only in MVP; wire when POSSA demo is production-ready |
| 🚩5 | Rider dashboard scope | Delivery tracking accuracy | Out of scope MVP; merchant manually marks status |

---

## 11. Handoff Checklist (give at each session start)

- [ ] This `CLAUDE.md` at repo root
- [ ] Session number + goal from §7
- [ ] Last applied Supabase migration filename
- [ ] `.env.local` with staging Supabase keys
- [ ] `YAMO_Deferred_Items_Backlog.md` (current items)
- [ ] Any resolved flags relevant to that session

---

## 12. Directory Structure (target)

```
app/
  (auth)/
    login/          register/
  (customer)/
    page.tsx                  ← Home / Discovery
    restaurant/[id]/page.tsx  ← Restaurant + Menu
    checkout/page.tsx
    orders/
      page.tsx                ← Order history
      [id]/page.tsx           ← Order tracking
    search/page.tsx
    profile/page.tsx
    review/[order_id]/page.tsx
  (merchant)/
    page.tsx                  ← Dashboard home
    orders/page.tsx           ← Live orders
    menu/page.tsx             ← Menu manager
    earnings/page.tsx
    profile/page.tsx
  api/
    orders/route.ts           ← place_order handler
    orders/[id]/route.ts      ← status update handler

components/
  customer/   (RestaurantCard, MenuItemCard, CartDrawer, FloatingCartBar,
               OrderStatusStepper, CategoryPill, ReviewForm)
  merchant/   (MerchantOrderCard, StatCard, PrepTimeModal, MenuItemForm)
  shared/     (PaymentMethodSelector, PriceTag, RatingBadge, DeliveryBadge,
               DemoBadge, LanguageToggle)

lib/
  format.ts           ← formatFCFA, formatDate
  cart-store.ts       ← Zustand cart
  supabase/
    client.ts         ← browser client
    server.ts         ← server client (RSC + route handlers)
  db.ts               ← typed query helpers

messages/
  fr.json   en.json

public/
  icons/              ← SVG icon library

supabase/
  migrations/
    0001_schema.sql
    0002_rls.sql
    0003_rpcs.sql
  seed.sql            ← 8 restaurants + menus
```

---

## 13. Due-Diligence Checklist (run at end of every session)

- [ ] All new components render without console errors
- [ ] TypeScript: `npx tsc --noEmit` passes
- [ ] ESLint: `npx eslint . --ext .ts,.tsx` passes (no new errors)
- [ ] FR strings added to `messages/fr.json`; EN equivalents added to `messages/en.json`
- [ ] Any money/order mutation goes through a route handler / RPC (no direct Supabase client writes to orders/order_items)
- [ ] New deferred items logged to `YAMO_Deferred_Items_Backlog.md`
- [ ] Session checklist row in §7 acceptance criteria met before marking done
- [ ] `DEMO` watermark still visible

---

*Generated by ONE CEILING PM framework — YaMo Deals v1.0 | 07 August 2026*
*Maintained in sync with `YAMO_Deferred_Items_Backlog.md`*
