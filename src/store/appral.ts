const API_BASE_URL = 'https://api.dddgroup.in/api/store';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  children: Category[];
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  size: string | null;
  color_name: string | null;
  color_hex: string | null;
  price_override: string | null;
  stock: number;
  is_active: boolean;
  additional_attributes: Record<string, unknown> | null;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: string;
  short_description: string | null;
  price: string;
  compare_at_price: string | null;
  badge: string | null;
  in_stock: boolean;
  primary_image: ProductImage | null;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  attributes: Record<string, unknown> | null;
  additional_categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  total_stock: number;
  related_products: ProductListItem[];
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: number;
  product: ProductListItem;
  variant: ProductVariant | null;
  product_id?: number;
  variant_id?: number | null;
  created_at: string;
}

export interface CartItem {
  id: number;
  product: ProductListItem;
  variant: ProductVariant | null;
  product_id?: number;
  variant_id?: number | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  status: string;
  item_count: number;
  subtotal: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface RecentlyViewedItem {
  id: number;
  product: ProductListItem;
  last_seen: string;
}

export interface ApiErrorPayload {
  detail?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;

  public readonly data: unknown;

  constructor(status: number, data: unknown) {
    const message = ApiError.extractMessage(data) ?? `Request failed with status ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  private static extractMessage(data: unknown): string | undefined {
    if (!data) {
      return undefined;
    }
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && 'detail' in data && typeof (data as ApiErrorPayload).detail === 'string') {
      return (data as ApiErrorPayload).detail;
    }
    return undefined;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | string[] | undefined>;
}

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item));
      });
    } else {
      params.append(key, String(value));
    }
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, headers, query } = options;
  const queryString = buildQuery(query);
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}${queryString}`;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  let serializedBody: string | undefined;
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    serializedBody = JSON.stringify(body);
  }

  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: serializedBody,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json') ?? false;
  const hasBody = response.status !== 204 && response.status !== 205;
  const payload = hasBody
    ? isJson
      ? await response.json()
      : await response.text()
    : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return (isJson ? payload : undefined) as T;
}

export interface ProductListQuery {
  category?: string;
  price_min?: number;
  price_max?: number;
  size?: string[];
  color?: string[];
  in_stock?: boolean;
  q?: string;
  ordering?: 'price_low' | 'price_high' | 'name';
}

export async function fetchCategories(): Promise<Category[]> {
  return request<Category[]>('/categories/');
}

export async function fetchProducts(query?: ProductListQuery): Promise<ProductListItem[]> {
  return request<ProductListItem[]>('/products/', {
    query: {
      category: query?.category,
      price_min: query?.price_min,
      price_max: query?.price_max,
      in_stock: query?.in_stock ? 'true' : undefined,
      q: query?.q,
      ordering: query?.ordering,
      size: query?.size,
      color: query?.color,
    },
  });
}

export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${slug}/`);
}

export async function fetchProductVariants(slug: string): Promise<ProductVariant[]> {
  return request<ProductVariant[]>(`/products/${slug}/variants/`);
}

export async function fetchWishlist(accessToken: string): Promise<WishlistItem[]> {
  return request<WishlistItem[]>('/wishlist/', {
    accessToken,
  });
}

export interface WishlistMutationPayload {
  product_id: number;
  variant_id?: number | null;
}

export async function addToWishlist(accessToken: string, payload: WishlistMutationPayload): Promise<WishlistItem> {
  return request<WishlistItem>('/wishlist/', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function removeFromWishlist(accessToken: string, id: number): Promise<void> {
  await request<void>(`/wishlist/${id}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function fetchCart(accessToken: string): Promise<Cart> {
  return request<Cart>('/cart/', {
    accessToken,
  });
}

export interface CartAddItemPayload {
  product_id: number;
  variant_id?: number | null;
  quantity?: number;
}

export async function addCartItem(accessToken: string, payload: CartAddItemPayload): Promise<Cart> {
  return request<Cart>('/cart/items/', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export interface CartUpdateItemPayload {
  quantity: number;
}

export async function updateCartItem(accessToken: string, itemId: number, payload: CartUpdateItemPayload): Promise<Cart> {
  return request<Cart>(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}

export async function removeCartItem(accessToken: string, itemId: number): Promise<Cart> {
  return request<Cart>(`/cart/items/${itemId}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function fetchRecentlyViewed(accessToken: string): Promise<RecentlyViewedItem[]> {
  return request<RecentlyViewedItem[]>('/recently-viewed/', {
    accessToken,
  });
}

export const appralApi = {
  fetchCategories,
  fetchProducts,
  fetchProductDetail,
  fetchProductVariants,
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  fetchRecentlyViewed,
};
