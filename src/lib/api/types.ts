// ── Shared pagination ──────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

// ── Auth ──────────────────────────────────────────────────
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
  verified: boolean;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

// ── Products ──────────────────────────────────────────────
export interface ProductVendorDto {
  id: string;
  name: string;
  slug: string;
  artisan: boolean;
  verified: boolean;
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
  badge: string | null;
  inStock: boolean;
  freeDelivery: boolean;
  city: string;
  vendor: ProductVendorDto;
}

export interface ProductDetailDto extends ProductSummaryDto {
  description: string | null;
  descriptionAr: string | null;
  images: string[];
  stockCount: number;
  category: { id: string; slug: string; name: string; nameAr: string } | null;
}

export interface ProductFilterRequest {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  freeDelivery?: boolean;
  artisanOnly?: boolean;
  minRating?: number;
  sort?: string;
  page?: number;
  size?: number;
}

// ── Vendors ───────────────────────────────────────────────
export interface VendorSummaryDto {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  city: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  artisan: boolean;
  verified: boolean;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

// ── Orders ────────────────────────────────────────────────
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
  paymentMethod: "COD" | "CARD_CMI" | "MOBILE" | "TRANSFER";
  promoCode?: string;
}

export interface OrderSummaryDto {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  itemCount: number;
  firstItemName: string | null;
  firstItemImage: string | null;
}

export interface OrderDetailDto extends OrderSummaryDto {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  promoCode: string | null;
  trackingNumber: string | null;
  items: {
    productId: string;
    productName: string;
    productImage: string | null;
    vendorId: string;
    vendorName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  buyer: { id: string; firstName: string; lastName: string; phone: string };
  address: DeliveryAddressRequest | null;
}

// ── Search ────────────────────────────────────────────────
export interface SearchResultsDto {
  query: string | null;
  total: number;
  products: Page<ProductSummaryDto>;
  vendors: VendorSummaryDto[];
}

export interface SearchRequest extends ProductFilterRequest {}
