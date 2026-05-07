# Souk Digital — Frontend Status
> Last updated: 2026-05-07 — P0 through P4 complete

---

## Legend
- ✅ Done & connected to real API
- ⚠️ Exists but incomplete / known gap
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
| `.env.production` | ✅ | Created |
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
| `VendorCardSkeleton` | ✅ |

### Layout
| Component | Status | Notes |
|---|---|---|
| `Header` | ✅ | Search bar with autocomplete |
| `Footer` | ✅ | |
| `MobileNav` | ✅ | |
| `CartDrawer` | ✅ | image null handled, applyPromo/removePromo wired via PromoInput |

### Product Components
| Component | Status | Notes |
|---|---|---|
| `ProductCard` | ✅ | Real API types, all props wired |
| `CategoryCard` | ✅ | emoji/null safe — icon from CATEGORY_ICONS[slug] |
| `VendorCard` | ✅ | Uses VendorSummaryDto fields (avatarUrl, bannerUrl) |

### Review Components
| Component | Status |
|---|---|
| `StarRating` (interactive + display) | ✅ |
| `RatingDistribution` bar chart | ✅ |
| `ReviewCard` | ✅ |
| `WriteReviewForm` (RHF + Zod, auth-gated) | ✅ |

### Search & Filter Components
| Component | Status |
|---|---|
| `SearchBar` with autocomplete + debounce | ✅ |
| `FilterPanel` (price range, city, checkboxes, rating) | ✅ |

### Checkout Components
| Component | Status |
|---|---|
| `PaymentMethodSelector` radio cards | ✅ |
| `PromoInput` with validate + remove | ✅ |
| `DeliveryAddressForm` (RHF + Zod, forwardRef) | ✅ |

### Upload Components
| Component | Status |
|---|---|
| `ImageUpload` (drag & drop, preview, progress, remove) | ✅ |

### Vendor Dashboard Components
| Component | Status |
|---|---|
| Revenue trend chart (Recharts) | ✅ |
| Orders by status donut chart | ✅ |
| Stat cards with growth badge | ✅ |
| Orders table with status update | ✅ |
| Products table with inline delete confirm | ✅ |

---

## Layer 3 — Pages

### Auth Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/auth/login` | ✅ | RHF + Zod |
| `/[locale]/auth/register` | ✅ | RHF + Zod |
| `/[locale]/auth/verify-otp` | ✅ | 6-digit input, paste support, 60s resend cooldown |

### Shop Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]` — Homepage | ✅ | Real API, no mocks |
| `/[locale]/products/[slug]` | ✅ | Real API + reviews + write-review form (auth-gated) + related products |
| `/[locale]/categories/[slug]` | ✅ | Real API + server-side filters + pagination + generateMetadata |
| `/[locale]/recherche` | ✅ | searchApi + FilterPanel + pagination + generateMetadata |
| `/[locale]/vendeurs` | ✅ | Paginated grid, city filter, search, VendorCardSkeleton |
| `/[locale]/vendeurs/[slug]` | ✅ | Real API + follow/unfollow + generateMetadata |

### Cart & Checkout
| Page | Status | Notes |
|---|---|---|
| `/[locale]/cart` | ✅ | Real cart store, image null safe |
| `/[locale]/checkout` | ✅ | DeliveryAddressForm wired (forwardRef), ordersApi.place(), CMI redirect |
| `/[locale]/checkout/success` | ✅ | CMI payment polling (3s interval, 10 attempts) |
| `/[locale]/checkout/failure` | ✅ | Retry card + COD fallback, failure reason display |

### Account Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/profil` | ✅ | Real orders API (useMyOrders infinite), email null safe, empty states for addresses/wishlist |
| `/[locale]/account/orders` | ✅ | Infinite scroll list |
| `/[locale]/account/orders/[id]` | ✅ | Order detail + 5-step progress timeline |
| `/[locale]/account/become-vendor` | ✅ | Vendor registration form |

### Vendor Dashboard Pages
| Page | Status | Notes |
|---|---|---|
| `/[locale]/vendeur/dashboard` | ✅ | Real API stats, Recharts revenue + donut, orders table, products table + delete confirm |
| `/[locale]/vendeur/produits/nouveau` | ✅ | Create product form with ImageUpload |
| `/[locale]/vendeur/produits/[id]/modifier` | ✅ | Edit product form |

### Admin Panel Pages
| Page | Status |
|---|---|
| `/[locale]/admin` — platform stats | ✅ |
| `/[locale]/admin/users` | ✅ |
| `/[locale]/admin/vendors` | ✅ |
| `/[locale]/admin/orders` | ✅ |
| `/[locale]/admin/promo` | ✅ |

### Error Pages
| Page | Status |
|---|---|
| `not-found.tsx` (global 404) | ✅ |
| `error.tsx` (global error boundary) | ✅ |
| `/403` forbidden page | ✅ |
| `[locale]/not-found.tsx` (locale 404) | ✅ |
| `products/[slug]/not-found.tsx` | ✅ |

---

## Known Gaps (accepted / low priority)

| Area | Status | Notes |
|---|---|---|
| i18n — vendor product create/edit pages | ⚠️ | Labels hardcoded FR/AR, not from next-intl messages — acceptable for vendor-only |
| i18n — admin pages | ⚠️ | Labels hardcoded — acceptable for admin-only |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ⚠️ | Not needed until map features are added |
| `NEXT_PUBLIC_API_URL` in `.env.local` | ⚠️ | Must point to running backend before testing |

---

## TypeScript Errors

All known TS errors from previous sessions have been resolved:
- `profil/page.tsx` — `email: string | null` → `user.email && <p>...` (safe render)
- `checkout/page.tsx` — DeliveryAddressForm wired via forwardRef, no raw useState inputs
- `products/[slug]/page.tsx` — badge, city, await-in-non-async fixed
- No remaining `@ts-ignore` or `as unknown` casts found

---

## Overall Completion

| Layer | Done | Total | % |
|---|---|---|---|
| API clients | 13 | 13 | **100%** |
| TypeScript types | 13 groups | 13 | **100%** |
| Zustand stores | 2 | 2 | **100%** |
| TanStack Query hooks | 7 | 7 | **100%** |
| Utilities & config | 8 | 8 | **100%** |
| UI components | 26 | 26 | **100%** |
| Pages | 27 | 27 | **100%** |
| **Total** | | | **~100% (minor i18n gaps accepted)** |
