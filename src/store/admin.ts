const API_BASE_URL = 'https://api.dddgroup.in/api/admin';

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
    if (typeof data === 'object' && data !== null) {
      if ('detail' in data && typeof (data as ApiErrorPayload).detail === 'string') {
        return (data as ApiErrorPayload).detail;
      }
      return ApiError.pickFirstMessage(data as Record<string, unknown>);
    }
    return undefined;
  }

  private static pickFirstMessage(payload: Record<string, unknown>): string | undefined {
    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.trim()) {
            return item;
          }
        }
      } else if (typeof value === 'string' && value.trim()) {
        return value;
      } else if (value && typeof value === 'object') {
        const nested = ApiError.pickFirstMessage(value as Record<string, unknown>);
        if (nested) {
          return nested;
        }
      }
    }
    return undefined;
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
      value.forEach((item) => params.append(key, String(item)));
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

  let bodyToSend: BodyInit | undefined;
  if (body instanceof FormData) {
    bodyToSend = body;
    delete finalHeaders['Content-Type'];
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    bodyToSend = JSON.stringify(body);
  }

  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: bodyToSend,
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
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      payload: payload
    });
    throw new ApiError(response.status, payload);
  }

  return (isJson ? payload : undefined) as T;
}

export async function fetchDashboard(accessToken: string): Promise<AdminDashboardSummary> {
  return request<AdminDashboardSummary>('/dashboard/', {
    accessToken,
  });
}

export async function fetchProducts(accessToken: string, query?: AdminProductQuery): Promise<ProductListItem[]> {
  return request<ProductListItem[]>('/products/', {
    accessToken,
    query: {
      search: query?.search,
      ordering: query?.ordering,
      page: query?.page,
      page_size: query?.page_size,
    },
  });
}

export async function fetchRecentProducts(accessToken: string): Promise<ProductListItem[]> {
  return request<ProductListItem[]>('/products/recent/', {
    accessToken,
  });
}

export async function fetchProduct(accessToken: string, slug: string): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${slug}/`, {
    accessToken,
  });
}

export async function createProduct(accessToken: string, payload: AdminProductPayload): Promise<ProductDetail> {
  return request<ProductDetail>('/products/', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function updateProduct(accessToken: string, slug: string, payload: AdminProductPayload): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${slug}/`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}

export async function partialUpdateProduct(
  accessToken: string,
  slug: string,
  payload: Partial<AdminProductPayload>,
): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${slug}/`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}

export async function deleteProduct(accessToken: string, slug: string): Promise<void> {
  await request<void>(`/products/${slug}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function createProductVariant(
  accessToken: string,
  slug: string,
  payload: Omit<ProductVariant, 'id'>,
): Promise<ProductVariant> {
  return request<ProductVariant>(`/products/${slug}/variants/`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function updateProductVariant(
  accessToken: string,
  slug: string,
  variantId: number,
  payload: Partial<Omit<ProductVariant, 'id'>>,
): Promise<ProductVariant> {
  return request<ProductVariant>(`/products/${slug}/variants/${variantId}/`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}

export async function deleteProductVariant(accessToken: string, slug: string, variantId: number): Promise<void> {
  await request<void>(`/products/${slug}/variants/${variantId}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export interface ProductImagePayload {
  image?: File | Blob | null;
  image_url?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number | null;
}

function buildImageBody(payload: ProductImagePayload): FormData | Record<string, unknown> {
  if (payload.image instanceof File || payload.image instanceof Blob) {
    const formData = new FormData();
    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.image_url !== undefined) {
      formData.append('image_url', payload.image_url ?? '');
    }
    if (payload.alt_text !== undefined) {
      formData.append('alt_text', payload.alt_text ?? '');
    }
    if (payload.is_primary !== undefined) {
      formData.append('is_primary', String(payload.is_primary));
    }
    if (payload.display_order !== undefined && payload.display_order !== null) {
      formData.append('display_order', String(payload.display_order));
    }
    return formData;
  }

  return {
    image_url: payload.image_url ?? null,
    alt_text: payload.alt_text ?? null,
    is_primary: payload.is_primary,
    display_order: payload.display_order,
  };
}

export async function createProductImage(
  accessToken: string,
  slug: string,
  payload: ProductImagePayload,
): Promise<ProductImage> {
  return request<ProductImage>(`/products/${slug}/images/`, {
    method: 'POST',
    accessToken,
    body: buildImageBody(payload),
  });
}

export async function updateProductImage(
  accessToken: string,
  slug: string,
  imageId: number,
  payload: ProductImagePayload,
): Promise<ProductImage> {
  return request<ProductImage>(`/products/${slug}/images/${imageId}/`, {
    method: 'PATCH',
    accessToken,
    body: buildImageBody(payload),
  });
}

export async function deleteProductImage(accessToken: string, slug: string, imageId: number): Promise<void> {
  await request<void>(`/products/${slug}/images/${imageId}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function fetchCategories(accessToken: string): Promise<Category[]> {
  return request<Category[]>('/categories/', {
    accessToken,
  });
}

export async function fetchCategory(accessToken: string, id: number): Promise<Category> {
  return request<Category>(`/categories/${id}/`, {
    accessToken,
  });
}

export async function createCategory(accessToken: string, payload: AdminCategoryPayload): Promise<Category> {
  return request<Category>('/categories/', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function updateCategory(accessToken: string, id: number, payload: AdminCategoryPayload): Promise<Category> {
  return request<Category>(`/categories/${id}/`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}

export async function partialUpdateCategory(
  accessToken: string,
  id: number,
  payload: Partial<AdminCategoryPayload>,
): Promise<Category> {
  return request<Category>(`/categories/${id}/`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}

export async function deleteCategory(accessToken: string, id: number): Promise<void> {
  await request<void>(`/categories/${id}/`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function fetchUsers(accessToken: string): Promise<AdminUser[]> {
  return request<AdminUser[]>('/users/', {
    accessToken,
  });
}

export async function fetchUser(accessToken: string, id: number): Promise<AdminUser> {
  return request<AdminUser>(`/users/${id}/`, {
    accessToken,
  });
}

export async function updateUser(
  accessToken: string,
  id: number,
  payload: Partial<Pick<AdminUser, 'first_name' | 'last_name' | 'role' | 'is_active' | 'is_staff'>>,
): Promise<AdminUser> {
  return request<AdminUser>(`/users/${id}/`, {
    method: 'PATCH',
    accessToken,
    body: payload,
  });
}

export async function fetchProductVariants(accessToken: string, slug: string): Promise<ProductVariant[]> {
  return request<ProductVariant[]>(`/products/${slug}/variants/`, {
    accessToken,
  });
}

export async function fetchProductImages(accessToken: string, slug: string): Promise<ProductImage[]> {
  return request<ProductImage[]>(`/products/${slug}/images/`, {
    accessToken,
  });
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
