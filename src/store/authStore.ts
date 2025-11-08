import { useSyncExternalStore } from 'react';
import { ApiError, authApi } from './auth';
import { tokenManager } from './tokenManager';
import type {
  AuthTokens,
  LoginPayload,
  LoginResponse,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  UserProfile,
} from './auth';

type AuthListener = (state: AuthState) => void;

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserProfile | null;
  tokens: AuthTokens | null;
  error: string | null;
}

const USER_STORAGE_KEY = 'appral.auth.user';

function loadPersistedUser(): UserProfile | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }
  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as UserProfile) : null;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function persistUser(user: UserProfile | null): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function createInitialState(): AuthState {
  const tokens = tokenManager.getTokens();
  const user = tokens ? loadPersistedUser() : null;
  return {
    isAuthenticated: Boolean(tokens && user),
    loading: false,
    user,
    tokens,
    error: null,
  };
}

let state: AuthState = createInitialState();
const listeners = new Set<AuthListener>();

function notify(): void {
  listeners.forEach((listener) => listener(state));
}

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch };
  notify();
}

function persistSession(tokens: AuthTokens | null, user: UserProfile | null): void {
  tokenManager.setTokens(tokens);
  persistUser(tokens ? user : null);
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

async function restoreSession(): Promise<void> {
  const tokens = tokenManager.getTokens();
  if (!tokens) {
    return;
  }

  setState({ loading: true, error: null });
  try {
    const profile = await authApi.fetchUserProfile(tokens.access);
    state = {
      isAuthenticated: true,
      loading: false,
      user: profile,
      tokens,
      error: null,
    };
    persistSession(tokens, profile);
  } catch (error) {
    persistSession(null, null);
    state = {
      ...createInitialState(),
      loading: false,
      error: extractErrorMessage(error),
    };
  } finally {
    notify();
  }
}

void restoreSession();

async function handleAuthSuccess(response: LoginResponse | UserProfile, tokens?: AuthTokens): Promise<void> {
  const resolvedTokens = tokens ?? ('access' in response && 'refresh' in response ? response : null);
  const userProfile: UserProfile = 'user' in response ? response.user : (response as UserProfile);
  const finalTokens = resolvedTokens ?? null;

  persistSession(finalTokens, userProfile);
  setState({
    isAuthenticated: Boolean(finalTokens),
    loading: false,
    user: userProfile,
    tokens: finalTokens,
    error: null,
  });
}

function startLoading(): void {
  setState({ loading: true, error: null });
}

export const authStore = {
  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): AuthState {
    return state;
  },

  async register(payload: RegisterPayload): Promise<void> {
    startLoading();
    try {
      const user = await authApi.registerUser(payload);
      setState({ user, loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async login(payload: LoginPayload): Promise<void> {
    startLoading();
    try {
      const response = await authApi.loginUser(payload);
      await handleAuthSuccess(response, { access: response.access, refresh: response.refresh });
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async refresh(): Promise<void> {
    const currentTokens = state.tokens;
    if (!currentTokens?.refresh) {
      throw new Error('No refresh token available');
    }
    startLoading();
    try {
      const tokens = await authApi.refreshAuthToken({ refresh: currentTokens.refresh });
      setState({
        tokens,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
      persistSession(tokens, state.user);
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      persistSession(null, null);
      throw error;
    }
  },

  async fetchProfile(): Promise<void> {
    const accessToken = state.tokens?.access;
    if (!accessToken) {
      throw new Error('Not authenticated');
    }
    startLoading();
    try {
      const profile = await authApi.fetchUserProfile(accessToken);
      setState({ loading: false, user: profile, isAuthenticated: true, error: null });
      persistSession(state.tokens, profile);
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<void> {
    const accessToken = state.tokens?.access;
    if (!accessToken) {
      throw new Error('Not authenticated');
    }
    startLoading();
    try {
      const profile = await authApi.updateUserProfile(accessToken, payload);
      setState({ loading: false, user: profile, error: null });
      persistSession(state.tokens, profile);
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async logout(): Promise<void> {
    const tokens = state.tokens;
    if (!tokens) {
      setState({ ...createInitialState(), loading: false });
      persistSession(null, null);
      return;
    }
    startLoading();
    try {
      await authApi.logoutUser(tokens.access, { refresh: tokens.refresh });
    } finally {
      persistSession(null, null);
      state = { ...createInitialState(), loading: false };
      notify();
    }
  },

  async requestPasswordReset(payload: PasswordResetRequestPayload): Promise<void> {
    startLoading();
    try {
      await authApi.requestPasswordReset(payload);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<void> {
    startLoading();
    try {
      await authApi.confirmPasswordReset(payload);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },
};

export type AuthStore = typeof authStore;

export function useAuthStore<Selector = AuthState>(
  selector: (state: AuthState) => Selector = (state) => state as unknown as Selector,
): Selector {
  return useSyncExternalStore(
    (notify) =>
      authStore.subscribe(() => {
        notify();
      }),
    () => selector(authStore.getState()),
    () => selector(createInitialState()),
  );
}

tokenManager.subscribe((tokens) => {
  state = {
    ...state,
    tokens,
  };
  if (!tokens) {
    state = {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  notify();
});

