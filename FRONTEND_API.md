# Souk Digital — Frontend API Integration Guide
> Next.js 14+ · TypeScript · Zustand · TanStack Query · Tailwind CSS
> Complete guide to consuming the Spring Boot API from the Next.js frontend.

---

## Table of Contents
1. [API Client Setup](#1-api-client-setup)
2. [TypeScript Types](#2-typescript-types)
3. [Auth Store & Token Management](#3-auth-store--token-management)
4. [Authentication Flows](#4-authentication-flows)
5. [Products & Categories](#5-products--categories)
6. [Vendors](#6-vendors)
7. [Cart & Orders](#7-cart--orders)
8. [Payment — COD & CMI](#8-payment--cod--cmi)
9. [Reviews & Ratings](#9-reviews--ratings)
10. [Promo Codes](#10-promo-codes)
11. [Search & Filters](#11-search--filters)
12. [File Upload](#12-file-upload)
13. [Vendor Dashboard](#13-vendor-dashboard)
14. [Admin Panel](#14-admin-panel)
15. [Error Handling & Toast](#15-error-handling--toast)
16. [Loading & Skeleton States](#16-loading--skeleton-states)
17. [i18n + RTL Support](#17-i18n--rtl-support)
18. [Environment & Deployment](#18-environment--deployment)

---

## Global Architecture

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts           ← base fetch wrapper (auth headers, error handling)
│   │   ├── auth.ts             ← register, login, OTP, refresh
│   │   ├── products.ts         ← list, detail, CRUD
│   │   ├── categories.ts       ← tree, by slug
│   │   ├── vendors.ts          ← storefront, profile
│   │   ├── orders.ts           ← place, list, detail
│   │   ├── payment.ts          ← CMI init, status
│   │   ├── reviews.ts          ← add, list, stats
│   │   ├── promo.ts            ← validate
│   │   ├── search.ts           ← search, suggestions
│   │   ├── upload.ts           ← image upload
│   │   ├── vendor-dashboard.ts ← analytics
│   │   └── admin.ts            ← admin panel
│   ├── store/
│   │   ├── auth.ts             ← useAuthStore (Zustand)
│   │   └── cart.ts             ← useCartStore (Zustand + persist)
│   ├── hooks/
│   │   ├── use-products.ts     ← TanStack Query hooks
│   │   ├── use-orders.ts
│   │   ├── use-vendor.ts
│   │   └── use-reviews.ts
│   └── types/
│       └── api.ts              ← all TypeScript interfaces
├── components/
│   ├── ui/
│   │   ├── api-error.tsx       ← ApiError display component
│   │   ├── skeleton/           ← loading skeletons
│   │   └── toast-provider.tsx  ← global toast context
│   └── forms/
│       ├── login-form.tsx
│       ├── register-form.tsx
│       └── checkout-form.tsx
└── app/[locale]/
    ├── page.tsx                ← homepage (server component, fetch products)
    ├── auth/
    │   ├── login/page.tsx
    │   └── register/page.tsx
    ├── (shop)/
    │   ├── products/[slug]/page.tsx
    │   ├── categories/[slug]/page.tsx
    │   └── search/page.tsx
    ├── checkout/page.tsx
    ├── account/
    │   └── orders/page.tsx
    └── vendor/
        └── dashboard/page.tsx
```

---

## Stack Summary

| Concern | Library |
|---|---|
| HTTP client | native `fetch` + custom wrapper |
| Server state | TanStack Query v5 (`@tanstack/react-query`) |
| Client state | Zustand v4 |
| Forms | React Hook Form + Zod |
| Auth persistence | `localStorage` + `httpOnly` cookie for refresh token |
| Notifications | `sonner` (toast) |
| i18n | `next-intl` |
| Date formatting | `date-fns` |

---

## 1. API Client Setup

### Checklist
- [ ] Create `src/lib/api/client.ts` with base URL from `NEXT_PUBLIC_API_URL`
- [ ] Attach `Authorization: Bearer {token}` on every authenticated request
- [ ] Auto-refresh access token when 401 is received (using refresh token)
- [ ] Throw typed `ApiError` on non-ok responses (include status + message from backend JSON)
- [ ] Export typed helpers: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `del<T>`
- [ ] Handle network errors (offline, timeout)
- [ ] Add `Content-Type: application/json` default header
- [ ] Test: unauthenticated request to `/api/orders/my` gets 401 → redirected to login

### Claude Prompt
```
Create src/lib/api/client.ts for the Souk Digital Next.js frontend.
The Spring Boot API base URL is process.env.NEXT_PUBLIC_API_URL (e.g. http://localhost:8080/api).

Requirements:

1. ApiError class:
   export class ApiError extends Error {
     constructor(
       public status: number,
       public message: string,
       public errors?: Record<string, string>  // field validation errors from backend
     ) { super(message) }
   }

2. getToken() helper:
   Read access token from Zustand auth store (useAuthStore.getState().token)
   Do NOT read from localStorage directly — store manages persistence.

3. apiRequest<T>(path: string, options?: RequestInit): Promise<T>
   - Prepend NEXT_PUBLIC_API_URL
   - Set default headers: Content-Type: application/json, Accept: application/json
   - Attach Authorization: Bearer {token} if token exists
   - Call fetch()
   - If response status === 401:
     * Attempt token refresh: call POST /auth/refresh with refresh token
     * If refresh succeeds: update store with new token, retry original request once
     * If refresh fails: call useAuthStore.getState().logout(), redirect to /auth/login
   - If response not ok: parse JSON body, throw ApiError(status, body.message, body.errors)
   - If response ok with body: return response.json() as T
   - If response ok with no body (204): return undefined

4. Export typed wrappers:
   export const get = <T>(path: string, options?: RequestInit) =>
     apiRequest<T>(path, { ...options, method: 'GET' })
   export const post = <T>(path: string, body?: unknown, options?: RequestInit) =>
     apiRequest<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) })
   export const put = <T>(path: string, body?: unknown) =>
     apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) })
   export const patch = <T>(path: string, body?: unknown) =>
     apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
   export const del = <T>(path: string) =>
     apiRequest<T>(path, { method: 'DELETE' })

5. For Server Components (no Zustand), export a separate:
   export function serverGet<T>(path: string, token?: string): Promise<T>
   — attaches token directly as param, used in async page.tsx files
```

---

## 2. TypeScript Types

### Checklist
- [ ] Create `src/lib/types/api.ts` with all request/response interfaces
- [ ] Mirror all backend DTOs exactly (camelCase, matching field names)
- [ ] Add `Page<T>` generic for paginated responses
- [ ] Add all enum types (Role, OrderStatus, PaymentMethod, Badge)
- [ ] Export all types from a single index

### Claude Prompt
```
Create src/lib/types/api.ts with complete TypeScript types for Souk Digital API.
Mirror the Spring Boot DTOs exactly.

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number        // current page (0-indexed)
  size: number
  first: boolean
  last: boolean
}

// ─── Enums ────────────────────────────────────────────────────────────────────
export type Role = 'BUYER' | 'VENDOR' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'COD' | 'CARD_CMI' | 'MOBILE' | 'TRANSFER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type Badge = 'ARTISAN' | 'SALE' | 'NEW' | 'TOP' | 'FLASH'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
  role: Role
  isVerified: boolean
  avatarUrl: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: UserDto
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email?: string
  phone: string
  password: string
}

export interface LoginRequest {
  identifier: string   // email or phone
  password: string
}

export interface OtpVerifyRequest {
  phone: string
  code: string
}

export interface RegisterResponse {
  userId: string
  message: string
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface CategoryResponse {
  id: string
  name: string
  nameAr: string
  slug: string
  emoji: string | null
  imageUrl: string | null
  parentId: string | null
  children: CategoryResponse[]
  sortOrder: number
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface ProductVendorDto {
  id: string
  name: string
  slug: string
  artisan: boolean
  verified: boolean
  avatarUrl: string | null
}

export interface ProductSummaryDto {
  id: string
  slug: string
  name: string
  nameAr: string
  price: number
  originalPrice: number | null
  image: string | null
  rating: number
  reviewCount: number
  badge: Badge | null
  inStock: boolean
  freeDelivery: boolean
  city: string | null
  vendor: ProductVendorDto
}

export interface ProductDetailDto extends ProductSummaryDto {
  images: string[]
  description: string | null
  descriptionAr: string | null
  stockCount: number
  category: {
    id: string
    name: string
    nameAr: string
    slug: string
  }
}

export interface CreateProductRequest {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  price: number
  originalPrice?: number
  stockCount: number
  categoryId: string
  badge?: Badge
  city?: string
  freeDelivery?: boolean
  imageUrls: string[]
}

export interface ProductFilterRequest {
  category?: string
  minPrice?: number
  maxPrice?: number
  city?: string
  freeDelivery?: boolean
  artisanOnly?: boolean
  minRating?: number
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  size?: number
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export interface VendorSummaryDto {
  id: string
  slug: string
  name: string
  nameAr: string | null
  city: string
  rating: number
  reviewCount: number
  productCount: number
  artisan: boolean
  verified: boolean
  avatarUrl: string | null
  bannerUrl: string | null
}

export interface VendorDetailDto extends VendorSummaryDto {
  description: string | null
  descriptionAr: string | null
  followerCount: number
  memberSince: string   // ISO date string
  userId: string
}

export interface CreateVendorRequest {
  name: string
  nameAr?: string
  city: string
  description?: string
  descriptionAr?: string
  avatarUrl?: string
  bannerUrl?: string
  isArtisan?: boolean
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface DeliveryAddressRequest {
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  zipCode?: string
}

export interface OrderItemRequest {
  productId: string
  quantity: number
}

export interface PlaceOrderRequest {
  items: OrderItemRequest[]
  address: DeliveryAddressRequest
  paymentMethod: PaymentMethod
  promoCode?: string
}

export interface OrderItemDto {
  productId: string
  productName: string
  productImage: string | null
  vendorId: string
  vendorName: string
  price: number
  quantity: number
  subtotal: number
}

export interface OrderSummaryDto {
  id: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  total: number
  createdAt: string
  itemCount: number
  firstItemName: string
  firstItemImage: string | null
}

export interface OrderDetailDto extends OrderSummaryDto {
  items: OrderItemDto[]
  address: DeliveryAddressRequest
  subtotal: number
  discountAmount: number
  deliveryFee: number
  promoCode: string | null
  trackingNumber: string | null
  buyer: { firstName: string; lastName: string; phone: string }
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface CmiInitResponse {
  paymentUrl: string
  params: Record<string, string>
}

export interface PaymentStatusDto {
  orderId: string
  status: PaymentStatus
  provider: string
  providerRef: string | null
  amount: number
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface CreateReviewRequest {
  rating: number          // 1-5
  comment?: string
}

export interface ReviewDetailDto {
  id: string
  rating: number
  comment: string | null
  isVerifiedPurchase: boolean
  createdAt: string
  author: string          // "Fatima B."
  authorAvatar: string | null
}

export interface RatingDistributionDto {
  star: number
  count: number
  percent: number
}

export interface ReviewStatsDto {
  averageRating: number
  totalCount: number
  distribution: RatingDistributionDto[]
}

// ─── Promo ────────────────────────────────────────────────────────────────────
export interface PromoValidationResponse {
  valid: boolean
  code: string
  discountPercent: number | null
  message: string
}

// ─── Search ───────────────────────────────────────────────────────────────────
export interface SearchResultsDto {
  products: Page<ProductSummaryDto>
  vendors: VendorSummaryDto[]
  totalProducts: number
  query: string
}

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────
export interface DashboardStatsDto {
  revenue: number
  revenueTotal: number
  revenueGrowthPct: number
  ordersThisMonth: number
  ordersTotal: number
  ordersGrowthPct: number
  activeProducts: number
  averageRating: number
  reviewCount: number
}

export interface MonthlyRevenueDto {
  month: string       // "2026-04"
  revenue: number
  orderCount: number
}

export interface TopProductDto {
  productId: string
  name: string
  image: string | null
  totalSold: number
  revenue: number
  rating: number
}
```

---

## 3. Auth Store & Token Management

### Checklist
- [ ] Create `src/lib/store/auth.ts` with Zustand + persist middleware
- [ ] Store: `user`, `token`, `refreshToken`, `isAuthenticated`
- [ ] Actions: `setAuth(AuthResponse)`, `logout()`, `updateUser(UserDto)`
- [ ] Persist `token` + `refreshToken` to `localStorage` (key: `souk-auth`)
- [ ] Hydrate store on client side (avoid SSR mismatch)
- [ ] `logout()` clears store + localStorage + redirects to `/auth/login`
- [ ] Create `src/lib/store/cart.ts` with Zustand + persist
- [ ] Cart: items array, addItem, removeItem, updateQty, clear, total, itemCount
- [ ] Cart persisted to `localStorage` (key: `souk-cart`)
- [ ] On login: merge guest cart with any server-side state if needed

### Claude Prompt
```
Create Zustand stores for Souk Digital Next.js frontend.

1. src/lib/store/auth.ts:
   Use zustand with persist middleware, storage: localStorage, key: 'souk-auth'.

   State:
     user: UserDto | null
     token: string | null
     refreshToken: string | null
     isAuthenticated: boolean

   Actions:
     setAuth(response: AuthResponse): void
       → set user, token, refreshToken, isAuthenticated=true

     logout(): void
       → reset all state to null/false
       → call router.push('/auth/login') — use a callback or the store caller handles redirect

     updateUser(user: UserDto): void
       → update user in store (used after profile update)

   Selectors (export as hooks):
     export const useIsAuthenticated = () => useAuthStore(s => s.isAuthenticated)
     export const useCurrentUser = () => useAuthStore(s => s.user)
     export const useIsVendor = () => useAuthStore(s => s.user?.role === 'VENDOR')
     export const useIsAdmin = () => useAuthStore(s => s.user?.role === 'ADMIN')

   Handle SSR hydration: export useAuthHydrated hook that returns false until store is hydrated.

2. src/lib/store/cart.ts:
   Use zustand with persist middleware, storage: localStorage, key: 'souk-cart'.

   CartItem interface:
     productId: string
     productSlug: string
     name: string
     nameAr: string
     price: number
     image: string | null
     vendorId: string
     vendorName: string
     quantity: number
     maxStock: number

   State:
     items: CartItem[]
     promoCode: string | null
     promoDiscount: number       // percent
     promoDiscountAmount: number // calculated MAD amount

   Actions:
     addItem(item: Omit<CartItem, 'quantity'>, qty?: number): void
       → if item already in cart, increment quantity (cap at maxStock)
       → else push new item
     removeItem(productId: string): void
     updateQty(productId: string, qty: number): void
       → clamp qty between 1 and item.maxStock
       → if qty === 0, remove item
     applyPromo(code: string, discountPercent: number): void
     removePromo(): void
     clear(): void

   Computed (not in state, derive in component or selector):
     subtotal: sum(item.price * item.quantity)
     deliveryFee: subtotal >= 300 ? 0 : 35
     discountAmount: subtotal * promoDiscount / 100
     total: subtotal - discountAmount + deliveryFee
     itemCount: sum(item.quantity)
```

---

## 4. Authentication Flows

### Checklist
- [ ] Create `src/lib/api/auth.ts` with all auth API functions
- [ ] `register(RegisterRequest)` → POST `/auth/register`
- [ ] `verifyOtp(OtpVerifyRequest)` → POST `/auth/verify-otp` → save `AuthResponse` to store
- [ ] `login(LoginRequest)` → POST `/auth/login` → save `AuthResponse` to store
- [ ] `refreshToken(token: string)` → POST `/auth/refresh` (used internally by client.ts)
- [ ] `resendOtp(phone: string)` → POST `/auth/resend-otp`
- [ ] Register page: form → call `register()` → redirect to OTP verify page with phone in state
- [ ] OTP verify page: 6-digit input, auto-submit on complete, resend button with 60s cooldown
- [ ] Login page: email/phone + password form
- [ ] Protected routes: middleware checks token, redirects to login if missing
- [ ] After login: redirect to previous page or homepage
- [ ] Show role-based nav items (vendor dashboard link, admin link)

### Claude Prompt
```
Implement authentication API functions and pages for Souk Digital Next.js frontend.

1. src/lib/api/auth.ts:
   import { post } from './client'
   import type { RegisterRequest, LoginRequest, OtpVerifyRequest, AuthResponse, RegisterResponse } from '../types/api'

   export const authApi = {
     register: (data: RegisterRequest) =>
       post<RegisterResponse>('/auth/register', data),

     verifyOtp: (data: OtpVerifyRequest) =>
       post<AuthResponse>('/auth/verify-otp', data),

     login: (data: LoginRequest) =>
       post<AuthResponse>('/auth/login', data),

     refreshToken: (refreshToken: string) =>
       post<{ accessToken: string }>('/auth/refresh', { refreshToken }),

     resendOtp: (phone: string) =>
       post<void>('/auth/resend-otp', { phone }),
   }

2. src/app/[locale]/auth/register/page.tsx (Client Component):
   Use React Hook Form + Zod schema:
     firstName: z.string().min(2)
     lastName: z.string().min(2)
     phone: z.string().regex(/^(\+212|0)[5-7][0-9]{8}$/, 'Numéro marocain invalide')
     email: z.string().email().optional().or(z.literal(''))
     password: z.string().min(8)
     confirmPassword: same as password
   On submit: call authApi.register(), on success redirect to /auth/verify-otp?phone={phone}
   Show ApiError message under form on failure.
   Link to login page.

3. src/app/[locale]/auth/verify-otp/page.tsx (Client Component):
   Read phone from URL search params.
   Show 6 separate digit inputs (or one OTP input component).
   Auto-submit when all 6 digits filled.
   On success: call useAuthStore.setAuth(response), redirect to homepage or previous page.
   Resend button: disabled for 60 seconds with countdown, then calls authApi.resendOtp(phone).
   Show error if code wrong.

4. src/app/[locale]/auth/login/page.tsx (Client Component):
   React Hook Form + Zod:
     identifier: z.string().min(3)  (email or phone)
     password: z.string().min(1)
   On success: useAuthStore.setAuth(response), redirect.
   Link to register page.

5. src/middleware.ts:
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   Protected paths: /account/**, /checkout/**, /vendor/**, /admin/**
   Read token from 'souk-auth' cookie or Authorization header.
   If token missing: redirect to /auth/login?from={pathname}
   If path starts with /vendor/**:  check role claim in JWT payload === 'VENDOR' or 'ADMIN'
   If path starts with /admin/**:   check role === 'ADMIN'
   On role mismatch: redirect to /403

   Note: parse JWT claims client-side (base64 decode middle segment, no signature check needed in middleware — real check is on API server).
```

---

## 5. Products & Categories

### Checklist
- [ ] Create `src/lib/api/products.ts` with all product functions
- [ ] Create `src/lib/api/categories.ts`
- [ ] Create `src/lib/hooks/use-products.ts` (TanStack Query)
- [ ] Homepage: server component fetches featured products + categories
- [ ] Category page: paginated grid with filter sidebar
- [ ] Product detail page: images gallery, add to cart, related products
- [ ] Replace all `MOCK_PRODUCTS`, `MOCK_CATEGORIES` imports with real API calls
- [ ] Infinite scroll or pagination on product grid
- [ ] Filters: price range slider, city dropdown, checkboxes (freeDelivery, artisanOnly)
- [ ] Sort dropdown: relevance, price ↑, price ↓, rating, newest
- [ ] Product not found → `notFound()` (Next.js 404)
- [ ] `generateMetadata` for SEO on product detail page

### Claude Prompt
```
Implement Products & Categories API integration for Souk Digital Next.js frontend.

1. src/lib/api/products.ts:
   import { get, post, put, patch, del } from './client'
   import type { Page, ProductSummaryDto, ProductDetailDto, ProductFilterRequest, CreateProductRequest } from '../types/api'

   export const productsApi = {
     getAll: (filters: ProductFilterRequest = {}) => {
       const params = new URLSearchParams()
       Object.entries(filters).forEach(([k, v]) => {
         if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
       })
       return get<Page<ProductSummaryDto>>(`/products?${params}`)
     },

     getBySlug: (slug: string) =>
       get<ProductDetailDto>(`/products/${slug}`),

     getRelated: (id: string) =>
       get<ProductSummaryDto[]>(`/products/${id}/related`),

     create: (data: CreateProductRequest) =>
       post<ProductDetailDto>('/products', data),

     update: (id: string, data: Partial<CreateProductRequest>) =>
       put<ProductDetailDto>(`/products/${id}`, data),

     delete: (id: string) =>
       del<void>(`/products/${id}`),

     toggleActive: (id: string) =>
       patch<ProductDetailDto>(`/products/${id}/toggle`),
   }

2. src/lib/api/categories.ts:
   export const categoriesApi = {
     getAll: () => get<CategoryResponse[]>('/categories'),
     getBySlug: (slug: string) => get<CategoryResponse>(`/categories/${slug}`),
     getProducts: (slug: string, filters?: ProductFilterRequest) => {
       const params = new URLSearchParams(filters as Record<string, string>)
       return get<Page<ProductSummaryDto>>(`/categories/${slug}/products?${params}`)
     },
   }

3. src/lib/hooks/use-products.ts (TanStack Query):
   export function useProducts(filters: ProductFilterRequest) {
     return useQuery({
       queryKey: ['products', filters],
       queryFn: () => productsApi.getAll(filters),
       staleTime: 60_000,
       placeholderData: keepPreviousData,   // smooth pagination
     })
   }

   export function useProduct(slug: string) {
     return useQuery({
       queryKey: ['product', slug],
       queryFn: () => productsApi.getBySlug(slug),
       staleTime: 300_000,
     })
   }

   export function useRelatedProducts(id: string) {
     return useQuery({
       queryKey: ['products', 'related', id],
       queryFn: () => productsApi.getRelated(id),
       staleTime: 300_000,
     })
   }

   export function useCreateProduct() {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: productsApi.create,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
     })
   }

4. src/app/[locale]/(shop)/products/[slug]/page.tsx (Server Component):
   export async function generateMetadata({ params }) {
     const product = await productsApi.getBySlug(params.slug).catch(() => null)
     if (!product) return { title: 'Produit introuvable' }
     return {
       title: `${product.name} — Souk Digital`,
       description: product.description,
       openGraph: { images: [product.image] },
     }
   }

   export default async function ProductPage({ params }) {
     const product = await productsApi.getBySlug(params.slug).catch(() => null)
     if (!product) notFound()
     return <ProductDetailView product={product} />
   }

5. src/app/[locale]/(shop)/categories/[slug]/page.tsx (Server Component with Client filter sidebar):
   Fetch category server-side, render filter sidebar as Client Component.
   Pass initial products data as prop, Client Component hydrates TanStack Query cache.
   URL params sync with filters: router.push with updated searchParams on filter change.

6. Homepage src/app/[locale]/page.tsx:
   Fetch in parallel:
     const [categories, featured, newArrivals, artisan] = await Promise.all([
       categoriesApi.getAll(),
       productsApi.getAll({ sort: 'rating', size: 8 }),
       productsApi.getAll({ sort: 'newest', size: 8 }),
       productsApi.getAll({ artisanOnly: true, size: 4 }),
     ])
   Replace all MOCK_* imports.
```

---

## 6. Vendors

### Checklist
- [ ] Create `src/lib/api/vendors.ts`
- [ ] Create `src/lib/hooks/use-vendor.ts`
- [ ] Vendor storefront page: banner, avatar, products grid, stats
- [ ] Vendors listing page: grid with city filter
- [ ] "Become a Vendor" flow: form → POST `/vendors/register` → new JWT issued
- [ ] After vendor registration: refresh auth store with new token (role = VENDOR)
- [ ] Follow / unfollow vendor button (authenticated)
- [ ] Vendor products tab with pagination
- [ ] Verified badge + artisan badge display

### Claude Prompt
```
Implement Vendor API integration for Souk Digital Next.js frontend.

1. src/lib/api/vendors.ts:
   export const vendorsApi = {
     getAll: (params?: { page?: number; size?: number; city?: string }) => {
       const qs = new URLSearchParams(params as Record<string, string>)
       return get<Page<VendorSummaryDto>>(`/vendors?${qs}`)
     },

     getBySlug: (slug: string) =>
       get<VendorDetailDto>(`/vendors/${slug}`),

     getProducts: (slug: string, page = 0) =>
       get<Page<ProductSummaryDto>>(`/vendors/${slug}/products?page=${page}`),

     register: (data: CreateVendorRequest) =>
       post<AuthResponse>('/vendors/register', data),
       // returns new AuthResponse with updated role=VENDOR token

     getMyProfile: () =>
       get<VendorDetailDto>('/vendors/me'),

     updateMyProfile: (data: Partial<CreateVendorRequest>) =>
       put<VendorDetailDto>('/vendors/me', data),

     follow: (vendorId: string) =>
       post<void>(`/vendors/${vendorId}/follow`),

     unfollow: (vendorId: string) =>
       del<void>(`/vendors/${vendorId}/follow`),
   }

2. src/lib/hooks/use-vendor.ts:
   export function useVendor(slug: string) {
     return useQuery({
       queryKey: ['vendor', slug],
       queryFn: () => vendorsApi.getBySlug(slug),
     })
   }

   export function useMyVendorProfile() {
     const isVendor = useIsVendor()
     return useQuery({
       queryKey: ['vendor', 'me'],
       queryFn: vendorsApi.getMyProfile,
       enabled: isVendor,
     })
   }

   export function useBecomeVendor() {
     const setAuth = useAuthStore(s => s.setAuth)
     return useMutation({
       mutationFn: vendorsApi.register,
       onSuccess: (data) => {
         setAuth(data)
         // New JWT has role=VENDOR
       },
     })
   }

3. src/app/[locale]/(shop)/vendors/[slug]/page.tsx (Server Component):
   Fetch vendor + first page of products in parallel.
   Render: banner image, avatar, name, verified/artisan badges, city, stats (products, rating, followers, memberSince).
   Tabs: Products | À propos
   Products tab: paginated grid (client component).
   Follow button: visible only when authenticated (isAuthenticated && user.role !== vendor.userId).

4. src/app/[locale]/account/become-vendor/page.tsx (Client Component, AUTH required):
   React Hook Form + Zod:
     name: z.string().min(3)
     city: z.string().min(2)
     description: z.string().optional()
     isArtisan: z.boolean().default(false)
   On success: show success toast + redirect to /vendor/dashboard.
   Note: after useBecomeVendor succeeds, the auth store has a new token — protected routes will work immediately.
```

---

## 7. Cart & Orders

### Checklist
- [ ] Cart sidebar/drawer component using `useCartStore`
- [ ] Add to cart button on product card + product detail page
- [ ] Cart shows: item image, name, vendor, price, qty stepper, remove button
- [ ] Cart summary: subtotal, delivery fee (free if ≥ 300 MAD), promo discount, total
- [ ] Checkout page: delivery address form + payment method selector
- [ ] Create `src/lib/api/orders.ts`
- [ ] On place order success: clear cart, redirect to `/account/orders/{id}`
- [ ] Order history page: list with status badges
- [ ] Order detail page: items, address, timeline, payment info
- [ ] Stock validation: disable "Add to Cart" if `!product.inStock`
- [ ] Quantity picker: cannot exceed `product.stockCount`

### Claude Prompt
```
Implement Cart UI and Orders API integration for Souk Digital Next.js frontend.

1. src/lib/api/orders.ts:
   export const ordersApi = {
     place: (data: PlaceOrderRequest) =>
       post<OrderDetailDto>('/orders', data),

     getMyOrders: (page = 0) =>
       get<Page<OrderSummaryDto>>(`/orders/my?page=${page}`),

     getById: (id: string) =>
       get<OrderDetailDto>(`/orders/${id}`),

     updateStatus: (id: string, status: OrderStatus) =>
       patch<OrderDetailDto>(`/orders/${id}/status`, { status }),
   }

2. src/components/cart/cart-drawer.tsx (Client Component):
   Slide-over panel (Sheet component from shadcn or custom).
   For each CartItem: show image, name (locale-aware: name or nameAr), vendor, price × qty.
   Qty stepper: - button, number, + button (capped at maxStock).
   Remove button (X icon).
   Bottom section:
     Subtotal: X MAD
     Livraison: Gratuite / 35 MAD
     Promo: -Y MAD (if applied)
     Total: Z MAD
   "Passer la commande" button → navigates to /checkout
   Empty state with illustration and link to browse.

3. src/app/[locale]/checkout/page.tsx (Client Component, AUTH required):
   Step 1: Delivery address form (React Hook Form + Zod):
     firstName, lastName, phone (Moroccan format), street, city, zipCode (optional)
   Step 2: Payment method selector:
     COD (Cash à la livraison) — radio card with truck icon
     CARD_CMI (Carte bancaire) — radio card with credit card icon
     MOBILE (Paiement mobile) — radio card with phone icon
   Step 3: Review & confirm:
     Show cart items, totals, selected address, payment method
     Promo code input: text field + "Appliquer" button → call promoApi.validate(), update cart store
   "Confirmer la commande" button:
     Build PlaceOrderRequest from cart items + form values
     Call ordersApi.place(req)
     On success:
       cartStore.clear()
       if paymentMethod === 'CARD_CMI': redirect to CMI payment
       else: redirect to /account/orders/{orderId}?success=true

4. src/app/[locale]/account/orders/page.tsx (Client Component, AUTH required):
   useInfiniteQuery or paginated list of orders.
   Each order row: order id (short), date, status badge (color-coded), total, "Voir" button.
   Status badge colors:
     PENDING: yellow, CONFIRMED: blue, PROCESSING: indigo, SHIPPED: purple,
     DELIVERED: green, CANCELLED: red, REFUNDED: gray

5. src/app/[locale]/account/orders/[id]/page.tsx:
   Fetch order detail.
   Show: order items table, delivery address card, payment info card.
   Timeline of status changes (simplified — show current status prominently).
   "Télécharger la facture" button (optional PDF download — stub for now).
```

---

## 8. Payment — COD & CMI

### Checklist
- [ ] Create `src/lib/api/payment.ts`
- [ ] COD orders: no payment page — go straight to confirmation
- [ ] CMI orders: call `/payment/cmi/init` → get form params → auto-submit HTML form to CMI gateway
- [ ] Success page (`/checkout/success?orderId=...`): show order confirmation
- [ ] Failure page (`/checkout/failure?orderId=...`): show retry options
- [ ] Payment status polling: poll `/payment/order/{id}` every 3s for 30s after CMI redirect
- [ ] Display payment status in order detail page

### Claude Prompt
```
Implement Payment integration for Souk Digital Next.js frontend.

1. src/lib/api/payment.ts:
   export const paymentApi = {
     initCmi: (orderId: string) =>
       post<CmiInitResponse>('/payment/cmi/init', { orderId }),

     getStatus: (orderId: string) =>
       get<PaymentStatusDto>(`/payment/order/${orderId}`),
   }

2. src/lib/hooks/use-cmi-payment.ts:
   export function useCmiPayment() {
     return useMutation({
       mutationFn: paymentApi.initCmi,
       onSuccess: (data) => {
         // Create hidden form and auto-submit to CMI
         const form = document.createElement('form')
         form.method = 'POST'
         form.action = data.paymentUrl
         Object.entries(data.params).forEach(([key, value]) => {
           const input = document.createElement('input')
           input.type = 'hidden'
           input.name = key
           input.value = value
           form.appendChild(input)
         })
         document.body.appendChild(form)
         form.submit()
       },
     })
   }

3. In checkout page, after ordersApi.place() succeeds:
   if (data.paymentMethod === 'CARD_CMI') {
     const { mutate: initPayment } = useCmiPayment()
     initPayment(data.id)
     // User is redirected to CMI gateway
     // CMI redirects back to okUrl or failUrl configured on backend
   }

4. src/app/[locale]/checkout/success/page.tsx:
   Read orderId from searchParams.
   Poll paymentApi.getStatus(orderId) every 3 seconds (up to 10 attempts) until status = PAID.
   Show loading spinner while polling.
   On PAID: show success animation + order summary + "Voir ma commande" button.
   On timeout: show "Vérification en cours" with manual refresh button.

5. src/app/[locale]/checkout/failure/page.tsx:
   Show error message, order id, options:
   - "Réessayer le paiement" → call paymentApi.initCmi again
   - "Payer à la livraison" → patch order (if backend supports method change — else contact support)
   - "Annuler la commande" → contact support message

6. src/components/checkout/payment-method-selector.tsx:
   RadioGroup with 3 options:
   COD card:
     Icon: truck, Title: "Cash à la livraison", Description: "Payez quand vous recevez"
   CARD_CMI card:
     Icon: credit-card, Title: "Carte bancaire", Description: "Visa, Mastercard — sécurisé par CMI"
     Show CMI + bank logos
   MOBILE card:
     Icon: smartphone, Title: "Paiement mobile", Description: "CIH Pay, M-Wallet"
```

---

## 9. Reviews & Ratings

### Checklist
- [ ] Create `src/lib/api/reviews.ts`
- [ ] Create `src/lib/hooks/use-reviews.ts`
- [ ] Star rating component (interactive for write, display for read)
- [ ] Rating distribution bar chart on product detail page
- [ ] Review list with pagination (5 per page)
- [ ] Add review form: only visible when authenticated
- [ ] "Achat vérifié" badge on verified purchase reviews
- [ ] Author avatar with fallback initials
- [ ] Delete own review button (with confirmation)
- [ ] Optimistic update: show new review immediately

### Claude Prompt
```
Implement Reviews & Ratings for Souk Digital Next.js frontend.

1. src/lib/api/reviews.ts:
   export const reviewsApi = {
     getByProduct: (productId: string, page = 0) =>
       get<Page<ReviewDetailDto>>(`/products/${productId}/reviews?page=${page}&size=5`),

     getStats: (productId: string) =>
       get<ReviewStatsDto>(`/products/${productId}/reviews/stats`),

     create: (productId: string, data: CreateReviewRequest) =>
       post<ReviewDetailDto>(`/products/${productId}/reviews`, data),

     delete: (reviewId: string) =>
       del<void>(`/reviews/${reviewId}`),
   }

2. src/lib/hooks/use-reviews.ts:
   export function useReviews(productId: string) {
     return useInfiniteQuery({
       queryKey: ['reviews', productId],
       queryFn: ({ pageParam = 0 }) => reviewsApi.getByProduct(productId, pageParam),
       getNextPageParam: (last) => last.last ? undefined : last.number + 1,
     })
   }

   export function useReviewStats(productId: string) {
     return useQuery({
       queryKey: ['reviews', 'stats', productId],
       queryFn: () => reviewsApi.getStats(productId),
     })
   }

   export function useAddReview(productId: string) {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: (data: CreateReviewRequest) => reviewsApi.create(productId, data),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
         queryClient.invalidateQueries({ queryKey: ['product'] })
       },
     })
   }

3. src/components/reviews/star-rating.tsx:
   Props: value (number), onChange? (makes it interactive), size ('sm' | 'md' | 'lg')
   Render 5 stars. Filled = gold, empty = gray. Half stars for display mode.
   Interactive mode: hover highlights, click sets value.

4. src/components/reviews/rating-distribution.tsx:
   Props: stats: ReviewStatsDto
   Render: average rating big number + stars + total count
   5 bars (one per star rating), showing % and count.
   Use CSS width style for bar fill: style={{ width: `${item.percent}%` }}

5. src/components/reviews/review-form.tsx:
   React Hook Form + Zod:
     rating: z.number().min(1).max(5)
     comment: z.string().max(1000).optional()
   Show only when isAuthenticated.
   Star rating picker component for rating field.
   Textarea for comment.
   Submit calls useAddReview().mutate(data), shows toast on success.
   If ApiError status 400 and message contains "déjà": show "Vous avez déjà noté ce produit".

6. src/components/reviews/review-card.tsx:
   Props: review: ReviewDetailDto, onDelete?: () => void
   Show: author avatar (image or initials fallback), author name, date (relative: "il y a 2 jours"),
   stars, comment, "Achat vérifié" badge (green checkmark) if isVerifiedPurchase.
   Delete button only visible if review.authorId === currentUser.id or currentUser.role === 'ADMIN'.
```

---

## 10. Promo Codes

### Checklist
- [ ] Create `src/lib/api/promo.ts`
- [ ] Promo input in checkout page
- [ ] Validate on "Appliquer" click → show discount or error
- [ ] Apply discount to cart totals display
- [ ] Remove promo code button
- [ ] Show promo name + discount % badge in cart summary

### Claude Prompt
```
Implement Promo Code integration for Souk Digital Next.js frontend.

1. src/lib/api/promo.ts:
   export const promoApi = {
     validate: (code: string) =>
       post<PromoValidationResponse>('/promo/validate', { code }),
   }

2. src/components/checkout/promo-input.tsx (Client Component):
   Props: onApply: (code: string, discountPercent: number) => void
          onRemove: () => void
          appliedCode: string | null
          discountPercent: number | null

   If no code applied:
     Text input + "Appliquer" button
     On click: call promoApi.validate(code)
       On { valid: true }: call onApply(code, discountPercent), show green success message
       On { valid: false }: show red error message (response.message from backend)
     Loading state on button while validating
     Handle ApiError (network error fallback)

   If code applied:
     Show: "{CODE} — {X}% de réduction" badge in green
     X icon to remove → call onRemove()

3. In checkout page, wire promo to cart store:
   const { promoCode, promoDiscount, promoDiscountAmount } = useCartStore()
   Pass to PromoInput:
     onApply: (code, pct) => cartStore.applyPromo(code, pct)
     onRemove: () => cartStore.removePromo()
     appliedCode: promoCode
     discountPercent: promoDiscount

4. In cart summary component, show:
   if promoCode:
     <div>Code promo ({promoCode}): <span>-{promoDiscountAmount.toFixed(2)} MAD</span></div>
```

---

## 11. Search & Filters

### Checklist
- [ ] Create `src/lib/api/search.ts`
- [ ] Header search bar with autocomplete (suggestions endpoint)
- [ ] Debounce suggestions by 300ms
- [ ] Search results page: `/search?q=tajine&category=...`
- [ ] Shows both products (paginated) and matching vendors (up to 4)
- [ ] URL search params stay in sync with filters
- [ ] Filter sidebar same as category page
- [ ] Empty state with suggestions when no results

### Claude Prompt
```
Implement Search & Filters for Souk Digital Next.js frontend.

1. src/lib/api/search.ts:
   export const searchApi = {
     search: (params: ProductFilterRequest & { q?: string }) => {
       const qs = new URLSearchParams(
         Object.fromEntries(
           Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
         ) as Record<string, string>
       )
       return get<SearchResultsDto>(`/search?${qs}`)
     },

     suggestions: (q: string) =>
       get<string[]>(`/search/suggestions?q=${encodeURIComponent(q)}`),
   }

2. src/components/layout/search-bar.tsx (Client Component):
   Controlled input with Combobox pattern.
   Debounce 300ms → call searchApi.suggestions(q) using useQuery with enabled: q.length > 1.
   Show dropdown with max 5 suggestions.
   Each suggestion: click → navigate to /search?q={suggestion}
   On Enter: navigate to /search?q={inputValue}
   Close dropdown on Escape or click outside.
   Mobile: full-screen modal overlay with search input.

3. src/app/[locale]/(shop)/search/page.tsx (Server Component + Client filters):
   Read q, category, page, sort from searchParams.
   Fetch results server-side for initial render.
   Pass to client SearchResultsView component.

   SearchResultsView:
   - If vendors.length > 0: show "Vendeurs" section (horizontal scroll, max 4)
   - Products grid with pagination
   - Left sidebar: filter panel (same as category page)
   - Top bar: "{totalProducts} produits trouvés pour '{query}'"
   - Sort dropdown
   - Active filters chips (e.g., "Prix: 50-500 MAD ×", "Artisan ×")

4. Filter panel (shared component used by category + search pages):
   src/components/filters/filter-panel.tsx
   Props: filters: ProductFilterRequest, onChange: (filters) => void

   Sections:
   - Prix: dual range slider (min/max, step 10 MAD)
   - Ville: dropdown with Moroccan cities (static list + "Toutes")
   - Livraison: checkbox "Livraison gratuite"
   - Type: checkbox "Artisanat uniquement"
   - Note min: star buttons (1★ to 5★)

   On any change: call onChange with new filters.
   Caller does: router.push with updated URL params (keeps existing params, merges changes).
   "Effacer les filtres" button resets all.

5. URL sync hook: src/lib/hooks/use-filter-params.ts
   Read from useSearchParams(), convert to ProductFilterRequest.
   Provide updateFilters(partial) that calls router.push with merged params.
   Used by filter panel and sort dropdown to stay in sync with URL.
```

---

## 12. File Upload

### Checklist
- [ ] Create `src/lib/api/upload.ts`
- [ ] Image upload component with drag & drop
- [ ] Preview uploaded images before saving
- [ ] Multiple images (up to 8) for product creation
- [ ] Single image for vendor avatar / banner
- [ ] Show upload progress
- [ ] Validate: JPEG/PNG/WebP only, max 5MB (client-side, before API call)
- [ ] Remove uploaded image from list

### Claude Prompt
```
Implement File Upload integration for Souk Digital Next.js frontend.

1. src/lib/api/upload.ts:
   Note: upload uses multipart/form-data — do NOT set Content-Type manually (browser sets boundary).

   export const uploadApi = {
     uploadImage: async (file: File, folder: string): Promise<{ url: string }> => {
       const formData = new FormData()
       formData.append('file', file)
       formData.append('folder', folder)
       const token = useAuthStore.getState().token
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
         body: formData,
       })
       if (!res.ok) {
         const err = await res.json()
         throw new ApiError(res.status, err.message)
       }
       return res.json()
     },

     uploadImages: async (files: File[], folder: string): Promise<{ urls: string[] }> => {
       const formData = new FormData()
       files.forEach(f => formData.append('files', f))
       formData.append('folder', folder)
       const token = useAuthStore.getState().token
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${token}` },
         body: formData,
       })
       if (!res.ok) throw new ApiError(res.status, 'Upload failed')
       return res.json()
     },
   }

2. src/components/upload/image-upload.tsx (Client Component):
   Props:
     value: string[]             — current image URLs
     onChange: (urls: string[]) => void
     maxImages?: number          — default 1
     folder: string             — 'products' | 'vendors' | 'avatars'

   Drag & drop zone (use react-dropzone or native drag events).
   Client-side validation before upload:
     Accept: image/jpeg, image/png, image/webp
     Max size: 5MB per file
     Show error toast if invalid.
   Preview grid: show thumbnail of each uploaded image.
   Remove button (×) on each preview.
   Upload progress: show spinner on each image while uploading.
   For maxImages=1: show single avatar upload with circular preview.

3. In product create/edit form (Vendor):
   <ImageUpload
     value={form.watch('imageUrls')}
     onChange={(urls) => form.setValue('imageUrls', urls)}
     maxImages={8}
     folder="products"
   />

4. In vendor profile form:
   <ImageUpload value={[avatarUrl]} onChange={([url]) => setAvatarUrl(url)} maxImages={1} folder="avatars" />
   <ImageUpload value={[bannerUrl]} onChange={([url]) => setBannerUrl(url)} maxImages={1} folder="vendors" />
```

---

## 13. Vendor Dashboard

### Checklist
- [ ] Create `src/lib/api/vendor-dashboard.ts`
- [ ] Dashboard layout: sidebar nav (stats, orders, products, profile)
- [ ] Stats page: revenue card, orders card, products card, rating card — all with growth %
- [ ] Revenue trend chart (last 12 months) using Recharts or Chart.js
- [ ] Orders table with status filter tabs + status update button
- [ ] Top products list
- [ ] Products management: list, create, edit, toggle active
- [ ] All dashboard pages require VENDOR role (middleware)

### Claude Prompt
```
Implement Vendor Dashboard pages for Souk Digital Next.js frontend.
All routes under /vendor/** require role=VENDOR (enforced by middleware.ts).

1. src/lib/api/vendor-dashboard.ts:
   export const vendorDashboardApi = {
     getStats: () =>
       get<DashboardStatsDto>('/vendor/dashboard/stats'),

     getRevenueTrend: (months = 12) =>
       get<MonthlyRevenueDto[]>(`/vendor/dashboard/revenue-trend?months=${months}`),

     getOrders: (params?: { page?: number; size?: number; status?: OrderStatus }) => {
       const qs = new URLSearchParams(params as Record<string, string>)
       return get<Page<OrderSummaryDto>>(`/vendor/dashboard/orders?${qs}`)
     },

     getTopProducts: (limit = 5) =>
       get<TopProductDto[]>(`/vendor/dashboard/top-products?limit=${limit}`),

     getOrdersByStatus: () =>
       get<Record<string, number>>('/vendor/dashboard/orders-status'),
   }

2. src/app/[locale]/vendor/dashboard/page.tsx:
   Fetch stats + revenue trend in parallel (server component or client with useQuery).

   Layout: sidebar with links:
     Tableau de bord | Commandes | Produits | Profil

   Stats grid (4 cards):
   - Revenu ce mois: X MAD (growth badge: +12% or -5% with arrow)
   - Commandes ce mois: count
   - Produits actifs: count
   - Note moyenne: X.X ★

   Revenue trend chart:
     Line chart or bar chart, X-axis: month labels, Y-axis: MAD
     Use Recharts ResponsiveContainer + BarChart or LineChart
     Data from vendorDashboardApi.getRevenueTrend()

   Orders by status donut chart.

3. src/app/[locale]/vendor/dashboard/orders/page.tsx:
   Filter tabs: Toutes | En attente | Confirmées | Expédiées | Livrées
   Table: # | Produit | Acheteur | Total | Date | Statut | Actions
   "Mettre à jour" dropdown button → calls ordersApi.updateStatus(id, newStatus)
   Allowed transitions shown only:
     CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   Optimistic update + toast on success.

4. src/app/[locale]/vendor/dashboard/products/page.tsx:
   Product list table: Image | Nom | Prix | Stock | Statut | Actions
   Toggle active switch → productsApi.toggleActive(id)
   Edit button → /vendor/dashboard/products/{id}/edit
   Create product button → /vendor/dashboard/products/new
   Delete button with confirmation dialog → productsApi.delete(id)

5. Product create/edit form page:
   React Hook Form + Zod (mirror CreateProductRequest validation).
   Fields: name (FR + AR), description (FR + AR), price, originalPrice, stockCount,
   category (dropdown, fetch from categoriesApi.getAll()), badge, city, freeDelivery, images.
   Submit calls productsApi.create() or productsApi.update().
   On success: redirect to products list + invalidate products query.
```

---

## 14. Admin Panel

### Checklist
- [ ] Create `src/lib/api/admin.ts`
- [ ] Admin layout: sidebar with all sections
- [ ] Users table: search, role change, ban/unban
- [ ] Vendors table: verify/unverify, toggle artisan
- [ ] Orders table: all orders, status override, refund
- [ ] Products moderation: activate/deactivate, hard delete
- [ ] Platform stats dashboard
- [ ] Promo codes management: create, list, toggle
- [ ] All admin pages require ADMIN role (middleware)

### Claude Prompt
```
Implement Admin Panel pages for Souk Digital Next.js frontend.
All routes under /admin/** require role=ADMIN (enforced by middleware.ts).

1. src/lib/api/admin.ts:
   export const adminApi = {
     // Users
     getUsers: (params?: { page?: number; q?: string }) =>
       get<Page<AdminUserDto>>(`/admin/users?${new URLSearchParams(params as any)}`),
     changeUserRole: (id: string, role: Role) =>
       patch<void>(`/admin/users/${id}/role`, { role }),
     banUser: (id: string) =>
       patch<void>(`/admin/users/${id}/ban`),
     unbanUser: (id: string) =>
       patch<void>(`/admin/users/${id}/unban`),

     // Vendors
     getVendors: (page = 0) =>
       get<Page<AdminVendorDto>>(`/admin/vendors?page=${page}`),
     verifyVendor: (id: string) =>
       patch<void>(`/admin/vendors/${id}/verify`),
     unverifyVendor: (id: string) =>
       patch<void>(`/admin/vendors/${id}/unverify`),
     toggleArtisan: (id: string) =>
       patch<void>(`/admin/vendors/${id}/artisan`),

     // Orders
     getAllOrders: (params?: { page?: number; status?: OrderStatus }) =>
       get<Page<OrderSummaryDto>>(`/admin/orders?${new URLSearchParams(params as any)}`),
     overrideOrderStatus: (id: string, status: OrderStatus) =>
       patch<void>(`/admin/orders/${id}/status`, { status }),
     refundOrder: (id: string) =>
       post<void>(`/admin/orders/${id}/refund`),

     // Products
     getAllProducts: (page = 0) =>
       get<Page<ProductSummaryDto>>(`/admin/products?page=${page}`),
     deleteProduct: (id: string) =>
       del<void>(`/admin/products/${id}`),
     activateProduct: (id: string, active: boolean) =>
       patch<void>(`/admin/products/${id}/activate`, { active }),

     // Stats
     getStats: () =>
       get<PlatformStatsDto>('/admin/stats'),

     // Promo
     getPromoCodes: () =>
       get<PromoCodeDto[]>('/admin/promo'),
     createPromoCode: (data: CreatePromoRequest) =>
       post<PromoCodeDto>('/admin/promo', data),
     togglePromoCode: (id: string) =>
       patch<void>(`/admin/promo/${id}/toggle`),
   }

2. src/app/[locale]/admin/page.tsx — Platform stats:
   KPI cards: total users, vendors, products, orders, revenue, avg order value.
   Bar chart: top categories by order count.
   Table: top vendors by revenue.

3. src/app/[locale]/admin/users/page.tsx:
   Search input (debounced 300ms → updates query param).
   Table: Avatar | Nom | Email | Téléphone | Rôle | Vérifié | Actions
   Actions dropdown per row:
     Changer le rôle → opens modal with role select (BUYER/VENDOR/ADMIN)
     Bannir / Débannir → confirmation dialog
   Role badge color: ADMIN=red, VENDOR=blue, BUYER=gray.

4. src/app/[locale]/admin/vendors/page.tsx:
   Table: Avatar | Nom | Ville | Note | Produits | Vérifié | Artisan | Actions
   Toggle switches for "Vérifié" and "Artisan" (optimistic update).
   Click vendor name → opens vendor storefront in new tab.

5. src/app/[locale]/admin/promo/page.tsx:
   Table of promo codes: Code | Réduction | Utilisations | Expire le | Statut
   "Nouveau code" button → opens create modal:
     code (uppercase, alphanumeric), discountPercent (1-100), maxUses (optional), expiresAt (optional)
   Toggle active switch per row.
```

---

## 15. Error Handling & Toast

### Checklist
- [ ] Install and configure `sonner` for toast notifications
- [ ] Global toast provider in root layout
- [ ] Success toast on: order placed, review added, product created, vendor registered
- [ ] Error toast on: API errors (use `error.message` from `ApiError`)
- [ ] Form field errors shown inline (from `error.errors` map)
- [ ] 404 page for product/vendor not found
- [ ] 403 page for unauthorized access
- [ ] 500 page for unexpected errors
- [ ] `error.tsx` boundary at app level for unhandled errors

### Claude Prompt
```
Implement error handling and toast notifications for Souk Digital Next.js frontend.

1. Install sonner: npm install sonner
   In src/app/[locale]/layout.tsx add: <Toaster richColors position="top-right" />

2. src/lib/hooks/use-toast-mutation.ts:
   A wrapper around useMutation that automatically shows toasts.

   export function useToastMutation<TData, TVariables>(
     options: UseMutationOptions<TData, ApiError, TVariables> & {
       successMessage?: string | ((data: TData) => string)
       errorMessage?: string | ((error: ApiError) => string)
     }
   ) {
     return useMutation({
       ...options,
       onSuccess: (data, variables, context) => {
         const msg = typeof options.successMessage === 'function'
           ? options.successMessage(data) : options.successMessage
         if (msg) toast.success(msg)
         options.onSuccess?.(data, variables, context)
       },
       onError: (error, variables, context) => {
         const msg = typeof options.errorMessage === 'function'
           ? options.errorMessage(error) : (options.errorMessage ?? error.message)
         toast.error(msg)
         options.onError?.(error, variables, context)
       },
     })
   }

   Usage:
   const { mutate } = useToastMutation({
     mutationFn: ordersApi.place,
     successMessage: 'Commande passée avec succès !',
   })

3. src/components/ui/api-error.tsx:
   Props: error: ApiError | null
   Renders an alert box with error.message.
   If error.errors (field errors), show a list of them.
   Used in forms when non-field errors occur (e.g., "Compte non vérifié").

4. src/app/[locale]/not-found.tsx:
   Clean 404 page with illustration, "Cette page n'existe pas" message, link to homepage.

5. src/app/[locale]/error.tsx (Client Component):
   Catch-all error boundary.
   Show: "Une erreur inattendue s'est produite" + reset button.
   Log error to console in dev, to error tracking service in prod.

6. src/app/[locale]/(shop)/products/[slug]/not-found.tsx:
   "Ce produit n'existe pas ou a été retiré" + link to browse products.

7. In API client (client.ts), for status 503/500:
   toast.error('Le serveur est temporairement indisponible. Réessayez dans quelques instants.')
   Still throw the error so the mutation's onError also fires.
```

---

## 16. Loading & Skeleton States

### Checklist
- [ ] Product card skeleton (matches ProductCard dimensions)
- [ ] Product grid skeleton (8 cards)
- [ ] Product detail skeleton
- [ ] Vendor card skeleton
- [ ] Order list skeleton
- [ ] Dashboard stats skeleton
- [ ] Wrap data-dependent sections in `<Suspense fallback={<Skeleton />}>`
- [ ] Loading spinner for mutations (button disabled + spinner while pending)

### Claude Prompt
```
Create skeleton loading components for Souk Digital Next.js frontend.
Use Tailwind CSS animate-pulse pattern.

1. src/components/ui/skeleton.tsx:
   Base Skeleton component:
   export function Skeleton({ className }: { className?: string }) {
     return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
   }

2. src/components/skeletons/product-card-skeleton.tsx:
   Match the dimensions of ProductCard exactly:
   - Image area: rounded-xl, aspect-square or 4:3
   - Title line: h-4 w-3/4
   - Subtitle: h-3 w-1/2
   - Price: h-5 w-1/4
   - Stars: h-3 w-1/3
   - Button: h-9 w-full rounded-lg

3. src/components/skeletons/product-grid-skeleton.tsx:
   Grid of 8 ProductCardSkeletons with same grid cols as the real grid.

4. src/components/skeletons/product-detail-skeleton.tsx:
   Left: image gallery placeholders (main + 4 thumbnails)
   Right: title, rating, price, description lines, add-to-cart button

5. src/components/skeletons/order-list-skeleton.tsx:
   5 rows, each: image square + 3 text lines + status badge placeholder

6. src/components/skeletons/dashboard-stats-skeleton.tsx:
   4 stat cards with number + label placeholders
   Chart area: full-width rectangle

7. In pages, use Next.js Suspense:
   // In server component page:
   <Suspense fallback={<ProductGridSkeleton />}>
     <ProductGridServer filters={filters} />
   </Suspense>

8. Mutation loading state pattern:
   const { mutate, isPending } = useMutation(...)
   <Button disabled={isPending}>
     {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
     {isPending ? 'Chargement...' : 'Confirmer la commande'}
   </Button>
```

---

## 17. i18n + RTL Support

### Checklist
- [ ] `next-intl` configured for French (`fr`) and Arabic (`ar`)
- [ ] Use `nameAr` fields when locale is `ar`
- [ ] RTL layout when locale is `ar` (`dir="rtl"` on `<html>`)
- [ ] All text through translation files (`messages/fr.json`, `messages/ar.json`)
- [ ] Currency formatted as `1 234,00 MAD` (FR) / `١٬٢٣٤٫٠٠ درهم` (AR)
- [ ] Dates formatted in locale-appropriate format
- [ ] Number inputs work in both LTR and RTL

### Claude Prompt
```
Implement i18n and RTL support for Souk Digital Next.js frontend.

1. Locale-aware product name helper:
   // src/lib/utils/locale.ts
   export function localeName(item: { name: string; nameAr?: string | null }, locale: string) {
     return locale === 'ar' && item.nameAr ? item.nameAr : item.name
   }

   export function formatPrice(amount: number, locale: string) {
     return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
       style: 'currency',
       currency: 'MAD',
       minimumFractionDigits: 2,
     }).format(amount)
   }

   export function formatDate(dateString: string, locale: string) {
     return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
       year: 'numeric', month: 'long', day: 'numeric',
     }).format(new Date(dateString))
   }

   export function formatRelativeDate(dateString: string, locale: string) {
     const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr', { numeric: 'auto' })
     const diff = (new Date(dateString).getTime() - Date.now()) / 1000
     if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute')
     if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
     return rtf.format(Math.round(diff / 86400), 'day')
   }

2. In src/app/[locale]/layout.tsx:
   const dir = locale === 'ar' ? 'rtl' : 'ltr'
   <html lang={locale} dir={dir}>

3. In all product/vendor display components:
   const locale = useLocale()
   const displayName = localeName(product, locale)
   const displayPrice = formatPrice(product.price, locale)

4. Translation keys to create in messages/fr.json and messages/ar.json:
   auth.login, auth.register, auth.verify_otp, auth.logout
   nav.home, nav.products, nav.vendors, nav.cart, nav.orders, nav.dashboard
   product.add_to_cart, product.out_of_stock, product.reviews, product.related
   order.place, order.status.*, order.delivery_fee, order.total
   vendor.follow, vendor.unfollow, vendor.become_vendor
   common.loading, common.error, common.empty, common.search, common.filter
```

---

## 18. Environment & Deployment

### Checklist
- [ ] Create `.env.local` for development
- [ ] Create `.env.production` for production
- [ ] `NEXT_PUBLIC_API_URL` points to Spring Boot API
- [ ] `NEXT_PUBLIC_APP_URL` for OG images and canonical URLs
- [ ] TanStack Query provider in root layout
- [ ] Zustand store hydration handled (no SSR mismatch)
- [ ] `next.config.js` image domains whitelisted (S3 bucket domain)
- [ ] Vercel / Railway deployment configured

### Claude Prompt
```
Configure environment and deployment for Souk Digital Next.js frontend.

1. .env.local:
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000

2. .env.production:
   NEXT_PUBLIC_API_URL=https://api.soukdigital.ma/api
   NEXT_PUBLIC_APP_URL=https://soukdigital.ma

3. next.config.js:
   const nextConfig = {
     images: {
       remotePatterns: [
         { protocol: 'https', hostname: '*.supabase.co' },
         { protocol: 'https', hostname: '*.amazonaws.com' },
         { protocol: 'https', hostname: 'images.unsplash.com' },
       ],
     },
   }

4. src/app/[locale]/layout.tsx — root providers:
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
   import { Toaster } from 'sonner'

   Create queryClient ONCE at module level (or use useState for per-request client):
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         retry: 1,
         staleTime: 60_000,
         refetchOnWindowFocus: false,
       },
     },
   })

   Wrap children:
   <QueryClientProvider client={queryClient}>
     {children}
     <Toaster richColors position="top-right" />
   </QueryClientProvider>

5. Zustand SSR hydration pattern in every page that uses auth:
   // src/components/providers/auth-hydration.tsx
   'use client'
   import { useEffect, useState } from 'react'
   export function AuthHydration({ children }: { children: React.ReactNode }) {
     const [hydrated, setHydrated] = useState(false)
     useEffect(() => setHydrated(true), [])
     if (!hydrated) return null  // or a minimal loading state
     return <>{children}</>
   }

6. Install required packages:
   npm install @tanstack/react-query zustand sonner react-hook-form @hookform/resolvers zod
   npm install date-fns react-dropzone recharts
   npm install next-intl
```

---

## Quick Reference — Frontend API Functions

```typescript
// Auth
authApi.register(data)         → POST /auth/register
authApi.verifyOtp(data)        → POST /auth/verify-otp  → AuthResponse
authApi.login(data)            → POST /auth/login        → AuthResponse
authApi.refreshToken(token)    → POST /auth/refresh
authApi.resendOtp(phone)       → POST /auth/resend-otp

// Products
productsApi.getAll(filters)    → GET /products?...       → Page<ProductSummaryDto>
productsApi.getBySlug(slug)    → GET /products/{slug}    → ProductDetailDto
productsApi.getRelated(id)     → GET /products/{id}/related
productsApi.create(data)       → POST /products          [VENDOR]
productsApi.update(id, data)   → PUT /products/{id}      [VENDOR]
productsApi.delete(id)         → DELETE /products/{id}   [VENDOR]
productsApi.toggleActive(id)   → PATCH /products/{id}/toggle

// Categories
categoriesApi.getAll()         → GET /categories
categoriesApi.getBySlug(slug)  → GET /categories/{slug}
categoriesApi.getProducts(slug)→ GET /categories/{slug}/products

// Vendors
vendorsApi.getAll(params)      → GET /vendors
vendorsApi.getBySlug(slug)     → GET /vendors/{slug}
vendorsApi.getProducts(slug)   → GET /vendors/{slug}/products
vendorsApi.register(data)      → POST /vendors/register  → AuthResponse (new JWT)
vendorsApi.getMyProfile()      → GET /vendors/me
vendorsApi.updateMyProfile()   → PUT /vendors/me
vendorsApi.follow(id)          → POST /vendors/{id}/follow
vendorsApi.unfollow(id)        → DELETE /vendors/{id}/follow

// Orders
ordersApi.place(data)          → POST /orders            [BUYER] → 201
ordersApi.getMyOrders(page)    → GET /orders/my
ordersApi.getById(id)          → GET /orders/{id}
ordersApi.updateStatus(id,s)   → PATCH /orders/{id}/status [VENDOR]

// Payment
paymentApi.initCmi(orderId)    → POST /payment/cmi/init  → CmiInitResponse
paymentApi.getStatus(orderId)  → GET /payment/order/{id}

// Reviews
reviewsApi.getByProduct(id)    → GET /products/{id}/reviews
reviewsApi.getStats(id)        → GET /products/{id}/reviews/stats
reviewsApi.create(id, data)    → POST /products/{id}/reviews [AUTH]
reviewsApi.delete(reviewId)    → DELETE /reviews/{id}

// Promo
promoApi.validate(code)        → POST /promo/validate    [AUTH]

// Search
searchApi.search(params)       → GET /search?...
searchApi.suggestions(q)       → GET /search/suggestions?q=

// Upload
uploadApi.uploadImage(file, folder)    → POST /upload/image   → { url }
uploadApi.uploadImages(files, folder)  → POST /upload/images  → { urls[] }

// Vendor Dashboard
vendorDashboardApi.getStats()          → GET /vendor/dashboard/stats
vendorDashboardApi.getRevenueTrend()   → GET /vendor/dashboard/revenue-trend
vendorDashboardApi.getOrders(params)   → GET /vendor/dashboard/orders
vendorDashboardApi.getTopProducts()    → GET /vendor/dashboard/top-products
vendorDashboardApi.getOrdersByStatus() → GET /vendor/dashboard/orders-status

// Admin
adminApi.getUsers(params)      → GET /admin/users
adminApi.changeUserRole(id,r)  → PATCH /admin/users/{id}/role
adminApi.banUser(id)           → PATCH /admin/users/{id}/ban
adminApi.getVendors()          → GET /admin/vendors
adminApi.verifyVendor(id)      → PATCH /admin/vendors/{id}/verify
adminApi.getAllOrders()         → GET /admin/orders
adminApi.getStats()            → GET /admin/stats
adminApi.getPromoCodes()       → GET /admin/promo
adminApi.createPromoCode(data) → POST /admin/promo
```

---

## Progress Tracker

- [ ] **Step 1** — API client setup + error types + `.env.local`
- [ ] **Step 2** — TypeScript types (all DTOs mirrored)
- [ ] **Step 3** — Auth store (Zustand) + Cart store (Zustand + persist)
- [ ] **Step 4** — Auth flows: register → OTP → login + middleware
- [ ] **Step 5** — Products & categories: API functions + hooks + pages (replace all mocks)
- [ ] **Step 6** — Vendors: storefront + become-vendor flow
- [ ] **Step 7** — Cart drawer + checkout page + orders history + order detail
- [ ] **Step 8** — Payment: CMI form submit + success/failure pages + polling
- [ ] **Step 9** — Reviews: star component + rating distribution + add review form
- [ ] **Step 10** — Promo codes: validate input in checkout
- [ ] **Step 11** — Search: autocomplete header + results page + filter panel (URL sync)
- [ ] **Step 12** — File upload: drag & drop component + image previews
- [ ] **Step 13** — Vendor dashboard: stats + chart + orders table + products CRUD
- [ ] **Step 14** — Admin panel: users + vendors + orders + promo management
- [ ] **Step 15** — Error handling: toasts + 404/403/500 pages + error boundaries
- [ ] **Step 16** — Skeletons + Suspense boundaries + mutation loading states
- [ ] **Step 17** — i18n: locale-aware names + price/date formatting + RTL direction
- [ ] **Step 18** — Providers: QueryClient + Toaster + Zustand hydration + next.config.js
