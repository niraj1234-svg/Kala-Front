import { mockDb } from './mockDb';
import type { ProductDetail as AppralProductDetail } from './appral';

export interface ApiErrorPayload {
  detail?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(status: number, data: unknown) {
    const message = typeof data === 'string' ? data : `Admin Error (${status})`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product: number;
  image: string | null;
  image_url: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number | null;
}

export interface ProductVariant {
  id: number;
  product: number;
  sku: string;
  size: string | null;
  color_name: string | null;
  color_hex: string | null;
  price_override: number | null;
  stock: number;
  is_active: boolean;
  additional_attributes: Record<string, unknown> | null;
}

export type ProductCategoryValue = string | Category;

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategoryValue;
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
  created_at: string;
  updated_at: string;
}

export function getProductCategoryLabel(category: ProductCategoryValue): string {
  if (!category) {
    return '';
  }
  if (typeof category === 'string') {
    return category;
  }
  return category.name ?? '';
}

export interface AdminDashboardSummary {
  total_users: number;
  total_products: number;
  total_categories: number;
  total_carts: number;
  total_stock: number;
  recent_products: ProductListItem[];
  recent_users: AdminUser[];
  products_per_category: { name: string; count: number }[];
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AdminProductPayload {
  name: string;
  slug?: string;
  sku: string;
  category: number;
  additional_categories?: number[];
  short_description?: string;
  description?: string;
  base_price: string;
  compare_at_price?: string | null;
  badge?: string | null;
  is_active: boolean;
  attributes?: Record<string, unknown> | null;
}

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  parent?: number | null;
  description?: string | null;
  is_active: boolean;
}

export interface AdminProductQuery {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ProductVariantPayload {
  sku: string;
  size?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  price_override?: number | null;
  stock: number;
  is_active: boolean;
  additional_attributes?: Record<string, unknown> | null;
}

export interface ProductImagePayload {
  image?: File | Blob | string | null;
  image_url?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number | null;
}

function mapToAdminProduct(p: AppralProductDetail): ProductDetail {
  const images: ProductImage[] = (p.images || []).map((img) => ({
    id: img.id,
    product: p.id,
    image: null,
    image_url: img.image_url,
    alt_text: img.alt_text,
    is_primary: img.is_primary,
    display_order: img.display_order,
  }));

  const primaryImage: ProductImage | null = p.primary_image
    ? {
        id: p.primary_image.id,
        product: p.id,
        image: null,
        image_url: p.primary_image.image_url,
        alt_text: p.primary_image.alt_text,
        is_primary: p.primary_image.is_primary,
        display_order: p.primary_image.display_order,
      }
    : images[0] || null;

  const variants: ProductVariant[] = (p.variants || []).map((v) => ({
    id: v.id,
    product: p.id,
    sku: v.sku,
    size: v.size,
    color_name: v.color_name,
    color_hex: v.color_hex,
    price_override: v.price_override ? Number.parseFloat(v.price_override) : null,
    stock: v.stock,
    is_active: v.is_active,
    additional_attributes: v.additional_attributes,
  }));

  return {
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
    primary_image: primaryImage,
    description: p.description,
    attributes: p.attributes,
    additional_categories: (p.additional_categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent: null,
      description: c.description,
      is_active: c.is_active,
    })),
    images,
    variants,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export async function fetchDashboard(_accessToken: string): Promise<AdminDashboardSummary> {
  const products = mockDb.getProducts();
  const categories = mockDb.getCategories();
  const users = mockDb.getUsers();
  const cart = mockDb.getCart();

  const totalStock = products.reduce((acc, p) => acc + (p.total_stock || 0), 0);

  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const productsPerCategory = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const recentProducts: ProductListItem[] = products.slice(0, 5).map(mapToAdminProduct);

  return Promise.resolve({
    total_users: users.length,
    total_products: products.length,
    total_categories: categories.length,
    total_carts: cart.items.length > 0 ? 1 : 0,
    total_stock: totalStock,
    recent_products: recentProducts,
    recent_users: users.slice(0, 5),
    products_per_category: productsPerCategory,
  });
}

export async function fetchProducts(_accessToken: string, query?: AdminProductQuery): Promise<ProductListItem[]> {
  let products = mockDb.getProducts();

  if (query?.search) {
    const q = query.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return Promise.resolve(products.map(mapToAdminProduct));
}

export async function fetchRecentProducts(_accessToken: string): Promise<ProductListItem[]> {
  const products = mockDb.getProducts();
  return Promise.resolve(products.slice(0, 5).map(mapToAdminProduct));
}

export async function fetchProduct(_accessToken: string, slug: string): Promise<ProductDetail> {
  const products = mockDb.getProducts();
  const p = products.find((prod) => prod.slug === slug || String(prod.id) === slug);
  if (!p) {
    throw new ApiError(404, 'Product not found');
  }
  return Promise.resolve(mapToAdminProduct(p));
}

export async function createProduct(_accessToken: string, payload: AdminProductPayload): Promise<ProductDetail> {
  const products = mockDb.getProducts();
  const categories = mockDb.getCategories();
  const categoryObj = categories.find((c) => c.id === payload.category);
  const categoryName = categoryObj ? categoryObj.name : 'Uncategorized';

  const newId = Date.now();
  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const newProduct: AppralProductDetail = {
    id: newId,
    name: payload.name,
    slug,
    sku: payload.sku,
    category: categoryName,
    short_description: payload.short_description || null,
    description: payload.description || '',
    price: payload.base_price,
    compare_at_price: payload.compare_at_price || null,
    badge: payload.badge || null,
    in_stock: payload.is_active,
    total_stock: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attributes: payload.attributes || null,
    additional_categories: [],
    primary_image: {
      id: newId + 1,
      image_url: '/1.jpeg',
      alt_text: payload.name,
      is_primary: true,
      display_order: 1,
    },
    images: [
      {
        id: newId + 1,
        image_url: '/1.jpeg',
        alt_text: payload.name,
        is_primary: true,
        display_order: 1,
      },
    ],
    variants: [
      {
        id: newId + 10,
        sku: `${payload.sku}-M`,
        size: 'M',
        color_name: 'Black',
        color_hex: '#000000',
        price_override: null,
        stock: 50,
        is_active: true,
        additional_attributes: null,
      },
    ],
    related_products: [],
  };

  mockDb.saveProducts([newProduct, ...products]);
  return Promise.resolve(mapToAdminProduct(newProduct));
}

export async function updateProduct(
  _accessToken: string,
  slug: string,
  payload: AdminProductPayload
): Promise<ProductDetail> {
  const products = mockDb.getProducts();
  const index = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (index === -1) {
    throw new ApiError(404, 'Product not found');
  }

  const existing = products[index];
  const categories = mockDb.getCategories();
  const categoryObj = categories.find((c) => c.id === payload.category);
  const categoryName = categoryObj ? categoryObj.name : existing.category;

  const updated: AppralProductDetail = {
    ...existing,
    name: payload.name,
    sku: payload.sku,
    category: categoryName,
    short_description: payload.short_description || existing.short_description,
    description: payload.description || existing.description,
    price: payload.base_price,
    compare_at_price: payload.compare_at_price ?? existing.compare_at_price,
    badge: payload.badge ?? existing.badge,
    in_stock: payload.is_active,
    attributes: payload.attributes ?? existing.attributes,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  mockDb.saveProducts(products);
  return Promise.resolve(mapToAdminProduct(updated));
}

export async function partialUpdateProduct(
  _accessToken: string,
  slug: string,
  payload: Partial<AdminProductPayload>
): Promise<ProductDetail> {
  const products = mockDb.getProducts();
  const index = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (index === -1) {
    throw new ApiError(404, 'Product not found');
  }

  const existing = products[index];
  const updated: AppralProductDetail = {
    ...existing,
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.sku ? { sku: payload.sku } : {}),
    ...(payload.base_price ? { price: payload.base_price } : {}),
    ...(payload.compare_at_price !== undefined ? { compare_at_price: payload.compare_at_price } : {}),
    ...(payload.badge !== undefined ? { badge: payload.badge } : {}),
    ...(payload.is_active !== undefined ? { in_stock: payload.is_active } : {}),
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  mockDb.saveProducts(products);
  return Promise.resolve(mapToAdminProduct(updated));
}

export async function deleteProduct(_accessToken: string, slug: string): Promise<void> {
  const products = mockDb.getProducts();
  const filtered = products.filter((p) => p.slug !== slug && String(p.id) !== slug);
  mockDb.saveProducts(filtered);
  return Promise.resolve();
}

export async function fetchProductVariants(_accessToken: string, slug: string): Promise<ProductVariant[]> {
  const product = await fetchProduct(_accessToken, slug);
  return Promise.resolve(product.variants);
}

export async function createProductVariant(
  _accessToken: string,
  slug: string,
  payload: ProductVariantPayload
): Promise<ProductVariant> {
  const products = mockDb.getProducts();
  const index = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (index === -1) throw new ApiError(404, 'Product not found');

  const prod = products[index];
  const newVariantId = Date.now();
  const newVariant = {
    id: newVariantId,
    sku: payload.sku,
    size: payload.size ?? null,
    color_name: payload.color_name ?? null,
    color_hex: payload.color_hex ?? null,
    price_override: payload.price_override ? String(payload.price_override) : null,
    stock: payload.stock,
    is_active: payload.is_active,
    additional_attributes: payload.additional_attributes ?? null,
  };

  prod.variants = [...(prod.variants || []), newVariant];
  prod.total_stock = (prod.total_stock || 0) + payload.stock;
  mockDb.saveProducts(products);

  return Promise.resolve({
    id: newVariant.id,
    product: prod.id,
    sku: newVariant.sku,
    size: newVariant.size,
    color_name: newVariant.color_name,
    color_hex: newVariant.color_hex,
    price_override: payload.price_override ?? null,
    stock: newVariant.stock,
    is_active: newVariant.is_active,
    additional_attributes: newVariant.additional_attributes,
  });
}

export async function updateProductVariant(
  _accessToken: string,
  slug: string,
  variantId: number,
  payload: Partial<ProductVariantPayload>
): Promise<ProductVariant> {
  const products = mockDb.getProducts();
  const prodIndex = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (prodIndex === -1) throw new ApiError(404, 'Product not found');

  const prod = products[prodIndex];
  const varIndex = prod.variants?.findIndex((v) => v.id === variantId) ?? -1;
  if (varIndex === -1) throw new ApiError(404, 'Variant not found');

  const current = prod.variants![varIndex];
  const updated = {
    ...current,
    ...(payload.sku ? { sku: payload.sku } : {}),
    ...(payload.size !== undefined ? { size: payload.size } : {}),
    ...(payload.color_name !== undefined ? { color_name: payload.color_name } : {}),
    ...(payload.color_hex !== undefined ? { color_hex: payload.color_hex } : {}),
    ...(payload.price_override !== undefined
      ? { price_override: payload.price_override ? String(payload.price_override) : null }
      : {}),
    ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
    ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {}),
  };

  prod.variants![varIndex] = updated;
  mockDb.saveProducts(products);

  return Promise.resolve({
    id: updated.id,
    product: prod.id,
    sku: updated.sku,
    size: updated.size,
    color_name: updated.color_name,
    color_hex: updated.color_hex,
    price_override: updated.price_override ? Number.parseFloat(updated.price_override) : null,
    stock: updated.stock,
    is_active: updated.is_active,
    additional_attributes: updated.additional_attributes,
  });
}

export async function deleteProductVariant(_accessToken: string, slug: string, variantId: number): Promise<void> {
  const products = mockDb.getProducts();
  const prodIndex = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (prodIndex !== -1) {
    products[prodIndex].variants = products[prodIndex].variants?.filter((v) => v.id !== variantId);
    mockDb.saveProducts(products);
  }
  return Promise.resolve();
}

export async function fetchProductImages(_accessToken: string, slug: string): Promise<ProductImage[]> {
  const product = await fetchProduct(_accessToken, slug);
  return Promise.resolve(product.images);
}

export async function createProductImage(
  _accessToken: string,
  slug: string,
  payload: ProductImagePayload
): Promise<ProductImage> {
  const products = mockDb.getProducts();
  const prodIndex = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (prodIndex === -1) throw new ApiError(404, 'Product not found');

  const prod = products[prodIndex];
  const newImgId = Date.now();
  const newImg = {
    id: newImgId,
    image_url: typeof payload.image === 'string' ? payload.image : '/1.jpeg',
    alt_text: payload.alt_text ?? prod.name,
    is_primary: Boolean(payload.is_primary),
    display_order: payload.display_order ?? (prod.images?.length || 0) + 1,
  };

  if (newImg.is_primary) {
    prod.images?.forEach((img) => {
      img.is_primary = false;
    });
    prod.primary_image = newImg;
  }

  prod.images = [...(prod.images || []), newImg];
  mockDb.saveProducts(products);

  return Promise.resolve({
    id: newImg.id,
    product: prod.id,
    image: null,
    image_url: newImg.image_url,
    alt_text: newImg.alt_text,
    is_primary: newImg.is_primary,
    display_order: newImg.display_order,
  });
}

export async function updateProductImage(
  _accessToken: string,
  slug: string,
  imageId: number,
  payload: ProductImagePayload
): Promise<ProductImage> {
  const products = mockDb.getProducts();
  const prodIndex = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (prodIndex === -1) throw new ApiError(404, 'Product not found');

  const prod = products[prodIndex];
  const imgIndex = prod.images?.findIndex((i) => i.id === imageId) ?? -1;
  if (imgIndex === -1) throw new ApiError(404, 'Image not found');

  const current = prod.images![imgIndex];
  const updated = {
    ...current,
    ...(payload.alt_text !== undefined ? { alt_text: payload.alt_text } : {}),
    ...(payload.is_primary !== undefined ? { is_primary: payload.is_primary } : {}),
    ...(payload.display_order !== undefined ? { display_order: payload.display_order ?? current.display_order } : {}),
  };

  if (updated.is_primary) {
    prod.images?.forEach((img) => {
      if (img.id !== imageId) img.is_primary = false;
    });
    prod.primary_image = updated;
  }

  prod.images![imgIndex] = updated;
  mockDb.saveProducts(products);

  return Promise.resolve({
    id: updated.id,
    product: prod.id,
    image: null,
    image_url: updated.image_url,
    alt_text: updated.alt_text,
    is_primary: updated.is_primary,
    display_order: updated.display_order,
  });
}

export async function deleteProductImage(_accessToken: string, slug: string, imageId: number): Promise<void> {
  const products = mockDb.getProducts();
  const prodIndex = products.findIndex((p) => p.slug === slug || String(p.id) === slug);
  if (prodIndex !== -1) {
    products[prodIndex].images = products[prodIndex].images?.filter((img) => img.id !== imageId);
    if (products[prodIndex].primary_image?.id === imageId) {
      products[prodIndex].primary_image = products[prodIndex].images?.[0] ?? null;
    }
    mockDb.saveProducts(products);
  }
  return Promise.resolve();
}

export async function fetchCategories(_accessToken: string): Promise<Category[]> {
  const cats = mockDb.getCategories();
  return Promise.resolve(
    cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent: null,
      description: c.description,
      is_active: c.is_active,
    }))
  );
}

export async function fetchCategory(_accessToken: string, id: number): Promise<Category> {
  const cats = mockDb.getCategories();
  const c = cats.find((cat) => cat.id === id);
  if (!c) throw new ApiError(404, 'Category not found');
  return Promise.resolve({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent: null,
    description: c.description,
    is_active: c.is_active,
  });
}

export async function createCategory(_accessToken: string, payload: AdminCategoryPayload): Promise<Category> {
  const cats = mockDb.getCategories();
  const newCat = {
    id: Date.now(),
    name: payload.name,
    slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: payload.description || null,
    is_active: payload.is_active,
    children: [],
  };

  mockDb.saveCategories([...cats, newCat]);
  return Promise.resolve({
    id: newCat.id,
    name: newCat.name,
    slug: newCat.slug,
    parent: null,
    description: newCat.description,
    is_active: newCat.is_active,
  });
}

export async function updateCategory(
  _accessToken: string,
  id: number,
  payload: AdminCategoryPayload
): Promise<Category> {
  const cats = mockDb.getCategories();
  const index = cats.findIndex((c) => c.id === id);
  if (index === -1) throw new ApiError(404, 'Category not found');

  const updated = {
    ...cats[index],
    name: payload.name,
    slug: payload.slug || cats[index].slug,
    description: payload.description ?? cats[index].description,
    is_active: payload.is_active,
  };

  cats[index] = updated;
  mockDb.saveCategories(cats);

  return Promise.resolve({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    parent: null,
    description: updated.description,
    is_active: updated.is_active,
  });
}

export async function partialUpdateCategory(
  _accessToken: string,
  id: number,
  payload: Partial<AdminCategoryPayload>
): Promise<Category> {
  return updateCategory(_accessToken, id, payload as AdminCategoryPayload);
}

export async function deleteCategory(_accessToken: string, id: number): Promise<void> {
  const cats = mockDb.getCategories();
  mockDb.saveCategories(cats.filter((c) => c.id !== id));
  return Promise.resolve();
}

export async function fetchUsers(_accessToken: string): Promise<AdminUser[]> {
  return Promise.resolve(mockDb.getUsers());
}

export async function fetchUser(_accessToken: string, id: number): Promise<AdminUser> {
  const users = mockDb.getUsers();
  const u = users.find((usr) => usr.id === id);
  if (!u) throw new ApiError(404, 'User not found');
  return Promise.resolve(u);
}

export async function updateUser(
  _accessToken: string,
  id: number,
  payload: Partial<Pick<AdminUser, 'first_name' | 'last_name' | 'role' | 'is_active' | 'is_staff'>>
): Promise<AdminUser> {
  const users = mockDb.getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new ApiError(404, 'User not found');

  const updated = {
    ...users[index],
    ...payload,
  };

  users[index] = updated;
  mockDb.saveUsers(users);
  return Promise.resolve(updated);
}

export const adminApi = {
  fetchDashboard,
  fetchProducts,
  fetchRecentProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  partialUpdateProduct,
  deleteProduct,
  fetchProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  fetchProductImages,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  partialUpdateCategory,
  deleteCategory,
  fetchUsers,
  fetchUser,
  updateUser,
};
