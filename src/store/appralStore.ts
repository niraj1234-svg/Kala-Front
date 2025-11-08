import { useSyncExternalStore } from 'react';
import { ApiError, appralApi } from './appral';
import { tokenManager } from './tokenManager';
import type {
  Cart,
  CartAddItemPayload,
  CartUpdateItemPayload,
  Category,
  ProductDetail,
  ProductListItem,
  ProductListQuery,
  ProductVariant,
  RecentlyViewedItem,
  WishlistItem,
  WishlistMutationPayload,
} from './appral';

type StoreListener<T> = (state: T) => void;

interface AsyncState<TData> {
  loading: boolean;
  error: string | null;
  data: TData;
}

interface ProductDetailState extends AsyncState<ProductDetail | null> {
  variants: ProductVariant[];
}

export interface AppralState {
  categories: AsyncState<Category[]>;
  products: AsyncState<ProductListItem[]> & { query: ProductListQuery | null };
  productDetail: ProductDetailState;
  wishlist: AsyncState<WishlistItem[]>;
  cart: AsyncState<Cart | null>;
  recentlyViewed: AsyncState<RecentlyViewedItem[]>;
}

const initialAsyncState = <TData>(data: TData): AsyncState<TData> => ({
  loading: false,
  error: null,
  data,
});

const initialState: AppralState = {
  categories: initialAsyncState<Category[]>([]),
  products: { ...initialAsyncState<ProductListItem[]>([]), query: null },
  productDetail: { ...initialAsyncState<ProductDetail | null>(null), variants: [] },
  wishlist: initialAsyncState<WishlistItem[]>([]),
  cart: initialAsyncState<Cart | null>(null),
  recentlyViewed: initialAsyncState<RecentlyViewedItem[]>([]),
};

let state: AppralState = structuredClone(initialState);
const listeners = new Set<StoreListener<AppralState>>();

function notify(): void {
  listeners.forEach((listener) => listener(state));
}

function setState(patch: Partial<AppralState>): void {
  state = { ...state, ...patch };
  notify();
}

function startLoading<K extends keyof AppralState>(key: K): void {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    setState({
      [key]: {
        ...slice,
        loading: true,
        error: null,
      },
    } as Partial<AppralState>);
  }
}

function handleSuccess<K extends keyof AppralState, TData extends AppralState[K]['data']>(
  key: K,
  data: TData,
) {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    const extraProps: Record<string, unknown> = {};
    if (key === 'products' && typeof slice === 'object' && 'query' in slice) {
      extraProps.query = (slice as AppralState['products']).query;
    }
    if (key === 'productDetail' && typeof slice === 'object' && 'variants' in slice) {
      extraProps.variants = (slice as ProductDetailState).variants;
    }
    setState({
      [key]: {
        ...slice,
        loading: false,
        error: null,
        data,
        ...extraProps,
      },
    } as Partial<AppralState>);
  }
}

function handleError<K extends keyof AppralState>(key: K, error: unknown): void {
  const slice = state[key];
  if (slice && typeof slice === 'object' && 'loading' in slice) {
    const message = extractErrorMessage(error);
    setState({
      [key]: {
        ...slice,
        loading: false,
        error: message,
      },
    } as Partial<AppralState>);
  }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again later.';
}

export const appralStore = {
  subscribe(listener: StoreListener<AppralState>): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): AppralState {
    return state;
  },

  async fetchCategories(): Promise<void> {
    startLoading('categories');
    try {
      const categories = await appralApi.fetchCategories();
      handleSuccess('categories', categories);
    } catch (error) {
      handleError('categories', error);
      throw error;
    }
  },

  async fetchProducts(query?: ProductListQuery): Promise<void> {
    startLoading('products');
    try {
      const products = await appralApi.fetchProducts(query);
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

  async fetchProductDetail(slug: string): Promise<void> {
    startLoading('productDetail');
    try {
      const product = await appralApi.fetchProductDetail(slug);
      const variants = await appralApi.fetchProductVariants(slug);
      const slice = state.productDetail;
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: product,
          variants,
        },
      });
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async refreshProductVariants(slug: string): Promise<void> {
    const slice = state.productDetail;
    setState({
      productDetail: {
        ...slice,
        loading: true,
        error: null,
      },
    });
    try {
      const variants = await appralApi.fetchProductVariants(slug);
      setState({
        productDetail: {
          ...slice,
          loading: false,
          error: null,
          data: slice.data,
          variants,
        },
      });
    } catch (error) {
      handleError('productDetail', error);
      throw error;
    }
  },

  async fetchWishlist(): Promise<void> {
    ensureAuthenticated();
    startLoading('wishlist');
    try {
      const wishlist = await appralApi.fetchWishlist(getAccessTokenOrThrow());
      handleSuccess('wishlist', wishlist);
    } catch (error) {
      handleError('wishlist', error);
      throw error;
    }
  },

  async addToWishlist(payload: WishlistMutationPayload): Promise<void> {
    ensureAuthenticated();
    startLoading('wishlist');
    try {
      const item = await appralApi.addToWishlist(getAccessTokenOrThrow(), payload);
      const current = state.wishlist.data;
      handleSuccess('wishlist', [...current.filter((existing) => existing.id !== item.id), item]);
    } catch (error) {
      handleError('wishlist', error);
      throw error;
    }
  },

  async removeFromWishlist(id: number): Promise<void> {
    ensureAuthenticated();
    startLoading('wishlist');
    try {
      await appralApi.removeFromWishlist(getAccessTokenOrThrow(), id);
      const current = state.wishlist.data.filter((item) => item.id !== id);
      handleSuccess('wishlist', current);
    } catch (error) {
      handleError('wishlist', error);
      throw error;
    }
  },

  async fetchCart(): Promise<void> {
    ensureAuthenticated();
    startLoading('cart');
    try {
      const cart = await appralApi.fetchCart(getAccessTokenOrThrow());
      handleSuccess('cart', cart);
    } catch (error) {
      handleError('cart', error);
      throw error;
    }
  },

  async addCartItem(payload: CartAddItemPayload): Promise<void> {
    ensureAuthenticated();
    startLoading('cart');
    try {
      const cart = await appralApi.addCartItem(getAccessTokenOrThrow(), payload);
      handleSuccess('cart', cart);
    } catch (error) {
      handleError('cart', error);
      throw error;
    }
  },

  async updateCartItem(itemId: number, payload: CartUpdateItemPayload): Promise<void> {
    ensureAuthenticated();
    startLoading('cart');
    try {
      const cart = await appralApi.updateCartItem(getAccessTokenOrThrow(), itemId, payload);
      handleSuccess('cart', cart);
    } catch (error) {
      handleError('cart', error);
      throw error;
    }
  },

  async removeCartItem(itemId: number): Promise<void> {
    ensureAuthenticated();
    startLoading('cart');
    try {
      const cart = await appralApi.removeCartItem(getAccessTokenOrThrow(), itemId);
      handleSuccess('cart', cart);
    } catch (error) {
      handleError('cart', error);
      throw error;
    }
  },

  async fetchRecentlyViewed(): Promise<void> {
    ensureAuthenticated();
    startLoading('recentlyViewed');
    try {
      const items = await appralApi.fetchRecentlyViewed(getAccessTokenOrThrow());
      handleSuccess('recentlyViewed', items);
    } catch (error) {
      handleError('recentlyViewed', error);
      throw error;
    }
  },

  reset(): void {
    state = structuredClone(initialState);
    notify();
  },
};

function getAccessTokenOrThrow(): string {
  const token = tokenManager.getAccessToken();
  if (!token) {
    throw new Error('Access token is required');
  }
  return token;
}

function ensureAuthenticated(): void {
  if (!tokenManager.getAccessToken()) {
    throw new Error('Authentication required');
  }
}

export type AppralStore = typeof appralStore;

export function useAppralStore<Selector = AppralState>(
  selector: (state: AppralState) => Selector = (state) => state as unknown as Selector,
): Selector {
  return useSyncExternalStore(
    (notify) =>
      appralStore.subscribe(() => {
        notify();
      }),
    () => selector(appralStore.getState()),
    () => selector(structuredClone(initialState)),
  );
}

