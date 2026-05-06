// ── Pagination ─────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── Enums ──────────────────────────────────────────────────
export type Role = "BUYER" | "VENDOR" | "ADMIN";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentMethod = "COD" | "CARD_CMI" | "MOBILE" | "TRANSFER";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type Badge = "ARTISAN" | "SALE" | "NEW" | "TOP" | "FLASH";

// ── Auth ───────────────────────────────────────────────────
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: Role;
  isVerified: boolean;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: UserDto;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

// ── Categories ─────────────────────────────────────────────
export interface CategoryResponse {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  emoji: string | null;
  imageUrl: string | null;
  parentId: string | null;
  children: CategoryResponse[];
  sortOrder: number;
}

// ── Products ───────────────────────────────────────────────
export interface ProductVendorDto {
  id: string;
  name: string;
  slug: string;
  artisan: boolean;
  verified: boolean;
  avatarUrl: string | null;
}

export interface ProductSummaryDto {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  badge: Badge | null;
  inStock: boolean;
  freeDelivery: boolean;
  city: string | null;
  vendor: ProductVendorDto;
}

export interface ProductDetailDto extends ProductSummaryDto {
  images: string[];
  description: string | null;
  descriptionAr: string | null;
  stockCount: number;
  category: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
  } | null;
}

export interface CreateProductRequest {
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  categoryId: string;
  badge?: Badge;
  city?: string;
  freeDelivery?: boolean;
  imageUrls: string[];
}

export interface ProductFilterRequest {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  freeDelivery?: boolean;
  artisanOnly?: boolean;
  minRating?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  size?: number;
}

// ── Vendors ────────────────────────────────────────────────
export interface VendorSummaryDto {
  id: string;
  slug: string;
  name: string;
  nameAr: string | null;
  city: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  artisan: boolean;
  verified: boolean;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export interface VendorDetailDto extends VendorSummaryDto {
  description: string | null;
  descriptionAr: string | null;
  followerCount: number;
  memberSince: string;
  userId: string;
}

export interface CreateVendorRequest {
  name: string;
  nameAr?: string;
  city: string;
  description?: string;
  descriptionAr?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isArtisan?: boolean;
}

// ── Orders ─────────────────────────────────────────────────
export interface DeliveryAddressRequest {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  zipCode?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface PlaceOrderRequest {
  items: OrderItemRequest[];
  address: DeliveryAddressRequest;
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  productImage: string | null;
  vendorId: string;
  vendorName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderSummaryDto {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  itemCount: number;
  firstItemName: string;
  firstItemImage: string | null;
}

export interface OrderDetailDto extends OrderSummaryDto {
  items: OrderItemDto[];
  address: DeliveryAddressRequest;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  promoCode: string | null;
  trackingNumber: string | null;
  buyer: { firstName: string; lastName: string; phone: string };
}

// ── Payment ────────────────────────────────────────────────
export interface CmiInitResponse {
  paymentUrl: string;
  params: Record<string, string>;
}

export interface PaymentStatusDto {
  orderId: string;
  status: PaymentStatus;
  provider: string;
  providerRef: string | null;
  amount: number;
}

// ── Reviews ────────────────────────────────────────────────
export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewDetailDto {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  author: string;
  authorAvatar: string | null;
}

export interface RatingDistributionDto {
  star: number;
  count: number;
  percent: number;
}

export interface ReviewStatsDto {
  averageRating: number;
  totalCount: number;
  distribution: RatingDistributionDto[];
}

// ── Promo ──────────────────────────────────────────────────
export interface PromoValidationResponse {
  valid: boolean;
  code: string;
  discountPercent: number | null;
  message: string;
}

// ── Search ─────────────────────────────────────────────────
export interface SearchResultsDto {
  products: Page<ProductSummaryDto>;
  vendors: VendorSummaryDto[];
  totalProducts: number;
  query: string;
}

// ── Vendor Dashboard ───────────────────────────────────────
export interface DashboardStatsDto {
  revenue: number;
  revenueTotal: number;
  revenueGrowthPct: number;
  ordersThisMonth: number;
  ordersTotal: number;
  ordersGrowthPct: number;
  activeProducts: number;
  averageRating: number;
  reviewCount: number;
}

export interface MonthlyRevenueDto {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductDto {
  productId: string;
  name: string;
  image: string | null;
  totalSold: number;
  revenue: number;
  rating: number;
}

// ── Admin ──────────────────────────────────────────────────
export interface AdminUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: Role;
  isVerified: boolean;
  avatarUrl: string | null;
  banned: boolean;
  createdAt: string;
}

export interface AdminVendorDto extends VendorSummaryDto {
  userId: string;
  memberSince: string;
}

export interface PlatformStatsDto {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface PromoCodeDto {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

export interface CreatePromoRequest {
  code: string;
  discountPercent: number;
  maxUses?: number;
  expiresAt?: string;
}

// ── Search (legacy alias) ──────────────────────────────────
export interface SearchRequest extends ProductFilterRequest {
  q?: string;
}
