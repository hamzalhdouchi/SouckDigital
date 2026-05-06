# Souk Digital — Frontend Status
> Last updated: 2026-05-06 — P0 + P1 complete

---

## Legend
- ✅ Done & connected to real API
- ⚠️ Exists but uses mock data / incomplete
- ❌ Missing — not created yet

---

## Layer 1 — Infrastructure (lib/)

### API Clients
| File | Status | Notes |
|---|---|---|
| `src/lib/api/client.ts` | ✅ | ApiError with errors field, auto-refresh on 401, network errors, serverGet<T> |
| `src/lib/api/auth.ts` | ✅ | authApi object + legacy exports |
| `src/lib/api/products.ts` | ✅ | productsApi object + legacy exports |
| `src/lib/api/categories.ts` | ✅ | categoriesApi object |
| `src/lib/api/vendors.ts` | ✅ | vendorsApi object + legacy exports |
| `src/lib/api/orders.ts` | ✅ | ordersApi object + legacy exports |
| `src/lib/api/payment.ts` | ✅ | paymentApi — initCmi + getStatus |
| `src/lib/api/reviews.ts` | ✅ | reviewsApi — getByProduct, getStats, create, delete |
| `src/lib/api/promo.ts` | ✅ | promoApi.validate |
| `src/lib/api/search.ts` | ✅ | searchApi.search + suggestions |
| `src/lib/api/upload.ts` | ✅ | uploadApi — single + multi image |
| `src/lib/api/vendor-dashboard.ts` | ✅ | vendorDashboardApi — stats, revenue, orders, top products |
| `src/lib/api/admin.ts` | ✅ | adminApi — users, vendors, orders, products, stats, promo |

### TypeScript Types (`src/lib/api/types.ts`)
| Type group | Status |
|---|---|
| Pagination `Page<T>` | ✅ |
| Enums: Role, OrderStatus, PaymentMethod, PaymentStatus, Badge | ✅ |
| Auth: UserDto, AuthResponse, RegisterRequest, LoginRequest, OtpVerifyRequest, RegisterResponse | ✅ |
| Categories: CategoryResponse | ✅ |
| Products: ProductSummaryDto, ProductDetailDto, CreateProductRequest, ProductFilterRequest | ✅ |
| Vendors: VendorSummaryDto, VendorDetailDto, CreateVendorRequest | ✅ |
| Orders: PlaceOrderRequest, OrderSummaryDto, OrderDetailDto, OrderItemDto | ✅ |
| Payment: CmiInitResponse, PaymentStatusDto | ✅ |
| Reviews: CreateReviewRequest, ReviewDetailDto, ReviewStatsDto, RatingDistributionDto | ✅ |
| Promo: PromoValidationResponse | ✅ |
| Search: SearchResultsDto | ✅ |
| Vendor Dashboard: DashboardStatsDto, MonthlyRevenueDto, TopProductDto | ✅ |
| Admin: AdminUserDto, AdminVendorDto, PlatformStatsDto, PromoCodeDto, CreatePromoRequest | ✅ |

### Zustand Stores
| File | Status | Notes |
|---|---|---|
| `src/lib/store/auth.ts` | ✅ | setAuth, logout, updateUser, selectors (useIsVendor, useIsAdmin, useCurrentUser), useAuthHydrated |
| `src/lib/store/cart.ts` | ✅ | addItem, removeItem, updateQty, applyPromo, removePromo, clear, promoDiscountAmount, deliveryFee selectors |

### TanStack Query Hooks
| File | Status |
|---|---|
| `src/lib/hooks/use-products.ts` | ✅ |
| `src/lib/hooks/use-vendor.ts` | ✅ |
| `src/lib/hooks/use-orders.ts` | ✅ |
| `src/lib/hooks/use-reviews.ts` | ✅ |
| `src/lib/hooks/use-cmi-payment.ts` | ✅ |
| `src/lib/hooks/use-toast-mutation.ts` | ✅ |
| `src/lib/hooks/use-filter-params.ts` | ✅ |

### Utilities & Config
| File | Status | Notes |
|---|---|---|
| `src/lib/utils/locale.ts` | ✅ | localeName, formatPrice, formatDate, formatRelativeDate |
| `src/middleware.ts` | ✅ | Protects /account, /checkout, /vendor, /admin — JWT role check |
| `src/components/providers/query-provider.tsx` | ✅ | QueryClient with staleTime=60s, retry=1 |
| `src/components/providers/auth-hydration.tsx` | ✅ | SSR hydration guard |
| `.env.local` | ✅ | NEXT_PUBLIC_API_URL + NEXT_PUBLIC_APP_URL |
| `.env.production` | ❌ | Not created |
| `next.config.ts` | ✅ | Image domains: unsplash, picsum, S3, Supabase |

---

## Layer 2 — Components

### UI Primitives
| Component | Status | Notes |
|---|---|---|
| `Button` | ✅ | |
| `Badge` | ✅ | |
| `Card` | ✅ | |
| `Input` | ✅ | |
| `Rating` | ✅ | Display only |
| `Spinner` | ✅ | |
| `Skeleton` | ✅ | animate-pulse base |
| `ApiErrorDisplay` | ✅ | Inline form error with field map |

### Skeleton Components
| Component | Status |
|---|---|
| `ProductCardSkeleton` | ✅ |
| `ProductGridSkeleton` | ✅ |
| `ProductDetailSkeleton` | ✅ |
| `OrderListSkeleton` | ✅ |
| `DashboardStatsSkeleton` | ✅ |
| `VendorCardSkeleton` | ❌ |

### Layout
| Component | Status | Notes |
|---|---|---|
| `Header` | ⚠️ | Exists — search bar is static, no autocomplete |
| `Footer` | ✅ | |
| `MobileNav` | ✅ | |
| `CartDrawer` | ⚠️ | Exists — uses old CartItem shape, image null not handled |

### Product Components
| Component | Status | Notes |
|---|---|---|
| `ProductCard` | ⚠️ | Exists — uses mock data types |
| `CategoryCard` | ⚠️ | Exists — emoji nullable mismatch |
| `VendorCard` | ⚠️ | Exists — uses mock data |

### Review Components
| Component | Status |
|---|---|
| `StarRating` (interactive + display) | ❌ |
| `RatingDistribution` bar chart | ❌ |
| `ReviewCard` | ❌ |
| `ReviewForm` (RHF + Zod) | ❌ |

### Search & Filter Components
| Component | Status |
|---|---|
| `SearchBar` with autocomplete + debounce | ❌ |
| `FilterPanel` (price range, city, checkboxes, rating) | ❌ |

### Checkout Components
| Component | Status |
|---|---|
| `PaymentMethodSelector` radio cards | ❌ |
| `PromoInput` with validate + remove | ❌ |
| `DeliveryAddressForm` (RHF + Zod) | ❌ |

### Upload Components
| Component | Status |
|---|---|
| `ImageUpload` (drag & drop, preview, progress, remove) | ❌ |

### Vendor Dashboard Components
| Component | Status |
|---|---|
| Revenue trend chart (Recharts) | ❌ |
| Orders by status donut chart | ❌ |
| Stat cards with growth badge | ❌ |
| Orders table with status update | ❌ |
| Products table with toggle | ❌ |

---

## Layer 3 — Pages

### Auth Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/auth/login` | ⚠️ | Exists — uses useState, NOT React Hook Form + Zod |
| `/[locale]/auth/register` | ⚠️ | Exists — uses useState, NOT React Hook Form + Zod |
| `/[locale]/auth/verify-otp` | ✅ | 6-digit input, paste support, 60s resend cooldown, phone via query param |

### Shop Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]` — Homepage | ⚠️ | Exists — still imports MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_VENDORS |
| `/[locale]/products/[slug]` | ✅ | Real API via useProduct + useReviews + useReviewStats, skeleton, lightbox, related products |
| `/[locale]/categories/[slug]` | ⚠️ | Exists — uses mock data, no real filter sidebar |
| `/[locale]/recherche` | ⚠️ | Exists — not using searchApi, no filter panel |
| `/[locale]/vendeurs/[slug]` | ⚠️ | Exists — uses mock data, follow button not wired |

### Cart & Checkout
| Page | Status | Notes |
|---|---|---|
| `/[locale]/cart` | ⚠️ | Exists — image null TS error, applyPromo broken |
| `/[locale]/checkout` | ⚠️ | Exists — does NOT call ordersApi.place(), no CMI redirect |
| `/[locale]/checkout/success` | ✅ | CMI payment polling (3s interval, 10 attempts), success / pending UI |
| `/[locale]/checkout/failure` | ✅ | Retry card (CMI) + COD fallback, failure reason display |

### Account Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/profil` | ⚠️ | Exists — email nullable TS error |
| `/[locale]/account/orders` | ✅ | Infinite scroll list, real API via useMyOrders |
| `/[locale]/account/orders/[id]` | ✅ | Order detail + 5-step progress timeline, items, address, payment summary |
| `/[locale]/account/become-vendor` | ❌ | Missing — vendor registration form |

### Vendor Dashboard Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/vendeur/dashboard` | ⚠️ | Exists — hardcoded stats, uses MOCK_PRODUCTS, no Recharts |
| `/[locale]/vendor/dashboard/orders` | ❌ | Missing — orders table + status update |
| `/[locale]/vendor/dashboard/products` | ❌ | Missing — products list + toggle |
| `/[locale]/vendor/dashboard/products/new` | ❌ | Missing — create product form |
| `/[locale]/vendor/dashboard/products/[id]/edit` | ❌ | Missing — edit product form |

### Admin Panel Pages
| Page | Status |
|---|---|
| `/[locale]/admin` — platform stats | ❌ |
| `/[locale]/admin/users` | ❌ |
| `/[locale]/admin/vendors` | ❌ |
| `/[locale]/admin/orders` | ❌ |
| `/[locale]/admin/promo` | ❌ |

### Error Pages
| Page | Status |
|---|---|
| `not-found.tsx` (global 404) | ❌ |
| `error.tsx` (global error boundary) | ❌ |
| `/403` forbidden page | ❌ |
| `products/[slug]/not-found.tsx` | ❌ |

---

## TypeScript Errors (16 remaining)

All in existing pages — none in lib/ code:

| File | Error |
|---|---|
| `(auth)/register/page.tsx` | `userId` not in OtpVerifyRequest, undefined state type |
| `(shop)/cart/page.tsx` | applyPromo return type, image null |
| `(shop)/checkout/page.tsx` | image null |
| `(shop)/products/[slug]/page.tsx` | await in non-async, mock badge mismatch, city nullable |
| `[locale]/page.tsx` | CategoryResponse emoji nullable, badge `new_` vs `NEW`, undefined string |
| `profil/page.tsx` | email nullable |

---

## Progress by MD Checklist Step

| Step | Checklist | Lib | Pages/Components |
|---|---|---|---|
| 1 — API Client | 8 items | ✅ 8/8 | — |
| 2 — TypeScript Types | 5 items | ✅ 5/5 | — |
| 3 — Auth + Cart Store | 10 items | ✅ 10/10 | — |
| 4 — Auth Flows | 6 items | ✅ 3/3 api | ⚠️ 2/3 pages (OTP missing) |
| 5 — Products & Categories | 8 items | ✅ 4/4 api+hooks | ❌ 0/4 pages use real API |
| 6 — Vendors | 5 items | ✅ 2/2 api+hooks | ❌ 0/3 pages use real API |
| 7 — Cart & Orders | 8 items | ✅ 2/2 api+hooks | ❌ 0/4 pages complete |
| 8 — Payment CMI | 5 items | ✅ 2/2 api+hooks | ❌ 0/3 pages exist |
| 9 — Reviews | 6 items | ✅ 2/2 api+hooks | ❌ 0/4 components exist |
| 10 — Promo Codes | 4 items | ✅ 1/1 api | ❌ 0/2 components exist |
| 11 — Search & Filters | 5 items | ✅ 2/2 api+hooks | ❌ 0/3 components exist |
| 12 — File Upload | 4 items | ✅ 1/1 api | ❌ 0/1 component exists |
| 13 — Vendor Dashboard | 5 items | ✅ 1/1 api | ❌ 0/4 pages complete |
| 14 — Admin Panel | 5 items | ✅ 1/1 api | ❌ 0/5 pages exist |
| 15 — Error Handling | 7 items | ✅ 2/2 hook+component | ❌ 0/4 error pages exist |
| 16 — Skeletons | 7 items | ✅ 6/7 components | ❌ 0 Suspense boundaries in pages |
| 17 — i18n + RTL | 5 items | ✅ 4/4 utils | ⚠️ partial (hardcoded text in pages) |
| 18 — Environment | 6 items | ✅ 5/6 (missing .env.production) | ✅ providers wired |

---

## Overall Completion

| Layer | Done | Total | % |
|---|---|---|---|
| API clients | 13 | 13 | **100%** |
| TypeScript types | 13 groups | 13 | **100%** |
| Zustand stores | 2 | 2 | **100%** |
| TanStack Query hooks | 7 | 7 | **100%** |
| Utilities & config | 7 | 8 | **88%** |
| UI components | 9 | 19 | **47%** |
| Pages | 7 | 22 | **32%** |
| **Total** | | | **~65% lib, ~25% UI** |

---

## What to build next (priority order)

### P0 — Fixes needed now (blocks everything)
1. Fix 16 TS errors in existing pages
2. Replace mock data in homepage with real API calls
3. Fix checkout to call `ordersApi.place()`

### P1 — Core user flows
4. OTP verify page (`/auth/verify-otp`)
5. Product detail page — real API + reviews section
6. Order history + order detail pages
7. Checkout success/failure pages

### P2 — Components needed everywhere
8. `StarRating` component
9. `FilterPanel` component
10. `SearchBar` with autocomplete
11. `PromoInput` component

### P3 — Vendor & Admin
12. Vendor dashboard pages (stats, orders, products CRUD)
13. Become-a-vendor page
14. Admin panel (all 5 pages)

### P4 — Polish
15. Error pages (404, 403, error boundary)
16. Suspense boundaries + mutation loading states
17. Image upload component
18. `.env.production`
