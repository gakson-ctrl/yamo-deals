# YAMO_Deferred_Items_Backlog.md
**YaMo Deals | ONE CEILING | v1.0 | 07 August 2026**

> Reference this file at the start of every Claude Code session.
> Update it at the end of every session — before marking the session done.
> Format: `[SREF]` = session that deferred it | `[BLOCKS]` = what it blocks | `[STATUS]` = open/in-progress/resolved

---

## How to use this file

- **Workaround fixes** — bug patched temporarily, root cause not addressed
- **Deferred features** — deliberately cut from session scope, must be revisited
- **Flagged risks** — known issues that could affect production readiness
- **Unresolved root causes** — symptoms fixed, underlying cause unknown

---

## 🔴 Critical (blocks a future session)

| # | Item | Type | Deferred in | Blocks | Notes |
|---|---|---|---|---|---|
| Y-016 | Mobile viewport not constrained — app renders at full desktop width | Workaround fix | S1 | All screens look wrong on desktop browser | Needs max-width 430px container in layout.tsx — fix before S2 |
| Y-017 | Only 1 restaurant visible on home screen | Unresolved root cause | S1 | S2 restaurant page | Investigate RLS policy on restaurants table + is_open filter + query limit |
| Y-018 | Cover photo empty — shows fork icon placeholder instead of warm gradient | Workaround fix | S1 | S2 restaurant page visual | Replace with yamo-mango-light → yamo-red-light gradient + name initial |

---

## 🟡 Important (should be resolved before launch)

| # | Item | Type | Deferred in | Blocks | Notes |
|---|---|---|---|---|---|
| Y-001 | SMS OTP provider (Cameroon) — Africa's Talking or HelloDuty | Flagged risk | Pre-S0 | Real phone OTP in prod | Demo accepts any 6 digits; must wire before beta launch |
| Y-002 | Supabase region selection — Africa vs EU | Flagged risk | Pre-S0 | Prod project creation | Choose af-south-1 or eu-west-1; hard to change after prod data lands |
| Y-003 | POSSA payment integration | Deferred feature | Pre-S0 | Payment module going live | Placeholder UI only in MVP; depends on POSSA prod readiness |
| Y-004 | MTN MoMo + Orange Money integration | Deferred feature | Pre-S0 | Payment module | Placeholder UI only; API negotiation needed |
| Y-005 | Rider dashboard + GPS tracking | Deferred feature | Pre-S0 | Accurate delivery ETA | Out of scope MVP; merchant manually marks status |
| Y-019 | next.config.ts → next.config.js rename required | Workaround fix | S0 | App boot | TypeScript config not supported by installed Next.js version; renamed to .js |
| Y-020 | POSSA profiles table columns (possa_handle, pin_hash) conflict with YaMo | Workaround fix | S1 | Registration flow | Dropped NOT NULL constraints; long-term: separate Supabase projects per app |
| Y-021 | POSSA profiles_phone_format constraint rejected YaMo phone numbers | Workaround fix | S1 | Registration flow | Dropped constraint; re-add YaMo-specific phone validation before prod |
| Y-022 | Email confirmation disabled in Supabase for demo | Flagged risk | S1 | Production auth security | Must re-enable + wire proper OTP before beta launch |
| Y-023 | Supabase shared with POSSA — all three apps (POSSA, BANKO, YaMo) on same instance | Flagged risk | S0 | Production scalability | Free tier limit workaround; migrate to dedicated project before launch |

---

## 🟢 Low priority (Phase 2)

| Y-030 | Merchant orders — customer name not shown (RLS blocks profiles join) | Known limitation | S5 | profiles RLS prevents merchants from reading customer display_name; show customer_id last-6 as fallback instead; fix at prod by adding a policy or name snapshot in orders |
| Y-032 | Web Audio beep requires prior user gesture (Chrome autoplay policy) | Known limitation | S6 | AudioContext starts suspended; ctx.resume() called before beep; first notification after a user click will beep; tab opened cold may not beep the first time |
| Y-033 | Browser UI verification skipped (no dev server in session) | Process gap | S6 | TypeScript + ESLint clean but visual render unverified; run npm run dev + open /customer/orders/[id] and /merchant/orders to test Realtime |


| # | Item | Type | Deferred in | Notes |
|---|---|---|---|---|
| Y-006 | Push notifications (web push / FCM) | Deferred feature | Pre-S0 | New order alerts for merchant; status alerts for customer |
| Y-007 | Promo code backend logic | Deferred feature | Pre-S0 | Field exists in schema; validation not implemented |
| Y-008 | Restaurant analytics dashboard | Deferred feature | Pre-S0 | S12 covers basic earnings; full analytics is Phase 2 |
| Y-009 | Merchant promotions module | Deferred feature | Pre-S0 | Banner promotions, time-limited discounts |
| Y-010 | Favorites / saved restaurants | Deferred feature | Pre-S0 | Heart icon on RestaurantCard — toggle only, no backend yet |
| Y-011 | Dark mode | Deferred feature | Pre-S0 | Swiggy/Zomato have it; Phase 2 feature |
| Y-012 | Restaurant search / map view | Deferred feature | Pre-S0 | Map integration (Google Maps or OSM) for Phase 2 |
| Y-013 | Multiple delivery addresses | Deferred feature | Pre-S0 | S10 implements basic address book; multiple addresses saved for Phase 2 |
| Y-014 | Scheduled orders | Deferred feature | Pre-S0 | "Commander pour plus tard" — not in MVP |
| Y-015 | Photo CDN migration from Supabase Storage | Technical debt | Pre-S0 | Supabase Storage fine for MVP; move to CDN at scale |
| Y-024 | Real food photos — all placeholders are gradients | Deferred feature | S2 | Visual polish; restaurant cover + menu item photos need real images |
| Y-025 | Avis + Infos tabs on restaurant page — placeholder only | Deferred feature | S2 | "Bientôt disponible" shown; wire in S10 reviews session |
| Y-026 | Checkout delivery address — no map picker | Deferred feature | S3 | Free text input only; Google Maps / OSM picker deferred to Phase 2 |
| Y-027 | Order confirmation ETA hardcoded ("20–30 min") | Technical debt | S3 | Should compute from restaurant avg_prep_time + delivery estimate |
| Y-028 | CartDrawer localStorage persistence excludes isDrawerOpen | Known limitation | S3 | Intentional — drawer state resets on reload; acceptable for MVP |
| Y-029 | place_order RPC — server re-validates prices but no stock/availability check | Flagged risk | S3 | Menu item could be marked unavailable after cart add; add availability recheck in RPC before launch |

---

## ✅ Resolved

| # | Item | Resolved in | How |
|---|---|---|---|
| Y-016 | Mobile viewport not constrained | S1-FIX | max-w-[430px] shell in layout.tsx; fixed navs centered within column |
| Y-017 | Only 1 restaurant showing on home | S2 | Root cause: seed.sql not yet applied; code was correct; resolved after SQL Editor seed run |
| Y-018 | Fork icon placeholder instead of gradient | S2 | Gradient mango-light → red-light + name initial in RestaurantCard |
| — | next-intl plugin missing from next.config.js | S1 | Added createNextIntlPlugin wrapper; fixed 500 on startup |
| — | Supabase types circular Omit resolving as never | S1-Phone | Rewrote all Insert/Update types explicitly; added Relationships: [] |
| — | profiles_insert_own RLS policy missing | S1 | Added via SQL Editor with DO $$ block workaround |
| — | seed.sql referenced possa_handle/pin_hash columns | S1-Phone | Removed those columns from seed profiles INSERT |
| — | ESLint failures from @typescript-eslint/no-explicit-any | S1 | Removed eslint-disable comments; fixed underlying types |
| — | App routing conflict (customer + merchant both resolving to /) | S1 | Moved pages to customer/ and merchant/ subfolders |
| — | useState cart in RestaurantClient replaced with Zustand | S3 | lib/cart-store.ts wired; FloatingCartBar + CartDrawer use store |
| — | useState cart in RestaurantClient replaced with Zustand | S3 | lib/cart-store.ts wired; FloatingCartBar + CartDrawer use store |
| — | place_order RPC called via route handler (not client) | S3 | app/api/orders/route.ts authenticates server-side; non-negotiable respected |
| — | Order tracking with Realtime subscription | S4 | OrderTracker.tsx subscribes to orders table; active step pulsing; cleanup on unmount |
| — | Order history with reorder CTA | S4 | Pre-fills Zustand cart; navigates to restaurant page |
| — | Login flow broken (no SMS fallback) | Cowork | Collapsed to single-step demo flow: phone → signInWithPassword (derived email) |
| — | IconSprite.tsx readFileSync breaking Vercel | S1-FIX | Changed to return null; force rebuild via empty commit |
| — | Merchant dashboard + live orders (S5) | S5 | StatCard, MerchantOrderCard, PrepTimeModal, DashboardClient, LiveOrdersClient; Realtime subscription; all mutations via RPCs |
| — | SpriteIcon switched to &lt;img src="/icons/name.svg"&gt; | S5 | `<use href="#id">` approach dropped; icons served as static SVG files from /public/icons/ |
| Y-031 | New order sound alert | S6 | Web Audio API 2-beep tone on INSERT realtime event; ctx.resume() handles Chrome autoplay policy; document.hidden check prevents beep on background tabs |
| — | S6 complete (Order Lifecycle + Realtime) | S6 | OrderTracker: toast notifications + countdown timer + cancel flow; MerchantOrderCard: 30s interval + elapsed time color coding; LiveOrdersClient: Web Audio beep + tab title badge; Merchant order detail page (/merchant/orders/[id]); i18n: tracking.*, toast.* namespaces added |

---

*Last updated: 08 August 2026 — S6 complete (Order Lifecycle + Realtime Sync)*
