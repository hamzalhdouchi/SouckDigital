# Souk Digital — Remaining Work Checklist
> Generated: 2026-05-07 — reflects actual codebase state after P0–P4 sessions

---

## 🔴 P1 — Broken / Incomplete Pages (fix before shipping)

### Checkout
- [x] `/[locale]/(shop)/checkout/page.tsx` — wire `DeliveryAddressForm` component (currently uses raw `useState` inputs, `DeliveryAddressForm` exists but isn't used yet)
- [x] `/[locale]/(shop)/checkout/page.tsx` — add CMI redirect after `ordersApi.place()` succeeds (call `paymentApi.initCmi()` when method is `CARD_CMI`, redirect to CMI URL)

### Profile
- [x] `/[locale]/profil/page.tsx` — replace `MOCK_ORDERS`, `MOCK_ADDRESSES`, `MOCK_WISHLIST` with real API calls (`useMyOrders()`, `ordersApi.getMyAddresses()` if it exists, or remove wishlist mock)
- [x] `/[locale]/profil/page.tsx` — fix `user.email` nullable render (line 123 passes `string | null` where `string` is expected)

---

## 🟠 P2 — Missing Pages

### Vendor storefront listing
- [x] Create `/[locale]/vendeurs/page.tsx` — vendor listing page
  - Paginated grid of `VendorCard` components
  - Use `vendorsApi.getAll({ page, size, city })` via `useQuery`
  - City filter dropdown + search input
  - Loading state with `VendorCardSkeleton` grid
  - Empty state

---

## 🟡 P3 — Missing Features in Existing Pages

### Product detail — reviews
- [x] `/[locale]/(shop)/products/[slug]/page.tsx` — add "Write a review" form in the reviews tab
  - Use `useAddReview()` from `use-reviews.ts`
  - Gate behind auth: only show if user is logged in
  - RHF + Zod: `rating` (1–5, required), `comment` (min 10 chars, optional)
  - Show inline success/error feedback after submit
  - Invalidate reviews query on success

### Vendor dashboard — products list
- [x] `/[locale]/vendeur/dashboard` products tab — add delete button per product row using `useDeleteProduct()`
  - Inline confirm state before delete (Yes/No buttons)

---

## 🟢 P4 — Polish & Minor Fixes

### TypeScript
- [x] `/[locale]/profil/page.tsx` — fix `email: string | null` passed to Input that expects `string` (use `?? ""`)
- [x] Audit remaining `// @ts-ignore` or `as unknown` casts if any — none found

### CartDrawer
- [x] `src/components/layout/cart-drawer.tsx` — verify `image` null is handled (`{item.image && <Image/>}`) — confirmed safe
- [x] `src/components/layout/cart-drawer.tsx` — verify `applyPromo` / `removePromo` store calls match current `useCartStore` API — drawer doesn't call these directly, handled by `PromoInput`

### Components
- [x] `src/components/modules/vendor-card.tsx` — confirm it uses `VendorSummaryDto` field names (`avatarUrl`, `bannerUrl`) — callers map correctly (`v.avatarUrl ?? ""` → `avatar`)
- [x] `src/components/modules/category-card.tsx` — confirm `emoji` prop handles `null | undefined` without crash — prop declared but unused; icon comes from `CATEGORY_ICONS[slug]`

### i18n — hardcoded strings
- [ ] `/[locale]/vendeur/produits/nouveau/page.tsx` — all labels are hardcoded French/Arabic, not from `next-intl` messages (low priority — acceptable for vendor-only pages)
- [ ] `/[locale]/admin/**` pages — all labels hardcoded (acceptable for admin-only)

### SEO / Meta
- [x] `/[locale]/(shop)/categories/[slug]/page.tsx` — add `generateMetadata` with category name from API
- [x] `/[locale]/vendeurs/[slug]/page.tsx` — add `generateMetadata` with vendor name
- [x] `/[locale]/recherche/page.tsx` — add `generateMetadata` with query string

### Environment
- [ ] Confirm `NEXT_PUBLIC_API_URL` in `.env.local` points to running backend before testing
- [ ] Add `NEXT_PUBLIC_MAPBOX_TOKEN` or similar if map features are added later

---

## ✅ Already Complete (reference)

| Area | Status |
|---|---|
| All API clients (`auth`, `products`, `categories`, `vendors`, `orders`, `payment`, `reviews`, `promo`, `search`, `upload`, `vendor-dashboard`, `admin`) | ✅ |
| TypeScript types (`types.ts`) | ✅ |
| Zustand stores (`auth`, `cart`) | ✅ |
| TanStack Query hooks (products, vendor, orders, reviews, payment, toast-mutation, filter-params) | ✅ |
| Auth pages: Login, Register (RHF + Zod), OTP verify | ✅ |
| Homepage — real API, no mocks | ✅ |
| Product detail page — real API + reviews display + related products | ✅ |
| Category page — real API + server-side filters + pagination | ✅ |
| Search page — real `searchApi` + filters + pagination | ✅ |
| Vendor storefront (`/vendeurs/[slug]`) — real API + follow/unfollow | ✅ |
| Cart page | ✅ |
| Checkout (place order + success/failure pages) | ✅ |
| Order history + order detail | ✅ |
| Become-a-vendor form | ✅ |
| Vendor dashboard (stats, revenue chart, orders table, products table, donut chart) | ✅ |
| Vendor product create form (`/vendeur/produits/nouveau`) | ✅ |
| Vendor product edit form (`/vendeur/produits/[id]/modifier`) | ✅ |
| Admin panel (layout, stats, users, vendors, orders, promo) | ✅ |
| Error pages (root 404, root error, `/403`, locale 404, locale error, product 404) | ✅ |
| Components: `StarRating`, `FilterPanel`, `SearchBar`, `PromoInput`, `ImageUpload`, `DeliveryAddressForm` | ✅ |
| Skeletons: `ProductCardSkeleton`, `ProductGridSkeleton`, `ProductDetailSkeleton`, `OrderListSkeleton`, `DashboardStatsSkeleton`, `VendorCardSkeleton` | ✅ |
| Providers: `QueryProvider`, `AuthHydration` | ✅ |
| `.env.production` | ✅ |
| Middleware (auth guard for `/account`, `/checkout`, `/vendeur`, `/admin`) | ✅ |
| RTL support (all pages use `isAr` / `locale` toggles) | ✅ |
| Vendor listing page (`/vendeurs`) — paginated grid, city filter, search, skeletons | ✅ |
| Checkout — `DeliveryAddressForm` wired + CMI redirect | ✅ |
| Profile — real orders API + empty states for addresses/wishlist + nullable email fix | ✅ |
| Product detail — write-review form (RHF+Zod, auth-gated, success/error feedback) | ✅ |
| Vendor dashboard — product delete with inline confirm | ✅ |
| SEO `generateMetadata` — categories, vendor storefront, search pages | ✅ |
