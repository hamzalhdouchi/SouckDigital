# Souk Digital — Java Backend Complete Guide
> Spring Boot 3 · PostgreSQL · Redis · JWT · CMI Payment
> Use each Claude prompt below to build the step — copy/paste directly into Claude Code.

---

## Table of Contents
1. [Project Setup](#1-project-setup)
2. [Database Schema & Migrations](#2-database-schema--migrations)
3. [Entities & Repositories](#3-entities--repositories)
4. [Authentication — Register, OTP, Login, JWT](#4-authentication)
5. [Products & Categories](#5-products--categories)
6. [Vendors](#6-vendors)
7. [Orders & Cart](#7-orders--cart)
8. [Payment — COD & CMI](#8-payment)
9. [Reviews & Ratings](#9-reviews--ratings)
10. [Promo Codes](#10-promo-codes)
11. [Search & Filters](#11-search--filters)
12. [File Upload — Product Images](#12-file-upload)
13. [Vendor Dashboard & Analytics](#13-vendor-dashboard--analytics)
14. [Admin Panel APIs](#14-admin-panel-apis)
15. [Email & SMS Notifications](#15-email--sms-notifications)
16. [Security & CORS](#16-security--cors)
17. [Testing](#17-testing)
18. [Deployment](#18-deployment)
19. [Frontend Integration (Next.js)](#19-frontend-integration-nextjs)

---

## Global Architecture

```
souk-digital-api/                     ← Spring Boot project root
├── src/main/java/ma/soukdigital/
│   ├── auth/                         ← JWT, OTP, login/register
│   ├── user/                         ← User entity + profile
│   ├── vendor/                       ← Vendor profile + storefront
│   ├── product/                      ← Products CRUD
│   ├── category/                     ← Categories tree
│   ├── order/                        ← Orders + order items
│   ├── payment/                      ← CMI + COD
│   ├── review/                       ← Reviews + ratings
│   ├── promo/                        ← Promo codes
│   ├── search/                       ← Full-text search
│   ├── upload/                       ← S3 / Supabase Storage
│   ├── notification/                 ← Email (Resend) + SMS (Infobip)
│   ├── admin/                        ← Admin-only endpoints
│   └── config/                       ← Security, CORS, Redis, Swagger
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/                 ← Flyway SQL files
└── pom.xml
```

---

## Stack Summary

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.3 |
| Language | Java 21 (LTS) |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Migrations | Flyway |
| Auth | JWT (jjwt) + Spring Security 6 |
| Validation | Jakarta Bean Validation |
| DTO Mapping | MapStruct |
| Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Email | JavaMailSender + Resend |
| SMS / OTP | Infobip REST API |
| File Storage | AWS S3 (or Supabase Storage) |
| Payment | CMI (Moroccan gateway) + COD |
| Build | Maven |
| Deployment | Docker + Railway / Render |

---

## 1. Project Setup

### Checklist
- [x] Create Spring Boot project via [start.spring.io](https://start.spring.io)
- [x] Java 21, Maven, Spring Boot 3.3.x
- [x] Add all dependencies to `pom.xml`
- [x] Configure `application.yml` (DB, Redis, JWT, CORS)
- [x] Configure `application-dev.yml` and `application-prod.yml`
- [x] Set up `.env` file for secrets
- [x] Add `.gitignore` (ignore `.env`, `target/`)
- [x] Run project and verify `/actuator/health` returns `UP`
- [x] Add Swagger UI — verify it opens at `/swagger-ui.html`

### Claude Prompt
```
Create a Spring Boot 3.3 project for "Souk Digital", a Moroccan e-commerce marketplace API.

Project details:
- Group: ma.soukdigital
- Artifact: souk-digital-api
- Java 21, Maven
- Package name: ma.soukdigital

Add these dependencies to pom.xml:
- spring-boot-starter-web
- spring-boot-starter-security
- spring-boot-starter-data-jpa
- spring-boot-starter-data-redis
- spring-boot-starter-validation
- spring-boot-starter-mail
- spring-boot-starter-actuator
- postgresql (runtime)
- flyway-core
- lombok
- mapstruct + mapstruct-processor
- springdoc-openapi-starter-webmvc-ui (version 2.5.0)
- jjwt-api, jjwt-impl, jjwt-jackson (version 0.12.5)
- spring-boot-starter-test

Create src/main/resources/application.yml with:
- server.port: 8080
- spring.datasource pointing to PostgreSQL (use ${DB_URL}, ${DB_USER}, ${DB_PASSWORD})
- spring.jpa.hibernate.ddl-auto: validate
- spring.flyway.enabled: true
- spring.data.redis (host, port from ${REDIS_HOST}, ${REDIS_PORT})
- Custom jwt section: jwt.secret: ${JWT_SECRET}, jwt.expiration: 86400000
- Custom cors section: cors.allowed-origins: ${CORS_ORIGINS:http://localhost:3000}
- springdoc.swagger-ui.path: /swagger-ui.html

Create application-dev.yml with local dev values.
Create a SoukDigitalApplication.java main class.
Create a HealthController.java with GET /api/health returning {"status":"ok","app":"Souk Digital"}.
```

---

## 2. Database Schema & Migrations

### Checklist
- [x] Create `V1__init_schema.sql` — all core tables
- [x] Create `V2__seed_categories.sql` — seed 6 Moroccan categories
- [x] Create `V3__seed_promo_codes.sql` — seed SOUK10, ARTISAN20, BIENVENUE15
- [x] Verify Flyway runs cleanly on startup
- [x] Verify all tables exist in PostgreSQL
- [x] Add indexes on `slug`, `email`, `phone`, `vendor_id`, `status`

### Claude Prompt
```
Create Flyway migration files for Souk Digital under src/main/resources/db/migration/.

V1__init_schema.sql — create these tables with proper PostgreSQL types:

users:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  first_name VARCHAR(100) NOT NULL
  last_name VARCHAR(100) NOT NULL
  email VARCHAR(255) UNIQUE
  phone VARCHAR(20) UNIQUE
  password_hash VARCHAR(255)
  role VARCHAR(20) NOT NULL DEFAULT 'BUYER'   -- BUYER, VENDOR, ADMIN
  is_verified BOOLEAN DEFAULT false
  avatar_url TEXT
  created_at TIMESTAMPTZ DEFAULT NOW()
  updated_at TIMESTAMPTZ DEFAULT NOW()

vendors:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  name VARCHAR(200) NOT NULL
  name_ar VARCHAR(200)
  slug VARCHAR(200) UNIQUE NOT NULL
  city VARCHAR(100)
  description TEXT
  description_ar TEXT
  avatar_url TEXT
  banner_url TEXT
  is_artisan BOOLEAN DEFAULT false
  is_verified BOOLEAN DEFAULT false
  commission_rate DECIMAL(5,2) DEFAULT 10.00
  rating DECIMAL(3,2) DEFAULT 0
  review_count INT DEFAULT 0
  product_count INT DEFAULT 0
  follower_count INT DEFAULT 0
  member_since DATE DEFAULT CURRENT_DATE
  created_at TIMESTAMPTZ DEFAULT NOW()

categories:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name VARCHAR(100) NOT NULL
  name_ar VARCHAR(100) NOT NULL
  slug VARCHAR(100) UNIQUE NOT NULL
  emoji VARCHAR(10)
  image_url TEXT
  parent_id UUID REFERENCES categories(id)
  sort_order INT DEFAULT 0
  is_active BOOLEAN DEFAULT true

products:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE
  category_id UUID REFERENCES categories(id)
  name VARCHAR(300) NOT NULL
  name_ar VARCHAR(300) NOT NULL
  slug VARCHAR(300) UNIQUE NOT NULL
  description TEXT
  description_ar TEXT
  price DECIMAL(10,2) NOT NULL
  original_price DECIMAL(10,2)
  stock_count INT NOT NULL DEFAULT 0
  badge VARCHAR(20)   -- artisan, sale, new, top, flash
  city VARCHAR(100)
  free_delivery BOOLEAN DEFAULT false
  is_active BOOLEAN DEFAULT true
  rating DECIMAL(3,2) DEFAULT 0
  review_count INT DEFAULT 0
  created_at TIMESTAMPTZ DEFAULT NOW()
  updated_at TIMESTAMPTZ DEFAULT NOW()

product_images:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
  url TEXT NOT NULL
  sort_order INT DEFAULT 0

orders:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  buyer_id UUID NOT NULL REFERENCES users(id)
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
    -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
  payment_method VARCHAR(30) NOT NULL  -- COD, CARD_CMI, MOBILE, TRANSFER
  payment_status VARCHAR(20) DEFAULT 'PENDING'  -- PENDING, PAID, FAILED, REFUNDED
  subtotal DECIMAL(10,2) NOT NULL
  discount_amount DECIMAL(10,2) DEFAULT 0
  delivery_fee DECIMAL(10,2) DEFAULT 0
  total DECIMAL(10,2) NOT NULL
  promo_code VARCHAR(50)
  tracking_number VARCHAR(100)
  notes TEXT
  -- delivery address (embedded)
  delivery_first_name VARCHAR(100)
  delivery_last_name VARCHAR(100)
  delivery_phone VARCHAR(20)
  delivery_street TEXT
  delivery_city VARCHAR(100)
  delivery_zip VARCHAR(20)
  created_at TIMESTAMPTZ DEFAULT NOW()
  updated_at TIMESTAMPTZ DEFAULT NOW()

order_items:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
  product_id UUID NOT NULL REFERENCES products(id)
  vendor_id UUID NOT NULL REFERENCES vendors(id)
  product_name VARCHAR(300) NOT NULL   -- snapshot at order time
  product_image TEXT
  price DECIMAL(10,2) NOT NULL         -- snapshot at order time
  quantity INT NOT NULL
  subtotal DECIMAL(10,2) NOT NULL

addresses:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  label VARCHAR(50)
  first_name VARCHAR(100) NOT NULL
  last_name VARCHAR(100) NOT NULL
  phone VARCHAR(20) NOT NULL
  street TEXT NOT NULL
  city VARCHAR(100) NOT NULL
  zip_code VARCHAR(20)
  is_default BOOLEAN DEFAULT false

reviews:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
  user_id UUID NOT NULL REFERENCES users(id)
  order_id UUID REFERENCES orders(id)  -- verified purchase
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5)
  comment TEXT
  is_verified_purchase BOOLEAN DEFAULT false
  created_at TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(product_id, user_id)

promo_codes:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  code VARCHAR(50) UNIQUE NOT NULL
  discount_percent DECIMAL(5,2) NOT NULL
  max_uses INT
  used_count INT DEFAULT 0
  expires_at TIMESTAMPTZ
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMPTZ DEFAULT NOW()

otp_codes:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  phone VARCHAR(20) NOT NULL
  code VARCHAR(6) NOT NULL
  expires_at TIMESTAMPTZ NOT NULL
  used BOOLEAN DEFAULT false
  created_at TIMESTAMPTZ DEFAULT NOW()

payment_transactions:
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  order_id UUID NOT NULL REFERENCES orders(id)
  provider VARCHAR(30) NOT NULL  -- CMI, MOBILE, COD
  provider_ref VARCHAR(200)       -- CMI transaction ID
  amount DECIMAL(10,2) NOT NULL
  status VARCHAR(20) NOT NULL    -- PENDING, SUCCESS, FAILED
  raw_response TEXT              -- store full CMI response JSON
  created_at TIMESTAMPTZ DEFAULT NOW()

Add indexes:
  users(email), users(phone)
  products(slug), products(vendor_id), products(category_id), products(is_active)
  orders(buyer_id), orders(status)
  vendors(slug), vendors(user_id)

V2__seed_categories.sql — insert 6 categories:
  artisanat, mode, beaute, maison, electronique, alimentation
  with French names, Arabic names, emojis, and Unsplash image URLs matching the frontend mock data.

V3__seed_promo_codes.sql — insert:
  SOUK10 → 10%, ARTISAN20 → 20%, BIENVENUE15 → 15%
```

---

## 3. Entities & Repositories

### Checklist
- [x] `User.java` entity with all fields + `@PreUpdate` for `updatedAt`
- [x] `Vendor.java` entity with `@OneToOne` to User
- [x] `Category.java` entity with self-referencing `@ManyToOne parent`
- [x] `Product.java` entity with `@ElementCollection images`
- [x] `Order.java` + `OrderItem.java` + `@Embedded DeliveryAddress`
- [x] `Address.java` entity
- [x] `Review.java` entity
- [x] `PromoCode.java` entity
- [x] `OtpCode.java` entity
- [x] `PaymentTransaction.java` entity
- [x] All repositories extend `JpaRepository`
- [x] Custom query methods on `ProductRepository` (findBySlug, findByVendorId, search)
- [x] Custom query methods on `OrderRepository` (findByBuyerId, findByStatus)

### Claude Prompt
```
Create all JPA entities and Spring Data repositories for Souk Digital.
Base package: ma.soukdigital

Use Lombok (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor).
Use @Entity, @Table, @Column with proper constraints.
Use UUID as ID type with @GeneratedValue(strategy = GenerationType.UUID).
Use @CreationTimestamp and @UpdateTimestamp for audit fields.

Entities to create:
1. User.java — fields: id, firstName, lastName, email, phone, passwordHash,
   role (enum: BUYER/VENDOR/ADMIN), isVerified, avatarUrl, createdAt, updatedAt
   Add @OneToOne(mappedBy="user") Vendor vendor

2. Vendor.java — all fields from schema, @OneToOne @JoinColumn(name="user_id") User user,
   @OneToMany(mappedBy="vendor") List<Product> products

3. Category.java — with @ManyToOne(fetch=LAZY) @JoinColumn(name="parent_id") Category parent,
   @OneToMany(mappedBy="parent") List<Category> children

4. Product.java — @ManyToOne Vendor vendor, @ManyToOne Category category,
   @ElementCollection @CollectionTable List<String> images (from product_images table),
   badge as enum (ARTISAN, SALE, NEW, TOP, FLASH)

5. Order.java — @ManyToOne User buyer,
   @OneToMany(mappedBy="order", cascade=ALL) List<OrderItem> items,
   @Embedded DeliveryAddress address,
   status as enum: PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED/REFUNDED
   paymentMethod enum: COD/CARD_CMI/MOBILE/TRANSFER
   paymentStatus enum: PENDING/PAID/FAILED/REFUNDED

6. DeliveryAddress.java — @Embeddable with firstName, lastName, phone, street, city, zipCode

7. OrderItem.java — @ManyToOne Order order, @ManyToOne Product product,
   @ManyToOne Vendor vendor, + price/name snapshots

8. Address.java — @ManyToOne User user

9. Review.java — @ManyToOne Product product, @ManyToOne User user,
   @ManyToOne(optional=true) Order order, rating, comment, isVerifiedPurchase

10. PromoCode.java — code, discountPercent, maxUses, usedCount, expiresAt, isActive

11. OtpCode.java — phone, code, expiresAt, used

12. PaymentTransaction.java — @ManyToOne Order order, provider, providerRef, amount, status, rawResponse

Repositories to create (all in a repository subpackage):
- UserRepository: findByEmail, findByPhone, existsByEmail, existsByPhone
- VendorRepository: findBySlug, findByUserId
- CategoryRepository: findBySlug, findAllByParentIsNull
- ProductRepository: findBySlug,
  @Query JPQL search by name/nameAr/category containing keyword,
  findByVendorId, findByCategorySlug,
  findByIsActiveTrue with Pageable
- OrderRepository: findByBuyerId, findByBuyerIdOrderByCreatedAtDesc,
  findByStatus, countByBuyerId
- ReviewRepository: findByProductId, existsByProductIdAndUserId,
  @Query average rating by productId
- PromoCodeRepository: findByCodeIgnoreCase, findByCodeAndIsActiveTrue
- OtpCodeRepository: findByPhoneAndUsedFalseOrderByCreatedAtDesc
- AddressRepository: findByUserId, findByUserIdAndIsDefaultTrue
- PaymentTransactionRepository: findByOrderId
```

---

## 4. Authentication

### Checklist
- [x] `JwtService.java` — generate, validate, extract claims from JWT
- [x] `OtpService.java` — generate 6-digit OTP, store in Redis (5 min TTL), verify
- [x] `AuthService.java` — register, verifyOtp, login, refreshToken
- [x] `AuthController.java` — POST `/api/auth/register`, `/api/auth/verify-otp`, `/api/auth/login`, `/api/auth/refresh`
- [x] `UserDetailsServiceImpl.java` — load user by email or phone
- [x] `JwtAuthFilter.java` — `OncePerRequestFilter`, extract Bearer token
- [x] `SecurityConfig.java` — permit auth endpoints, require auth for rest
- [x] DTOs: `RegisterRequest`, `LoginRequest`, `OtpVerifyRequest`, `AuthResponse`
- [ ] Test: register → get OTP → verify → get JWT → access protected endpoint
- [ ] Test: login with wrong password returns 401
- [ ] Test: expired JWT returns 401

### Claude Prompt
```
Implement complete authentication for Souk Digital Spring Boot API.
Package: ma.soukdigital.auth

1. JwtService.java
   - Uses jjwt 0.12.x API (Jwts.builder(), not deprecated methods)
   - generateToken(User user) → signed JWT with subject=userId, claims: email, role, exp
   - generateRefreshToken(User user) → 7 day expiry
   - validateToken(String token) → boolean
   - extractUserId(String token) → String
   - extractRole(String token) → String
   - Read secret from @Value("${jwt.secret}") as Base64-encoded HS256 key
   - Read expiration from @Value("${jwt.expiration}")

2. OtpService.java
   - Uses StringRedisTemplate to store OTP
   - generateAndSend(String phone):
     * Generate random 6-digit code
     * Store in Redis with key "otp:{phone}" and TTL 5 minutes
     * Call SmsService.send(phone, code) — stub it for now, log the code
     * Return void
   - verify(String phone, String code) → boolean:
     * Get from Redis, compare, mark as used (delete key)
     * Throw OtpExpiredException if not found
     * Throw OtpInvalidException if mismatch

3. AuthService.java
   - register(RegisterRequest req):
     * Validate phone not already registered
     * Hash password with BCrypt
     * Save User (isVerified=false, role=BUYER)
     * Call otpService.generateAndSend(phone)
     * Return RegisterResponse with userId and message
   - verifyOtp(OtpVerifyRequest req):
     * Find user by phone
     * Call otpService.verify(phone, code)
     * Set user.isVerified = true, save
     * Return AuthResponse with JWT + refreshToken + user info
   - login(LoginRequest req):
     * Find user by email or phone
     * Verify password with BCrypt
     * Check isVerified, throw UnverifiedAccountException if false
     * Return AuthResponse with JWT + refreshToken
   - refreshToken(String refreshToken):
     * Validate refresh token
     * Return new access token

4. AuthController.java — REST endpoints:
   POST /api/auth/register        → RegisterRequest → RegisterResponse (201)
   POST /api/auth/verify-otp      → OtpVerifyRequest → AuthResponse (200)
   POST /api/auth/login           → LoginRequest → AuthResponse (200)
   POST /api/auth/refresh         → { "refreshToken": "..." } → { "accessToken": "..." }
   POST /api/auth/resend-otp      → { "phone": "..." } → 200

5. DTOs:
   RegisterRequest: firstName, lastName, email(optional), phone(required), password
   LoginRequest: identifier (email or phone), password
   OtpVerifyRequest: phone, code
   AuthResponse: accessToken, refreshToken, tokenType="Bearer", expiresIn, user (UserDto)
   UserDto: id, firstName, lastName, email, phone, role, isVerified, avatarUrl

6. UserDetailsServiceImpl: load by email first, then phone fallback

7. JwtAuthFilter extends OncePerRequestFilter:
   - Extract "Authorization: Bearer {token}" header
   - Validate token, load user, set SecurityContextHolder

8. SecurityConfig:
   - Permit: /api/auth/**, /api/products (GET), /api/categories (GET),
             /api/vendors (GET), /swagger-ui.html, /v3/api-docs/**
   - Authenticated: everything else
   - CSRF disabled (REST API)
   - Stateless session
   - Add JwtAuthFilter before UsernamePasswordAuthenticationFilter

9. GlobalExceptionHandler (@RestControllerAdvice):
   Handle: EntityNotFoundException → 404
   Handle: UnverifiedAccountException → 403
   Handle: OtpInvalidException, OtpExpiredException → 400
   Handle: BadCredentialsException → 401
   Handle: MethodArgumentNotValidException → 400 with field errors map
   Handle: AccessDeniedException → 403
   Handle: Exception → 500
   All return: { "error": "...", "message": "...", "status": 4xx, "timestamp": "..." }
```

---

## 5. Products & Categories

### Checklist
- [x] `CategoryService.java` — getAll, getBySlug, getWithChildren
- [x] `CategoryController.java` — GET `/api/categories`, `/api/categories/{slug}`
- [x] `ProductService.java` — getAll (paginated+filtered), getBySlug, create, update, delete, toggleActive
- [x] `ProductController.java` — full CRUD + public listing
- [x] `ProductFilterRequest.java` — query params: category, minPrice, maxPrice, city, freeDelivery, artisanOnly, minRating, sort, page, size
- [x] DTOs: `ProductSummaryDto`, `ProductDetailDto`, `CreateProductRequest`, `UpdateProductRequest`
- [x] Pagination using `Pageable` + `Page<ProductSummaryDto>`
- [x] Slug auto-generated from name on create
- [ ] Test: public can GET products, only VENDOR can POST/PUT/DELETE own products

### Claude Prompt
```
Implement Products and Categories APIs for Souk Digital.
Package: ma.soukdigital.product and ma.soukdigital.category

CATEGORIES:
CategoryService:
  - List<CategoryResponse> findAll() — all active categories, ordered by sort_order
  - CategoryResponse findBySlug(String slug) — throws 404 if not found
  - List<CategoryResponse> findRootCategories() — where parent is null
  - List<CategoryResponse> findChildren(String parentSlug)

CategoryController GET endpoints (all public, no auth needed):
  GET /api/categories               → list all categories
  GET /api/categories/{slug}        → single category
  GET /api/categories/{slug}/products → products in this category (paginated)

PRODUCTS:
ProductFilterRequest (record or @Data class for query params):
  String category, BigDecimal minPrice, BigDecimal maxPrice,
  String city, Boolean freeDelivery, Boolean artisanOnly,
  BigDecimal minRating, String sort (relevance/price_asc/price_desc/rating/newest),
  int page=0, int size=20

ProductService:
  - Page<ProductSummaryDto> findAll(ProductFilterRequest filter) — public listing
    Build dynamic query with Specification or JPQL, apply all filters, sort, paginate
  - ProductDetailDto findBySlug(String slug) — throws ResourceNotFoundException
  - ProductDetailDto create(CreateProductRequest req, String vendorId)
    Auto-generate slug from name (slugify: lowercase, replace spaces with -, remove accents)
    Ensure slug uniqueness (append -2, -3 if collision)
  - ProductDetailDto update(String id, UpdateProductRequest req, String currentUserId)
    Verify product belongs to vendor of currentUserId, throw 403 if not
  - void delete(String id, String currentUserId) — soft delete: set isActive=false
  - void toggleActive(String id, String currentUserId)
  - List<ProductSummaryDto> findRelated(String productId, int limit) — same category, different product
  - List<ProductSummaryDto> findByVendor(String vendorId, Pageable pageable)

ProductController:
  GET    /api/products                    → public, paginated list with filters
  GET    /api/products/{slug}             → public, product detail
  GET    /api/products/{id}/related       → public, 4 related products
  POST   /api/products           [VENDOR] → create product
  PUT    /api/products/{id}      [VENDOR] → update product
  DELETE /api/products/{id}      [VENDOR] → soft delete
  PATCH  /api/products/{id}/toggle [VENDOR] → toggle active/inactive

DTOs:
ProductSummaryDto: id, slug, name, nameAr, price, originalPrice, image (first image),
  rating, reviewCount, badge, inStock, freeDelivery, city,
  vendor (id, name, slug, artisan, verified)

ProductDetailDto extends ProductSummaryDto: + images list, description, descriptionAr,
  stockCount, category (id, name, nameAr, slug)

CreateProductRequest (@Valid):
  @NotBlank name, @NotBlank nameAr, description, descriptionAr,
  @NotNull @Positive price, originalPrice, @NotNull @Min(0) stockCount,
  @NotNull categoryId, badge, city, freeDelivery,
  @Size(min=1, max=8) List<String> imageUrls

UpdateProductRequest: same as Create but all optional (use Optional or @Nullable)

Use MapStruct ProductMapper to convert between Entity and DTOs.
Add @PreAuthorize("hasRole('VENDOR')") on write endpoints.
```

---

## 6. Vendors

### Checklist
- [x] `VendorService.java` — getBySlug, getAll, createProfile, updateProfile
- [x] `VendorController.java` — public storefront + authenticated vendor profile
- [x] Endpoint to become a vendor (BUYER → VENDOR role upgrade)
- [x] `VendorResponse` DTO with stats (productCount, rating, reviewCount, followerCount)
- [ ] Test: only one vendor profile per user

### Claude Prompt
```
Implement Vendor APIs for Souk Digital.
Package: ma.soukdigital.vendor

VendorService:
  - Page<VendorSummaryDto> findAll(int page, int size, String city) — public
  - VendorDetailDto findBySlug(String slug) — public, throws 404
  - VendorDetailDto findByCurrentUser(String userId) — for vendor dashboard
  - VendorDetailDto createVendorProfile(CreateVendorRequest req, String userId):
      * Check user doesn't already have a vendor profile
      * Create Vendor entity
      * Update user.role to VENDOR
      * Generate slug from vendor name
      * Return new profile with new JWT (role changed)
  - VendorDetailDto updateProfile(UpdateVendorRequest req, String userId)
  - void followVendor(String vendorId, String userId) — increment followerCount
  - void unfollowVendor(String vendorId, String userId)

VendorController:
  GET  /api/vendors                          → public list (paginated, optional city filter)
  GET  /api/vendors/{slug}                   → public vendor storefront
  GET  /api/vendors/{slug}/products          → vendor's active products
  POST /api/vendors/register        [AUTH]   → become a vendor
  GET  /api/vendors/me              [VENDOR] → own vendor profile
  PUT  /api/vendors/me              [VENDOR] → update own profile
  POST /api/vendors/{id}/follow     [BUYER]  → follow vendor
  DELETE /api/vendors/{id}/follow   [BUYER]  → unfollow vendor

DTOs:
VendorSummaryDto: id, slug, name, nameAr, city, rating, reviewCount, productCount,
  artisan, verified, avatarUrl, bannerUrl

VendorDetailDto extends VendorSummaryDto: + description, descriptionAr,
  followerCount, memberSince, userId

CreateVendorRequest (@Valid):
  @NotBlank name, nameAr, @NotBlank city, description, descriptionAr,
  avatarUrl, bannerUrl, isArtisan
```

---

## 7. Orders & Cart

### Checklist
- [x] `OrderService.java` — placeOrder, getMyOrders, getOrderById, updateStatus
- [x] `OrderController.java` — buyer orders + vendor order management
- [x] Validate stock availability before placing order
- [x] Decrement `stockCount` on order placement (use `@Transactional`)
- [x] Group order items by vendor (for vendor dashboard filtering)
- [x] `OrderStatus` transitions: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- [x] DTOs: `PlaceOrderRequest`, `OrderSummaryDto`, `OrderDetailDto`
- [ ] Test: can't order out-of-stock product
- [ ] Test: order total is calculated correctly with promo

### Claude Prompt
```
Implement Orders API for Souk Digital.
Package: ma.soukdigital.order

PlaceOrderRequest (@Valid):
  @NotEmpty List<OrderItemRequest> items (productId, quantity)
  @Valid @NotNull DeliveryAddressRequest address (firstName, lastName, phone, street, city, zipCode)
  @NotNull PaymentMethod paymentMethod (COD, CARD_CMI, MOBILE, TRANSFER)
  String promoCode (optional)

OrderService (@Transactional):
  - OrderDetailDto placeOrder(PlaceOrderRequest req, String buyerId):
    1. For each item: load Product, verify isActive, verify stockCount >= quantity
       Throw InsufficientStockException if not enough stock
    2. Calculate subtotal = sum(price * qty)
    3. Apply promo code if provided:
       Load PromoCode by code, verify isActive, not expired, usedCount < maxUses
       Calculate discountAmount = subtotal * discountPercent / 100
       Increment promoCode.usedCount
    4. Calculate deliveryFee: 0 if subtotal >= 300, else 35 MAD
    5. total = subtotal - discountAmount + deliveryFee
    6. Create Order entity with status=PENDING
    7. Create OrderItem for each item (snapshot name, image, price)
    8. Decrement product.stockCount for each item (update isActive=false if reaches 0)
    9. Save order, return OrderDetailDto

  - Page<OrderSummaryDto> getMyOrders(String buyerId, int page, int size)
  - OrderDetailDto getOrderById(String orderId, String userId)
    Verify order belongs to buyer OR item belongs to vendor of userId
  - OrderDetailDto updateStatus(String orderId, OrderStatus newStatus, String vendorId)
    Verify at least one item in order belongs to vendor
    Validate status transition is legal
  - Page<OrderSummaryDto> getVendorOrders(String vendorId, OrderStatus status, int page, int size)
    Return orders that contain at least one item from this vendor

OrderController:
  POST   /api/orders                        [BUYER]  → place order → 201
  GET    /api/orders/my                     [BUYER]  → my orders (paginated)
  GET    /api/orders/{id}                   [AUTH]   → order detail
  PATCH  /api/orders/{id}/status            [VENDOR] → update status
  GET    /api/vendor/orders                 [VENDOR] → vendor's orders
  GET    /api/admin/orders                  [ADMIN]  → all orders

DTOs:
OrderSummaryDto: id, status, paymentMethod, paymentStatus, total, createdAt,
  itemCount, firstItemName, firstItemImage

OrderDetailDto: + items list, address, subtotal, discountAmount, deliveryFee,
  promoCode, trackingNumber, buyer (name, phone)

OrderItemDto: productId, productName, productImage, vendorId, vendorName, price, quantity, subtotal
```

---

## 8. Payment

### Checklist
- [x] `CodPaymentService.java` — confirm COD order (just status update)
- [x] `CmiPaymentService.java` — initiate CMI payment, handle callback/webhook
- [x] `PaymentController.java` — `/api/payment/cmi/init`, `/api/payment/cmi/callback`
- [x] Store full CMI response in `payment_transactions`
- [x] Update order `paymentStatus` on CMI callback
- [x] Verify CMI HMAC signature on callback
- [x] Mobile Money stub (log + manual confirm for now)
- [ ] Test: COD order goes PENDING → CONFIRMED automatically

### Claude Prompt
```
Implement Payment services for Souk Digital.
Package: ma.soukdigital.payment

CmiPaymentService:
  CMI (Centre Monétique Interbancaire) is Morocco's main payment gateway.
  It uses a form POST to CMI's URL with HMAC-SHA256 signature.

  - CmiInitResponse initiatePayment(String orderId, String currentUserId):
    * Load order, verify belongs to user
    * Build CMI payment params:
      clientid: ${cmi.merchant-id}
      storetype: 3D_PAY_HOSTING
      trantype: PreAuth
      amount: order.total (formatted as "XXX.00")
      currency: 504  (MAD ISO code)
      oid: orderId  (our order reference)
      okUrl: ${cmi.ok-url}  (e.g. https://soukdigital.ma/checkout/success)
      failUrl: ${cmi.fail-url}
      callbackUrl: ${cmi.callback-url}  (our backend URL)
      lang: fr
      BillToName: buyer full name
      BillToAddrCity: delivery city
      TelVoiceAuthorization: buyer phone
    * Calculate HMAC: SHA256 of sorted params concatenated, key = ${cmi.store-key}
    * Return: { paymentUrl: "https://payment.cmi.co.ma/fim/est3Dgate", params: {...} }
    * Create PaymentTransaction with status PENDING

  - void handleCallback(Map<String, String> params):
    * Verify HMAC signature of incoming params (security check)
    * Extract orderId (oid param), transactionId (TransId), response (Response)
    * If Response == "Approved":
      Update order.paymentStatus = PAID
      Update order.status = CONFIRMED
      Update PaymentTransaction status = SUCCESS, providerRef = TransId
    * If Response == "Declined" or "Error":
      Update order.paymentStatus = FAILED
      Update PaymentTransaction status = FAILED
    * Store rawResponse = full params as JSON in PaymentTransaction
    * Return "ACTION=POSTAUTH" string (required by CMI protocol)

PaymentController:
  POST /api/payment/cmi/init      [BUYER]   → returns CMI form params
  POST /api/payment/cmi/callback  [PUBLIC]  → CMI posts here, return "ACTION=POSTAUTH"
  GET  /api/payment/order/{id}    [AUTH]    → get payment status for order

application.yml additions:
  cmi:
    merchant-id: ${CMI_MERCHANT_ID}
    store-key: ${CMI_STORE_KEY}
    ok-url: ${CMI_OK_URL}
    fail-url: ${CMI_FAIL_URL}
    callback-url: ${CMI_CALLBACK_URL}
    gateway-url: https://payment.cmi.co.ma/fim/est3Dgate

Also create CodService:
  - void confirmCodOrder(String orderId):
    Order stays PENDING until vendor marks as SHIPPED/DELIVERED
    Just update status to CONFIRMED for COD orders immediately after placement
  Called automatically in OrderService.placeOrder() when paymentMethod == COD
```

---

## 9. Reviews & Ratings

### Checklist
- [x] `ReviewService.java` — addReview (verified purchase check), getByProduct
- [x] `ReviewController.java`
- [x] After review saved, recalculate `product.rating` and `product.reviewCount`
- [x] `ReviewStatsDto` with rating distribution (1★ to 5★ counts + percentages)
- [ ] Test: can't review same product twice
- [ ] Test: only buyers who ordered the product can leave verified review

### Claude Prompt
```
Implement Reviews & Ratings for Souk Digital.
Package: ma.soukdigital.review

ReviewService:
  - ReviewDetailDto addReview(CreateReviewRequest req, String userId):
    1. Check user hasn't already reviewed this product (existsByProductIdAndUserId)
       Throw DuplicateReviewException if so
    2. Check if user has a delivered order containing this product
       If yes: isVerifiedPurchase = true, link orderId
    3. Save review
    4. Recalculate product stats using @Query:
       UPDATE products SET
         rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
         review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
       WHERE id = ?
    5. Return ReviewDetailDto

  - Page<ReviewDetailDto> findByProduct(String productId, int page, int size)
    Order by createdAt DESC, verified purchases first

  - ReviewStatsDto getStats(String productId):
    Return: averageRating, totalCount,
    distribution: [{ star: 5, count: X, percent: Y }, ..., { star: 1, ... }]

ReviewController:
  GET  /api/products/{productId}/reviews        → public, paginated
  GET  /api/products/{productId}/reviews/stats  → public, rating distribution
  POST /api/products/{productId}/reviews [AUTH] → add review
  DELETE /api/reviews/{id}              [AUTH]  → delete own review or ADMIN

DTOs:
CreateReviewRequest: @Min(1) @Max(5) rating, @Size(max=1000) comment
ReviewDetailDto: id, rating, comment, isVerifiedPurchase, createdAt,
  author (firstName + first letter of lastName, e.g. "Fatima B."), authorAvatar
ReviewStatsDto: averageRating, totalCount, distribution list
```

---

## 10. Promo Codes

### Checklist
- [x] `PromoService.java` — validate, apply
- [x] `PromoController.java` — POST `/api/promo/validate`
- [x] Promo is applied in `OrderService.placeOrder()`
- [ ] Test: expired promo returns error
- [ ] Test: max-uses exceeded returns error
- [x] Admin endpoint to create new promo codes

### Claude Prompt
```
Implement Promo Codes for Souk Digital.
Package: ma.soukdigital.promo

PromoService:
  - PromoValidationResponse validate(String code):
    Load by code (case-insensitive), throw PromoNotFoundException if not found
    Check isActive, check expiresAt not passed, check usedCount < maxUses
    Return: { valid: true, code, discountPercent, message }
    On error return: { valid: false, message: "Code invalide ou expiré" }

  - PromoCode applyToOrder(String code):
    Same checks + increment usedCount + save
    Return PromoCode entity for order calculation

  - PromoCode create(CreatePromoRequest req) [ADMIN only]

PromoController:
  POST /api/promo/validate          [AUTH]  → validate code before checkout
  POST /api/admin/promo             [ADMIN] → create new promo code
  GET  /api/admin/promo             [ADMIN] → list all promo codes
  PATCH /api/admin/promo/{id}/toggle [ADMIN] → activate/deactivate

CreatePromoRequest: code, discountPercent, maxUses (optional), expiresAt (optional)
PromoValidationResponse: valid(boolean), code, discountPercent, message
```

---

## 11. Search & Filters

### Checklist
- [x] Full-text search using PostgreSQL `ILIKE`
- [x] `SearchController.java` — GET `/api/search?q=tajine&...`
- [x] Supports all filters from CategoryPage (price range, city, freeDelivery, artisanOnly, minRating)
- [x] Returns products + vendors in same response
- [x] Pagination on results
- [ ] Test: search "tajine" returns relevant products

### Claude Prompt
```
Implement Search API for Souk Digital.
Package: ma.soukdigital.search

Create a SearchService that queries both products and vendors:

  SearchResultsDto search(SearchRequest req):
    SearchRequest fields: q (query string), category, minPrice, maxPrice,
      city, freeDelivery, artisanOnly, minRating, sort, page, size

    Products query (JPQL with dynamic conditions):
      SELECT p FROM Product p JOIN p.vendor v
      WHERE p.isActive = true
      AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%'))
                      OR LOWER(p.nameAr) LIKE LOWER(CONCAT('%',:q,'%'))
                      OR LOWER(p.category.name) LIKE LOWER(CONCAT('%',:q,'%')))
      AND (:category IS NULL OR p.category.slug = :category)
      AND (:minPrice IS NULL OR p.price >= :minPrice)
      AND (:maxPrice IS NULL OR p.price <= :maxPrice)
      AND (:city IS NULL OR p.city = :city)
      AND (:freeDelivery IS NULL OR p.freeDelivery = :freeDelivery)
      AND (:artisanOnly IS NULL OR v.isArtisan = :artisanOnly)
      AND (:minRating IS NULL OR p.rating >= :minRating)
      ORDER BY [sort logic]

    Use Spring Data JPA Specification for dynamic query building.

    Vendors query: if q provided, also search vendors by name/nameAr

    Return SearchResultsDto:
      Page<ProductSummaryDto> products
      List<VendorSummaryDto> vendors (max 4, only if q is provided)
      int totalProducts
      String query

SearchController:
  GET /api/search?q=&category=&minPrice=&maxPrice=&city=&freeDelivery=&artisanOnly=&minRating=&sort=&page=&size=
  → public endpoint, no auth required

Also add a suggestions endpoint:
  GET /api/search/suggestions?q=taj → returns top 5 product names matching query
  (for autocomplete in the header search bar)
```

---

## 12. File Upload

### Checklist
- [ ] `StorageService.java` interface + `S3StorageService.java` implementation
- [ ] `UploadController.java` — POST `/api/upload/image`
- [ ] Validate file type (JPEG, PNG, WebP only), max 5MB
- [ ] Resize/optimize images before upload (use Thumbnailator)
- [ ] Return public URL after upload
- [ ] Organize by folder: `products/{productId}/`, `vendors/avatars/`, `vendors/banners/`
- [ ] Test: upload JPEG returns valid URL

### Claude Prompt
```
Implement file upload for Souk Digital using AWS S3 (compatible with Supabase Storage or MinIO).
Package: ma.soukdigital.upload

Add dependencies to pom.xml:
  - software.amazon.awssdk:s3 (version 2.x)
  - net.coobird:thumbnailator (version 0.4.20)

application.yml additions:
  storage:
    provider: s3
    bucket: ${STORAGE_BUCKET}
    region: ${STORAGE_REGION:eu-west-1}
    endpoint: ${STORAGE_ENDPOINT:}  # empty for real S3, set for Supabase/MinIO
    access-key: ${STORAGE_ACCESS_KEY}
    secret-key: ${STORAGE_SECRET_KEY}
    public-url-prefix: ${STORAGE_PUBLIC_URL}

StorageService interface:
  String upload(MultipartFile file, String folder) throws StorageException

S3StorageService implements StorageService:
  - Validate: only JPEG/PNG/WebP allowed, max 5MB
  - Resize: use Thumbnailator to resize to max 1200x1200 keeping aspect ratio
  - Generate unique filename: folder + "/" + UUID + "." + extension
  - Upload to S3 with public-read ACL
  - Return full public URL: publicUrlPrefix + "/" + key

UploadController:
  POST /api/upload/image [AUTH]
    consumes: multipart/form-data
    param: file (MultipartFile), folder (String: "products", "vendors", "avatars")
    returns: { url: "https://..." }

  POST /api/upload/images [AUTH]
    Upload multiple images at once (max 8)
    returns: { urls: ["https://...", ...] }

Also add @PreAuthorize so only VENDOR and ADMIN can upload.
```

---

## 13. Vendor Dashboard & Analytics

### Checklist
- [ ] `VendorDashboardService.java` — revenue, orders count, top products, traffic stats
- [ ] `VendorDashboardController.java`
- [ ] Revenue calculation: sum of delivered order items for this vendor (this month / total)
- [ ] Top products by sales volume
- [ ] Orders by status breakdown
- [ ] Monthly revenue trend (last 12 months)
- [ ] Test: vendor can only see their own data

### Claude Prompt
```
Implement Vendor Dashboard & Analytics for Souk Digital.
Package: ma.soukdigital.vendor.dashboard

VendorDashboardService:
  - DashboardStatsDto getStats(String vendorId):
    Revenue this month: SUM of (orderItem.price * orderItem.quantity)
      WHERE order.status = DELIVERED AND orderItem.vendorId = vendorId
      AND order.createdAt >= first day of current month
    Orders this month: COUNT of distinct orders containing vendor items this month
    Active products: COUNT of products WHERE vendorId = ? AND isActive = true
    Average rating: from vendor entity (already maintained)
    Trend vs last month: calculate % change for revenue and orders

  - List<MonthlyRevenueDto> getRevenueTrend(String vendorId, int months):
    Returns last N months: [{ month: "2026-04", revenue: 4500.00 }, ...]
    Use PostgreSQL DATE_TRUNC('month', order.createdAt) GROUP BY

  - Page<OrderSummaryDto> getRecentOrders(String vendorId, OrderStatus status, int page, int size)

  - List<TopProductDto> getTopProducts(String vendorId, int limit):
    Group by product, SUM quantity sold, ORDER BY DESC
    Return: productId, name, image, totalSold, revenue, rating

  - Map<String, Long> getOrdersByStatus(String vendorId):
    Return count per status: { PENDING: 5, SHIPPED: 12, DELIVERED: 89, CANCELLED: 3 }

VendorDashboardController (all require VENDOR role):
  GET /api/vendor/dashboard/stats          → overall stats + trends
  GET /api/vendor/dashboard/revenue-trend  → monthly revenue chart data
  GET /api/vendor/dashboard/orders         → paginated orders (optional status filter)
  GET /api/vendor/dashboard/top-products   → top 5 selling products
  GET /api/vendor/dashboard/orders-status  → orders count by status

DTOs:
DashboardStatsDto: revenue(this month), revenueTotal, revenueGrowthPct,
  ordersThisMonth, ordersTotal, ordersGrowthPct,
  activeProducts, averageRating, reviewCount
MonthlyRevenueDto: month (YYYY-MM), revenue, orderCount
TopProductDto: productId, name, image, totalSold, revenue, rating
```

---

## 14. Admin Panel APIs

### Checklist
- [ ] All admin routes require `ADMIN` role
- [ ] `AdminUserController.java` — list users, ban/unban, change role
- [ ] `AdminVendorController.java` — verify/unverify vendors
- [ ] `AdminOrderController.java` — view all orders, override status
- [ ] `AdminProductController.java` — approve/reject products, force-delete
- [ ] `AdminStatsController.java` — platform-wide KPIs
- [ ] Test: non-admin gets 403 on all admin routes

### Claude Prompt
```
Implement Admin Panel APIs for Souk Digital.
Package: ma.soukdigital.admin

All controllers in this package require @PreAuthorize("hasRole('ADMIN')").

AdminUserController:
  GET    /api/admin/users                   → paginated user list with search by name/email/phone
  GET    /api/admin/users/{id}              → user detail
  PATCH  /api/admin/users/{id}/role         → change role (BUYER/VENDOR/ADMIN)
  PATCH  /api/admin/users/{id}/ban          → set isVerified=false (ban user)
  PATCH  /api/admin/users/{id}/unban        → set isVerified=true

AdminVendorController:
  GET    /api/admin/vendors                 → all vendors with verification status
  PATCH  /api/admin/vendors/{id}/verify     → set isVerified=true
  PATCH  /api/admin/vendors/{id}/unverify   → set isVerified=false
  PATCH  /api/admin/vendors/{id}/artisan    → toggle isArtisan

AdminOrderController:
  GET    /api/admin/orders                  → all orders, filter by status/date/vendor
  GET    /api/admin/orders/{id}             → full order detail
  PATCH  /api/admin/orders/{id}/status      → override status (for dispute resolution)
  POST   /api/admin/orders/{id}/refund      → mark as REFUNDED

AdminProductController:
  GET    /api/admin/products                → all products including inactive
  DELETE /api/admin/products/{id}           → hard delete
  PATCH  /api/admin/products/{id}/activate  → force activate/deactivate

AdminStatsController:
  GET /api/admin/stats → platform KPIs:
    totalUsers, totalVendors, totalProducts, totalOrders,
    revenueThisMonth, revenueTotal, averageOrderValue,
    ordersThisWeek trend, new users this week,
    topCategories by order count,
    topVendors by revenue
```

---

## 15. Email & SMS Notifications

### Checklist
- [ ] `EmailService.java` — order confirmation, welcome email, OTP email fallback
- [ ] `SmsService.java` — OTP SMS via Infobip (or stub for dev)
- [ ] HTML email templates using Thymeleaf
- [ ] Async sending with `@Async` (don't block API response)
- [ ] Order confirmation email: order ID, items, total, delivery address
- [ ] Test: email is sent on order placement (check logs in dev)

### Claude Prompt
```
Implement Email and SMS notification services for Souk Digital.
Package: ma.soukdigital.notification

Add dependencies: spring-boot-starter-thymeleaf, spring-boot-starter-mail

EMAIL:
EmailService (@Async):
  - void sendOrderConfirmation(Order order):
    Recipient: order.buyer.email
    Subject: "Souk Digital — Commande #{orderId} confirmée"
    Template: order-confirmation.html (Thymeleaf)
    Context: order, items, total, delivery address, tracking info placeholder

  - void sendWelcomeEmail(User user):
    Subject: "Bienvenue sur Souk Digital, {firstName} !"
    Template: welcome.html

  - void sendOtpEmail(String email, String code):
    Subject: "Votre code de vérification Souk Digital"
    Body: "Votre code est: {code} — valide 5 minutes"
    (Fallback when SMS fails)

Create Thymeleaf templates in src/main/resources/templates/email/:
  - order-confirmation.html: professional HTML email with order table, total, branding colors
  - welcome.html: welcome message with logo

application.yml for email:
  spring.mail:
    host: ${SMTP_HOST:smtp.resend.com}
    port: ${SMTP_PORT:465}
    username: ${SMTP_USER:resend}
    password: ${SMTP_PASSWORD}
    properties.mail.smtp.ssl.enable: true

SMS (Infobip):
SmsService:
  In dev profile: just log the OTP code to console (@Profile("dev") stub)
  In prod profile: HTTP POST to Infobip API

  application.yml additions:
    infobip:
      api-key: ${INFOBIP_API_KEY}
      base-url: ${INFOBIP_BASE_URL}
      sender: SoukDigital

  - void sendOtp(String phone, String code):
    POST https://{baseUrl}/sms/2/text/advanced
    Headers: Authorization: App {apiKey}, Content-Type: application/json
    Body: { messages: [{ from: "SoukDigital", destinations: [{to: phone}], text: "Votre code Souk Digital: {code}. Valide 5 min." }] }
    Use RestTemplate or WebClient

Wire notifications in:
  - OrderService.placeOrder() → emailService.sendOrderConfirmation(order)
  - AuthService.register() → emailService.sendWelcomeEmail(user) (after OTP verified)
  - All @Async so they don't slow down the API response

Add @EnableAsync to main application class.
```

---

## 16. Security & CORS

### Checklist
- [ ] CORS configured for `http://localhost:3000` (dev) and `https://soukdigital.ma` (prod)
- [ ] Rate limiting on `/api/auth/**` (max 5 requests/minute per IP) using Redis
- [ ] JWT secret is at least 256 bits (32 chars)
- [ ] Passwords hashed with BCrypt strength 12
- [ ] No sensitive data in JWT payload (no password, minimal claims)
- [ ] `X-Content-Type-Options`, `X-Frame-Options` headers set
- [ ] Input validation on all request bodies (`@Valid`)
- [ ] SQL injection impossible (using JPA, no native string concatenation)
- [ ] Vendor can only modify their own products/orders (ownership check)

### Claude Prompt
```
Implement Security hardening and CORS configuration for Souk Digital.
Package: ma.soukdigital.config

CorsConfig.java:
  @Bean CorsConfigurationSource corsConfigurationSource():
    Allow origins from ${cors.allowed-origins} (comma-separated in env)
    Allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
    Allow headers: Authorization, Content-Type, Accept
    Allow credentials: true
    Max age: 3600

SecurityConfig.java (complete):
  - BCryptPasswordEncoder bean with strength 12
  - Stateless session
  - CSRF disabled (REST API, using JWT)
  - Add security headers:
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    X-XSS-Protection: 1; mode=block
  - JwtAuthFilter before UsernamePasswordAuthenticationFilter
  - Permit list (no auth needed):
    GET /api/products/**
    GET /api/categories/**
    GET /api/vendors/**
    GET /api/search/**
    POST /api/auth/**
    GET /api/health
    GET /swagger-ui.html, /swagger-ui/**, /v3/api-docs/**
    POST /api/payment/cmi/callback (CMI posts here, no token)
  - Everything else: authenticated

RateLimitFilter.java (extends OncePerRequestFilter):
  Only applies to /api/auth/** paths
  Use StringRedisTemplate:
    key = "rate_limit:{ip}:{path}"
    Increment counter, set TTL 60 seconds on first request
    If counter > 5: return 429 Too Many Requests
    {"error": "Too many requests", "retryAfterSeconds": 60}
  Add this filter BEFORE JwtAuthFilter in SecurityConfig

OwnershipAspect.java (optional, or handle in service):
  Create @VendorOwned annotation for service methods
  Verify resource.vendorId == currentUser.vendor.id
  Throw AccessDeniedException if mismatch
```

---

## 17. Testing

### Checklist
- [ ] Unit tests for `JwtService` — generate + validate token
- [ ] Unit tests for `OtpService` — generate, verify, expired OTP
- [ ] Unit tests for `OrderService` — price calculation, promo, stock check
- [ ] Unit tests for `PromoService` — validate, expired, max-uses
- [ ] Integration test for `POST /api/auth/register` → OTP flow
- [ ] Integration test for `POST /api/orders` — full order placement
- [ ] Integration test for product CRUD — vendor creates, updates, deletes
- [ ] Test with `@SpringBootTest` + `TestContainers` (PostgreSQL + Redis)

### Claude Prompt
```
Write tests for Souk Digital Spring Boot API.
Use JUnit 5, Mockito, Spring Boot Test, and Testcontainers.

Add test dependencies:
  - testcontainers:postgresql
  - testcontainers:junit-jupiter

1. Unit tests (use @ExtendWith(MockitoExtension.class)):

JwtServiceTest:
  - testGenerateToken_returnsValidJwt()
  - testValidateToken_withValidToken_returnsTrue()
  - testValidateToken_withExpiredToken_returnsFalse()
  - testExtractUserId_returnsCorrectUserId()

OrderServiceTest (mock OrderRepository, ProductRepository, PromoCodeRepository):
  - testPlaceOrder_withValidItems_createsOrder()
  - testPlaceOrder_withInsufficientStock_throwsException()
  - testPlaceOrder_withPromoCode_appliesDiscount()
  - testPlaceOrder_subtotalOver300_zeroDeliveryFee()
  - testPlaceOrder_subtotalUnder300_chargesDeliveryFee()

PromoServiceTest:
  - testValidate_withValidCode_returnsDiscount()
  - testValidate_withExpiredCode_throwsException()
  - testValidate_withMaxUsesReached_throwsException()
  - testValidate_withInactiveCode_throwsException()

2. Integration tests (@SpringBootTest + Testcontainers):

Create AbstractIntegrationTest base class:
  @Testcontainers
  Start PostgreSQL container + Redis container
  @DynamicPropertySource to inject container URLs

AuthIntegrationTest extends AbstractIntegrationTest:
  @Test testRegisterAndLogin_fullFlow():
    POST /api/auth/register → 201
    POST /api/auth/verify-otp → 200, get JWT
    Use JWT to GET /api/orders/my → 200 (not 401)

ProductIntegrationTest:
  testCreateProduct_asVendor_returns201()
  testCreateProduct_asBuyer_returns403()
  testGetProducts_public_returns200WithPagination()
  testGetProductBySlug_notFound_returns404()

OrderIntegrationTest:
  testPlaceOrder_withCod_returns201()
  testGetMyOrders_returnsOnlyBuyerOrders()
```

---

## 18. Deployment

### Checklist
- [ ] `Dockerfile` for Spring Boot app
- [ ] `docker-compose.yml` for local dev (app + PostgreSQL + Redis)
- [ ] Environment variables documented in `.env.example`
- [ ] Health check endpoint works
- [ ] Database migrations run automatically on startup
- [ ] App starts in under 30 seconds
- [ ] Choose hosting: Railway / Render / Heroku / VPS
- [ ] Set up PostgreSQL on Railway (or Supabase)
- [ ] Set up Redis on Railway (or Upstash)
- [ ] Configure all env vars in hosting dashboard
- [ ] Set up GitHub Actions CI: test → build → deploy on push to main

### Claude Prompt
```
Create deployment configuration for Souk Digital Spring Boot API.

1. Dockerfile (multi-stage build):
   Stage 1 (build): maven:3.9-eclipse-temurin-21-alpine
     COPY pom.xml, src/
     RUN mvn clean package -DskipTests
   Stage 2 (runtime): eclipse-temurin:21-jre-alpine
     COPY --from=build target/*.jar app.jar
     EXPOSE 8080
     ENV JAVA_OPTS="-Xmx512m -Xms256m"
     ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

2. docker-compose.yml (local dev):
   services:
     app:
       build: .
       ports: "8080:8080"
       env_file: .env
       depends_on: [postgres, redis]
     postgres:
       image: postgres:16-alpine
       environment: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
       volumes: postgres_data:/var/lib/postgresql/data
       ports: "5432:5432"
     redis:
       image: redis:7-alpine
       ports: "6379:6379"
   volumes: postgres_data

3. .env.example (document all required variables):
   DB_URL=jdbc:postgresql://localhost:5432/souk_digital
   DB_USER=souk
   DB_PASSWORD=secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-256-bit-secret-key-here-min-32-chars
   CORS_ORIGINS=http://localhost:3000
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASSWORD=re_xxxx
   INFOBIP_API_KEY=
   INFOBIP_BASE_URL=
   STORAGE_BUCKET=souk-digital
   STORAGE_REGION=eu-west-1
   STORAGE_ACCESS_KEY=
   STORAGE_SECRET_KEY=
   STORAGE_PUBLIC_URL=
   CMI_MERCHANT_ID=
   CMI_STORE_KEY=
   CMI_OK_URL=
   CMI_FAIL_URL=
   CMI_CALLBACK_URL=

4. .github/workflows/deploy.yml:
   Trigger: push to main
   Jobs:
     test: mvn test (with service containers for PostgreSQL + Redis)
     build: mvn package -DskipTests, docker build + push to registry
     deploy: Railway/Render deploy hook (curl the deploy webhook URL)

5. application-prod.yml:
   logging.level.root: WARN
   logging.level.ma.soukdigital: INFO
   spring.jpa.show-sql: false
   management.endpoints.web.exposure.include: health,info
```

---

## 19. Frontend Integration (Next.js)

### Checklist
- [ ] Create `src/lib/api/client.ts` — base fetch wrapper with JWT header
- [ ] Create `src/lib/api/auth.ts` — register, verifyOtp, login, logout
- [ ] Create `src/lib/api/products.ts` — getProducts, getProduct, search
- [ ] Create `src/lib/api/orders.ts` — placeOrder, getMyOrders
- [ ] Create `src/lib/api/vendors.ts` — getVendor, getVendors
- [ ] Replace all mock data imports in pages with real API calls
- [ ] Update `useAuthStore` to call real auth API
- [ ] Update `useCartStore` checkout to call real orders API
- [ ] Handle loading states + error states in all pages
- [ ] Add `NEXT_PUBLIC_API_URL` to `.env.local`

### Claude Prompt
```
Integrate the Spring Boot API with the existing Souk Digital Next.js frontend.
The API runs at NEXT_PUBLIC_API_URL (default: http://localhost:8080/api).

1. Create src/lib/api/client.ts:
   - apiClient(path, options) function:
     * Prepend NEXT_PUBLIC_API_URL to path
     * Attach Authorization: Bearer {token} from localStorage/cookie if present
     * Handle 401 → clear auth store + redirect to login
     * Handle non-ok responses → throw ApiError with status + message from response JSON
   - Export typed wrappers: get<T>, post<T>, put<T>, patch<T>, del<T>

2. src/lib/api/auth.ts:
   register(data: RegisterRequest) → POST /auth/register
   verifyOtp(data: OtpVerifyRequest) → POST /auth/verify-otp → AuthResponse
   login(data: LoginRequest) → POST /auth/login → AuthResponse
   refreshToken(token: string) → POST /auth/refresh

3. src/lib/api/products.ts:
   getProducts(filters: ProductFilterRequest) → GET /products?...
   getProductBySlug(slug: string) → GET /products/{slug}
   getRelatedProducts(id: string) → GET /products/{id}/related
   searchProducts(params: SearchRequest) → GET /search?...

4. src/lib/api/orders.ts:
   placeOrder(data: PlaceOrderRequest) → POST /orders
   getMyOrders(page: number) → GET /orders/my?page={page}
   getOrderById(id: string) → GET /orders/{id}

5. src/lib/api/vendors.ts:
   getVendors(params?) → GET /vendors
   getVendorBySlug(slug: string) → GET /vendors/{slug}
   getVendorProducts(slug: string) → GET /vendors/{slug}/products

6. Update src/lib/store/auth.ts (useAuthStore):
   login action should call api/auth login, store accessToken in store
   logout action should clear store
   Add hydration from localStorage on client side

7. Replace in src/app/[locale]/page.tsx:
   Remove MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_VENDORS imports
   Use async server component to fetch: const products = await getProducts({})
   Use Suspense boundaries for loading states

8. Replace in src/app/[locale]/(shop)/products/[slug]/page.tsx:
   const product = await getProductBySlug(slug)
   Handle notFound() if null

9. Create src/components/ui/error-boundary.tsx for API errors
10. Create src/components/ui/product-card-skeleton.tsx for loading state
```

---

## Quick Reference — All API Endpoints

```
AUTH
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/resend-otp

PRODUCTS (public GET, VENDOR write)
GET    /api/products
GET    /api/products/{slug}
GET    /api/products/{id}/related
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
PATCH  /api/products/{id}/toggle

CATEGORIES (public)
GET    /api/categories
GET    /api/categories/{slug}
GET    /api/categories/{slug}/products

VENDORS
GET    /api/vendors
GET    /api/vendors/{slug}
GET    /api/vendors/{slug}/products
POST   /api/vendors/register
GET    /api/vendors/me
PUT    /api/vendors/me
POST   /api/vendors/{id}/follow
DELETE /api/vendors/{id}/follow

ORDERS (authenticated)
POST   /api/orders
GET    /api/orders/my
GET    /api/orders/{id}
PATCH  /api/orders/{id}/status

PAYMENT
POST   /api/payment/cmi/init
POST   /api/payment/cmi/callback
GET    /api/payment/order/{id}

REVIEWS
GET    /api/products/{productId}/reviews
GET    /api/products/{productId}/reviews/stats
POST   /api/products/{productId}/reviews
DELETE /api/reviews/{id}

PROMO
POST   /api/promo/validate

SEARCH
GET    /api/search
GET    /api/search/suggestions

UPLOAD
POST   /api/upload/image
POST   /api/upload/images

VENDOR DASHBOARD
GET    /api/vendor/dashboard/stats
GET    /api/vendor/dashboard/revenue-trend
GET    /api/vendor/dashboard/orders
GET    /api/vendor/dashboard/top-products
GET    /api/vendor/dashboard/orders-status

ADMIN
GET    /api/admin/users
PATCH  /api/admin/users/{id}/role
PATCH  /api/admin/users/{id}/ban
GET    /api/admin/vendors
PATCH  /api/admin/vendors/{id}/verify
GET    /api/admin/orders
GET    /api/admin/products
DELETE /api/admin/products/{id}
GET    /api/admin/stats
POST   /api/admin/promo
```

---

## Progress Tracker

Copy this into your project and check off as you complete each step:

- [x] **Step 1** — Project setup & health endpoint
- [x] **Step 2** — Flyway migrations (schema + seeds) + Entities & Repositories
- [x] **Step 3** — Entities & repositories + Authentication (JWT + OTP)
- [x] **Step 4** — Authentication (register, OTP, login, JWT) + Products & Categories API
- [x] **Step 5** — Products & categories APIs + Vendors API
- [x] **Step 6** — Vendors APIs + Orders & Cart
- [x] **Step 7** — Orders API + Payment (COD + CMI + Mobile)
- [x] **Step 8** — Payment (COD + CMI) + Reviews & Ratings
- [x] **Step 9** — Reviews & ratings
- [x] **Step 10** — Promo codes + Search & filters
- [x] **Step 11** — Search & filters
- [x] **Step 12** — File upload (S3)
- [x] **Step 13** — Vendor dashboard & analytics
- [x] **Step 14** — Admin panel APIs
- [x] **Step 15** — Email & SMS notifications
- [x] **Step 16** — Security hardening & CORS
- [x] **Step 17** — Tests
- [x] **Step 18** — Docker & deployment
- [x] **Step 19** — Next.js frontend integration
