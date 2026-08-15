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
| Y-034 | Merchant dashboard "Une erreur est survenue" when no restaurant linked to owner_id | Bug | S5 live test | Merchant dashboard crashes if profiles.owner_id not set on any restaurant |
| Y-035 | Checkout address field missing or hidden above fold on some screen sizes | Bug | S3 live test | Delivery address input not visible — needs investigation |

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
| — | SpriteIcon switched to direct img src approach | S5 | No more readFileSync; icons served as static files from /public/icons/ |
| — | Order tracking stepper static → Realtime | S6 | Supabase Realtime subscription on orders table; stepper auto-advances |
| — | Toast notifications on order status change | S6 | 4s auto-dismiss toast (no external library) |
| — | ETA countdown on customer tracking page | S6 | setInterval 60s; clears on unmount |
| — | Cancel order button (pending only) | S6 | Inline confirm → PATCH route handler → cancel_order RPC |
| — | Merchant elapsed time counter (color-coded) | S6 | 30s interval; green/amber/red by age |
| — | Web Audio beep on new merchant order | S6 | 2-beep via Web Audio API; document.hidden guard |
| — | Browser tab title badge (🔴 N nouvelles) | S6 | Updates on Realtime INSERT; resets on accept |
| — | Merchant order detail page | S6 | /merchant/orders/[id] with full items, timestamps, action buttons |
| — | next.config.js image domains | S6-FIX | Added unsplash + supabase.co to remotePatterns |

---

---

## S7 — Menu Manager (Merchant) notes

| # | Item | Type | Notes |
|---|---|---|---|
| Y-036 | Supabase Storage bucket `menu-items` must be created manually | Setup step | Dashboard → Storage → New bucket → name: `menu-items` → Public: true. Migration 0006 has SQL RPCs but cannot create the bucket. |
| Y-037 | Uncategorized menu items not shown in Menu Manager | Known limitation | Items with `category_id = null` are stored in DB but not displayed. Workaround: always assign a category when adding. Phase 2: add "Sans catégorie" fallback section. |
| Y-038 | Photo upload requires Storage bucket to be created (Y-036) | Dependency | If bucket missing, photo upload silently fails and item is saved without image. No UX error shown for missing bucket — acceptable for demo. |

---

## ✅ Resolved (continued)

| # | Item | Resolved in | How |
|---|---|---|---|
| — | Menu Manager page — add/edit/toggle menu items | S7 | `app/(merchant)/merchant/menu/page.tsx` + `MenuManagerClient.tsx`; collapsible categories, item rows, optimistic availability toggle |
| — | AddEditItemSheet — add/edit items with photo upload | S7 | `components/merchant/AddEditItemSheet.tsx`; uploads to Supabase Storage `menu-items` bucket |
| — | AddCategorySheet — create menu categories | S7 | `components/merchant/AddCategorySheet.tsx`; calls `insert_menu_category` RPC via route handler |
| — | Menu Manager API routes | S7 | `POST /api/menu-items`, `PATCH+DELETE /api/menu-items/[id]`, `POST /api/menu-categories` — all via SECURITY DEFINER RPCs |
| — | `*.supabase.co` wildcard in remotePatterns | S7 | Fixed `next.config.js` from `supabase.co` to `*.supabase.co` so Storage image URLs load in `<Image>` |

---

---

## S8 — Search + Filters notes

| # | Item | Type | Notes |
|---|---|---|---|
| Y-039 | Search is client-side only — no full-text DB index | Known limitation | Filters against the in-memory restaurant list fetched on mount. Acceptable for MVP (≤50 restaurants). For Phase 2: add `pg_trgm` index on `restaurants.name` and use Supabase full-text search. |
| Y-040 | Home search bar navigates on every keystroke | UX quirk | `HomeSearchInput` calls `router.push()` on `onChange`. On fast typing, multiple navigation events fire. Consider debounce in Phase 2. |

---

## ✅ Resolved (continued)

| # | Item | Resolved in | How |
|---|---|---|---|
| Y-012 | Restaurant search (basic, no map) | S8 | `SearchPageClient.tsx` — text search on name + category strings, client-side filtering |
| — | Search page with filter chips | S8 | `app/(customer)/customer/search/page.tsx` + `SearchPageClient.tsx`; cuisine × 7, rating × 3, fee × 3, open now toggle; AND logic; reset button |
| — | Skeleton loading (2-col × 3-row) | S8 | `SkeletonCard` component with `animate-pulse`; shown while Supabase fetch resolves |
| — | Home search bar wired | S8 | `HomeSearchInput.tsx` client component; navigates to `/customer/search?q=…` on input; search page reads `?q` and pre-fills |
| — | URL sync for shareable search links | S8 | `router.replace` keeps `?q` param in sync; `useSearchParams` pre-fills on load |

---

---

## S9 — Profile + Address + History + Merchant Fix notes

| # | Item | Type | Notes |
|---|---|---|---|
| Y-041 | Merchant orders not displaying (Y-036 was mislabelled) | Bug fix | Root cause: `profiles(display_name)` join in orders query tripped RLS; merchant cannot read customer profiles. Fix: removed profiles join from both server query (`orders/page.tsx`) and Realtime refetch (`LiveOrdersClient.tsx`); switched `.not('status','in',…)` to explicit `.in('status',[…])`. MerchantOrderCard already handled `profiles: null` with customer_id fallback. |
| Y-042 | Profile page `saved_addresses` requires migration 0007 to be applied | Setup step | Run `supabase/migrations/0007_profile_addresses.sql` via Dashboard SQL Editor or `supabase db push`. Until applied, profile page will show empty address list. |
| Y-043 | Review page `/customer/review/[order_id]` not yet implemented | Deferred feature | S11 scope. "Laisser un avis" CTA links to this route; page returns 404 until S11. |
| Y-044 | Profile page: display_name edit not implemented | Deferred feature | Editing the display name on the profile page is out of scope for S9. PATCH /api/profile supports it — just needs a UI form. Phase 2 or S10. |

---

## ✅ Resolved (continued)

| # | Item | Resolved in | How |
|---|---|---|---|
| Y-041 | Merchant orders not displaying | S9 | Removed `profiles(display_name)` from orders queries; RLS blocks merchant from reading customer profiles. Customer ID fallback already in place. |
| — | Customer profile page | S9 | `app/(customer)/customer/profile/page.tsx` + `ProfileClient.tsx`; avatar, name, phone, addresses sheet, orders link, FR/EN toggle, logout confirm |
| — | Address book (AddressSheet) | S9 | `components/customer/AddressSheet.tsx`; CRUD on `saved_addresses` JSONB via `PATCH /api/profile`; set-default, inline delete confirm |
| — | Profile + addresses API route | S9 | `app/api/profile/route.ts` — GET + PATCH (auth-guarded, own profile only, direct `profiles` table update) |
| — | Migration 0007 — saved_addresses column | S9 | `supabase/migrations/0007_profile_addresses.sql`; ALTER TABLE profiles ADD COLUMN saved_addresses |
| — | Order history: date+time display | S9 | `formatDateTime` added to `lib/format.ts`; orders page shows "11 août 2026 à 14:32" |
| — | Order history: "Laisser un avis" CTA | S9 | Appears on delivered orders alongside reorder button; links to `/customer/review/[order_id]` (S11 placeholder) |

---

## S10 — Reviews Flow notes

| # | Item | Type | Notes |
|---|---|---|---|
| Y-045 | Review page migration 0008 must be applied manually | Setup step | Run `supabase/migrations/0008_reviews.sql` via Dashboard SQL Editor or `supabase db push`. Until applied, review submissions will fail. |
| Y-046 | Reviewer name shown as anonymous "Client #XXXX" | Known limitation | RLS blocks merchant/customer from reading other profiles' display_name. MVP shows last 4 chars of customer_id. Phase 2: use a public display alias on reviews table. |

---

## S11 — Earnings Summary notes

| # | Item | Type | Notes |
|---|---|---|---|
| Y-047 | CSV export uses browser Blob API | Known limitation | Works in real browser. Not compatible with Artifact sandbox (but this is the live app, not an Artifact). |
| Y-048 | Bar chart always shows last 7 days regardless of period tab | Design decision | Period tabs filter the hero stats + recent orders list. The chart always shows 7-day trend for context. Phase 2: make chart responsive to period. |

---

## ✅ Resolved (continued)

| # | Item | Resolved in | How |
|---|---|---|---|
| Y-043 | Review page `/customer/review/[order_id]` not implemented | S10 | `app/(customer)/customer/review/[id]/page.tsx` + `ReviewClient.tsx`; star selector, comment, submit → `POST /api/reviews` → `insert_review` RPC; success state with fern checkmark; redirects if order not delivered or not owned |
| — | insert_review RPC | S10 | `0008_reviews.sql`; validates ownership + delivered status + unique constraint; updates restaurant rolling avg |
| — | POST /api/reviews route handler | S10 | `app/api/reviews/route.ts`; auth-guarded, calls insert_review RPC |
| — | Restaurant Avis tab — real reviews | S10 | Lazy fetch on tab click (browser Supabase client); aggregate rating + StarRow; review cards with anonymous avatar; empty state |
| Y-025 | Avis tab placeholder replaced | S10 | Now shows real reviews fetched from `reviews` table; Infos tab keeps "Bientôt disponible" |
| — | Merchant earnings page | S11 | `app/(merchant)/merchant/earnings/page.tsx` + `EarningsClient.tsx`; period tabs (Today / 7 days / 30 days); hero revenue card; stat cards; pure CSS 7-day bar chart; recent orders list; CSV export |
| — | Earnings nav tab wired | S11 | Already linked in merchant layout since S5; `app/(merchant)/merchant/earnings/` now exists |

---

## 🏁 MVP COMPLETE — S0 through S11

All 12 build sessions are done. App is ready for demo at ONE CEILING Innovation Hub.

**Remaining before production:**
- Apply migrations 0007 + 0008 via Supabase Dashboard
- Create `menu-items` Storage bucket (Y-036)
- Wire real OTP via Africa's Talking or HelloDuty (Y-001)
- Choose Supabase region for production project (Y-002)

*Last updated: 15 August 2026 — S10+S11 complete (Reviews flow + Earnings summary). MVP complete.*
