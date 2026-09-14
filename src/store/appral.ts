import { mockDb } from './mockDb';

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
  variants?: ProductVariant[];
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
    const message = typeof data === 'string' ? data : `Local Error ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
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
  return Promise.resolve(mockDb.getCategories());
}

export async function fetchProducts(query?: ProductListQuery): Promise<ProductListItem[]> {
  let products = mockDb.getProducts();

  if (query?.category) {
    const categoryLower = query.category.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.category.toLowerCase() === categoryLower ||
        p.category.toLowerCase().replace(/\s+/g, '-') === categoryLower ||
        p.category.toLowerCase().replace(/[^a-z0-9]/g, '') === categoryLower.replace(/[^a-z0-9]/g, '')
    );
  }

  if (query?.q) {
    const term = query.q.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.short_description && p.short_description.toLowerCase().includes(term)) ||
        p.sku.toLowerCase().includes(term)
    );
  }

  if (query?.in_stock !== undefined) {
    products = products.filter((p) => p.in_stock === query.in_stock);
  }

  if (query?.price_min !== undefined) {
    products = products.filter((p) => Number.parseFloat(p.price) >= (query.price_min ?? 0));
  }

  if (query?.price_max !== undefined) {
    products = products.filter((p) => Number.parseFloat(p.price) <= (query.price_max ?? 0));
  }

  if (query?.size && query.size.length > 0) {
    products = products.filter((p) =>
      p.variants?.some((v) => v.size && query.size?.includes(v.size))
    );
  }

  if (query?.color && query.color.length > 0) {
    products = products.filter((p) =>
      p.variants?.some((v) => v.color_name && query.color?.includes(v.color_name))
    );
  }

  if (query?.ordering) {
    if (query.ordering === 'price_low') {
      products = [...products].sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price));
    } else if (query.ordering === 'price_high') {
      products = [...products].sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price));
    } else if (query.ordering === 'name') {
      products = [...products].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const listItems: ProductListItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    short_description: p.short_description,
    price: p.price,
    compare_at_price: p.compare_at_price,
    badge: p.badge,
    in_stock: p.in_stock,
    primary_image: p.primary_image,
    variants: p.variants,
  }));

  return Promise.resolve(listItems);
}

export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const products = mockDb.getProducts();
  const product = products.find(
    (p) => p.slug === slug || String(p.id) === slug
  );

  if (!product) {
    // Fallback to first product or create detail
    const first = products[0];
    if (first) return Promise.resolve(first);
    throw new ApiError(404, 'Product not found');
  }

  return Promise.resolve(product);
}

export async function fetchProductVariants(slug: string): Promise<ProductVariant[]> {
  const product = await fetchProductDetail(slug);
  return Promise.resolve(product.variants || []);
}

export async function fetchWishlist(_accessToken?: string): Promise<WishlistItem[]> {
  return Promise.resolve(mockDb.getWishlist());
}

export interface WishlistMutationPayload {
  product_id: number;
  variant_id?: number | null;
}

export async function addToWishlist(_accessToken: string, payload: WishlistMutationPayload): Promise<WishlistItem> {
  const wishlist = mockDb.getWishlist();
  const products = mockDb.getProducts();
  const product = products.find((p) => p.id === payload.product_id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const variant = payload.variant_id
    ? product.variants?.find((v) => v.id === payload.variant_id) ?? null
    : null;

  const existing = wishlist.find(
    (item) => item.product.id === payload.product_id && item.variant?.id === payload.variant_id
  );

  if (existing) {
    return Promise.resolve(existing);
  }

  const newItem: WishlistItem = {
    id: Date.now(),
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      short_description: product.short_description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      badge: product.badge,
      in_stock: product.in_stock,
      primary_image: product.primary_image,
      variants: product.variants,
    },
    variant,
    product_id: product.id,
    variant_id: variant?.id,
    created_at: new Date().toISOString(),
  };

  const updated = [...wishlist, newItem];
  mockDb.saveWishlist(updated);
  return Promise.resolve(newItem);
}

export async function removeFromWishlist(_accessToken: string, id: number): Promise<void> {
  const wishlist = mockDb.getWishlist();
  const updated = wishlist.filter((item) => item.id !== id && item.product.id !== id);
  mockDb.saveWishlist(updated);
  return Promise.resolve();
}

export async function fetchCart(_accessToken?: string): Promise<Cart> {
  return Promise.resolve(mockDb.getCart());
}

export interface CartAddItemPayload {
  product_id: number;
  variant_id?: number | null;
  quantity?: number;
}

export async function addCartItem(_accessToken: string, payload: CartAddItemPayload): Promise<Cart> {
  const cart = mockDb.getCart();
  const products = mockDb.getProducts();
  const product = products.find((p) => p.id === payload.product_id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const quantity = Math.max(payload.quantity ?? 1, 1);
  const variant = payload.variant_id
    ? product.variants?.find((v) => v.id === payload.variant_id) ?? null
    : null;

  const unitPrice = variant?.price_override ?? product.price;

  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.id === payload.product_id &&
      (payload.variant_id ? item.variant?.id === payload.variant_id : true)
  );

  let updatedItems: CartItem[];

  if (existingIndex > -1) {
    updatedItems = [...cart.items];
    const existing = updatedItems[existingIndex];
    const newQty = existing.quantity + quantity;
    const lineTotal = (Number.parseFloat(unitPrice) * newQty).toFixed(2);
    updatedItems[existingIndex] = {
      ...existing,
      quantity: newQty,
      line_total: lineTotal,
      updated_at: new Date().toISOString(),
    };
  } else {
    const lineTotal = (Number.parseFloat(unitPrice) * quantity).toFixed(2);
    const newItem: CartItem = {
      id: Date.now(),
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: product.category,
        short_description: product.short_description,
        price: product.price,
        compare_at_price: product.compare_at_price,
        badge: product.badge,
        in_stock: product.in_stock,
        primary_image: product.primary_image,
        variants: product.variants,
      },
      variant,
      product_id: product.id,
      variant_id: variant?.id,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updatedItems = [...cart.items, newItem];
  }

  const updatedCart: Cart = {
    ...cart,
    items: updatedItems,
  };

  mockDb.saveCart(updatedCart);
  return Promise.resolve(mockDb.getCart());
}

export interface CartUpdateItemPayload {
  quantity: number;
}

export async function updateCartItem(
  _accessToken: string,
  itemId: number,
  payload: CartUpdateItemPayload
): Promise<Cart> {
  const cart = mockDb.getCart();
  const quantity = Math.max(payload.quantity, 1);

  const updatedItems = cart.items.map((item) => {
    if (item.id === itemId) {
      const lineTotal = (Number.parseFloat(item.unit_price) * quantity).toFixed(2);
      return {
        ...item,
        quantity,
        line_total: lineTotal,
        updated_at: new Date().toISOString(),
      };
    }
    return item;
  });

  const updatedCart: Cart = {
    ...cart,
    items: updatedItems,
  };

  mockDb.saveCart(updatedCart);
  return Promise.resolve(mockDb.getCart());
}

export async function removeCartItem(_accessToken: string, itemId: number): Promise<Cart> {
  const cart = mockDb.getCart();
  const updatedItems = cart.items.filter((item) => item.id !== itemId);

  const updatedCart: Cart = {
    ...cart,
    items: updatedItems,
  };

  mockDb.saveCart(updatedCart);
  return Promise.resolve(mockDb.getCart());
}

export async function fetchRecentlyViewed(_accessToken?: string): Promise<RecentlyViewedItem[]> {
  return Promise.resolve(mockDb.getRecentlyViewed());
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
