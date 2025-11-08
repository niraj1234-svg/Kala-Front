import { useSyncExternalStore } from 'react';
import { ApiError, adminApi } from './admin';
import { tokenManager } from './tokenManager';
import type {
  AdminCategoryPayload,
  AdminDashboardSummary,
  AdminProductPayload,
  AdminProductQuery,
  AdminUser,
  Category,
  ProductDetail,
  ProductImage,
  ProductImagePayload,
  ProductListItem,
  ProductVariant,
} from './admin';

type Listener<T> = (state: T) => void;

interface AsyncSlice<T> {
  loading: boolean;
  error: string | null;
  data: T;
}

interface ProductCollectionSlice extends AsyncSlice<ProductListItem[]> {
  query: AdminProductQuery | null;
}

interface ProductDetailSlice extends AsyncSlice<ProductDetail | null> {
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface AdminState {
  dashboard: AsyncSlice<AdminDashboardSummary | null>;
  products: ProductCollectionSlice;
  productDetail: ProductDetailSlice;
  categories: AsyncSlice<Category[]>;
  users: AsyncSlice<AdminUser[]>;
  selectedUser: AsyncSlice<AdminUser | null>;
}

const asyncSlice = <T>(data: T): AsyncSlice<T> => ({
  loading: false,
  error: null,
  data,
});

const initialState: AdminState = {
  dashboard: asyncSlice<AdminDashboardSummary | null>(null),
  products: { ...asyncSlice<ProductListItem[]>([]), query: null },
  productDetail: { ...asyncSlice<ProductDetail | null>(null), variants: [], images: [] },
  categories: asyncSlice<Category[]>([]),
  users: asyncSlice<AdminUser[]>([]),
  selectedUser: asyncSlice<AdminUser | null>(null),
};

let state: AdminState = structuredClone(initialState);
const listeners = new Set<Listener<AdminState>>();

function notify(): void {
  listeners.forEach((listener) => listener(state));
}

function setState(patch: Partial<AdminState>): void {
  state = { ...state, ...patch };
  notify();
}

function ensureToken(): string {
  const token = tokenManager.getAccessToken();
  if (!token) {
    throw new Error('Admin authentication required');
  }
  return token;
}

function startLoading<K extends keyof AdminState>(key: K): void {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    setState({
      [key]: {
        ...slice,
        loading: true,
        error: null,
      },
    } as Partial<AdminState>);
  }
}

function handleSuccess<K extends keyof AdminState>(key: K, data: AdminState[K]['data']): void {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    const base = {
      ...slice,
      loading: false,
      error: null,
      data,
    };
    setState({ [key]: base } as Partial<AdminState>);
  }
}

function handleError<K extends keyof AdminState>(key: K, error: unknown): void {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    setState({
      [key]: {
        ...slice,
        loading: false,
        error: extractError(error),
      },
    } as Partial<AdminState>);
  }
}

function extractError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error occurred.';
}

export const adminStore = {
  subscribe(listener: Listener<AdminState>): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): AdminState {
    return state;
  },

  reset(): void {
    state = structuredClone(initialState);
    notify();
  },

  async loadDashboard(): Promise<void> {
    startLoading('dashboard');
    try {
      const data = await adminApi.fetchDashboard(ensureToken());
      handleSuccess('dashboard', data);
    } catch (error) {
      handleError('dashboard', error);
      throw error;
    }
  },

  async loadProducts(query?: AdminProductQuery): Promise<void> {
    startLoading('products');
    try {
      const products = await adminApi.fetchProducts(ensureToken(), query);
      const slice = state.products;
      setState({
        products: {
          ...slice,
          loading: false,
          error: null,
          data: products,
          query: query ?? null,
        },
      });
    } catch (error) {
      handleError('products', error);
      throw error;
    }
  },

  async refreshRecentProducts(): Promise<void> {
    try {
      const recent = await adminApi.fetchRecentProducts(ensureToken());
      const slice = state.dashboard;
      if (slice.data) {
        handleSuccess('dashboard', { ...slice.data, recent_products: recent });
      }
    } catch (error) {
      handleError('dashboard', error);
      throw error;
    }
  },

  async loadProductDetail(slug: string): Promise<void> {
    startLoading('productDetail');
    try {
      const token = ensureToken();
      const [product, variants, images] = await Promise.all([
        adminApi.fetchProduct(token, slug),
        adminApi.fetchProductVariants(token, slug),
        adminApi.fetchProductImages(token, slug),
      ]);
      setState({
        productDetail: {
          loading: false,
          error: null,
          data: product,
          variants,
          images,
        },
      });
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async createProduct(payload: AdminProductPayload): Promise<ProductDetail> {
    startLoading('productDetail');
    try {
      const product = await adminApi.createProduct(ensureToken(), payload);
      handleSuccess('productDetail', product);
      return product;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async updateProduct(slug: string, payload: Partial<AdminProductPayload>): Promise<ProductDetail> {
    startLoading('productDetail');
    try {
      const product = await adminApi.partialUpdateProduct(ensureToken(), slug, payload);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: product,
        },
      });
      return product;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async deleteProduct(slug: string): Promise<void> {
    startLoading('productDetail');
    try {
      await adminApi.deleteProduct(ensureToken(), slug);
      handleSuccess('productDetail', null);
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async createVariant(slug: string, payload: Omit<ProductVariant, 'id' | 'product'>): Promise<ProductVariant> {
    startLoading('productDetail');
    try {
      const variant = await adminApi.createProductVariant(ensureToken(), slug, payload);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: [...slice.variants, variant],
          images: slice.images,
        },
      });
      return variant;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async updateVariant(
    slug: string,
    variantId: number,
    payload: Partial<Omit<ProductVariant, 'id' | 'product'>>,
  ): Promise<ProductVariant> {
    startLoading('productDetail');
    try {
      const variant = await adminApi.updateProductVariant(ensureToken(), slug, variantId, payload);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: slice.variants.map((item) => (item.id === variantId ? variant : item)),
          images: slice.images,
        },
      });
      return variant;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async deleteVariant(slug: string, variantId: number): Promise<void> {
    startLoading('productDetail');
    try {
      await adminApi.deleteProductVariant(ensureToken(), slug, variantId);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: slice.variants.filter((item) => item.id !== variantId),
          images: slice.images,
        },
      });
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async createImage(slug: string, payload: ProductImagePayload): Promise<ProductImage> {
    startLoading('productDetail');
    try {
      const image = await adminApi.createProductImage(ensureToken(), slug, payload);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: slice.variants,
          images: [...slice.images, image],
        },
      });
      return image;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async updateImage(slug: string, imageId: number, payload: ProductImagePayload): Promise<ProductImage> {
    startLoading('productDetail');
    try {
      const image = await adminApi.updateProductImage(ensureToken(), slug, imageId, payload);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: slice.variants,
          images: slice.images.map((item) => (item.id === imageId ? image : item)),
        },
      });
      return image;
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async deleteImage(slug: string, imageId: number): Promise<void> {
    startLoading('productDetail');
    try {
      await adminApi.deleteProductImage(ensureToken(), slug, imageId);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants: slice.variants,
          images: slice.images.filter((item) => item.id !== imageId),
        },
      });
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async loadCategories(): Promise<void> {
    startLoading('categories');
    try {
      const categories = await adminApi.fetchCategories(ensureToken());
      handleSuccess('categories', categories);
    } catch (error) {
      handleError('categories', error);
      throw error;
    }
  },

  async createCategory(payload: AdminCategoryPayload): Promise<Category> {
    startLoading('categories');
    try {
      const category = await adminApi.createCategory(ensureToken(), payload);
      const slice = state.categories;
      handleSuccess('categories', [...slice.data, category]);
      return category;
    } catch (error) {
      handleError('categories', error);
      throw error;
    }
  },

  async updateCategory(id: number, payload: Partial<AdminCategoryPayload>): Promise<Category> {
    startLoading('categories');
    try {
      const category = await adminApi.partialUpdateCategory(ensureToken(), id, payload);
      const slice = state.categories;
      handleSuccess(
        'categories',
        slice.data.map((item) => (item.id === id ? category : item)),
      );
      return category;
    } catch (error) {
      handleError('categories', error);
      throw error;
    }
  },

  async deleteCategory(id: number): Promise<void> {
    startLoading('categories');
    try {
      await adminApi.deleteCategory(ensureToken(), id);
      const slice = state.categories;
      handleSuccess(
        'categories',
        slice.data.filter((item) => item.id !== id),
      );
    } catch (error) {
      handleError('categories', error);
      throw error;
    }
  },

  async loadUsers(): Promise<void> {
    startLoading('users');
    try {
      const users = await adminApi.fetchUsers(ensureToken());
      handleSuccess('users', users);
    } catch (error) {
      handleError('users', error);
      throw error;
    }
  },

  async loadUser(id: number): Promise<void> {
    startLoading('selectedUser');
    try {
      const user = await adminApi.fetchUser(ensureToken(), id);
      handleSuccess('selectedUser', user);
    } catch (error) {
      handleError('selectedUser', error);
      throw error;
    }
  },

  async updateUser(id: number, payload: Partial<AdminUser>): Promise<AdminUser> {
    startLoading('selectedUser');
    try {
      const user = await adminApi.updateUser(ensureToken(), id, payload);
      const usersSlice = state.users;
      handleSuccess(
        'users',
        usersSlice.data.map((item) => (item.id === id ? user : item)),
      );
      handleSuccess('selectedUser', user);
      return user;
    } catch (error) {
      handleError('selectedUser', error);
      throw error;
    }
  },
};

export type AdminStore = typeof adminStore;

export function useAdminStore<Selector = AdminState>(
  selector: (state: AdminState) => Selector = (state) => state as unknown as Selector,
): Selector {
  return useSyncExternalStore(
    (notify) =>
      adminStore.subscribe(() => {
        notify();
      }),
    () => selector(adminStore.getState()),
    () => selector(structuredClone(initialState)),
  );
}

