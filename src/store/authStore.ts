import { useSyncExternalStore } from 'react';
import { ApiError, authApi } from './auth';
import { tokenManager, DEFAULT_MOCK_TOKENS } from './tokenManager';
import { DEMO_USER } from './mockDb';
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
    return DEMO_USER;
  }
  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as UserProfile) : DEMO_USER;
  } catch {
    return DEMO_USER;
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
  const tokens = tokenManager.getTokens() || DEFAULT_MOCK_TOKENS;
  const user = loadPersistedUser() || DEMO_USER;
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
  const tokens = tokenManager.getTokens() || DEFAULT_MOCK_TOKENS;
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
  const resolvedTokens = tokens ?? ('access' in response && 'refresh' in response ? response : DEFAULT_MOCK_TOKENS);
  const userProfile: UserProfile = 'user' in response ? response.user : (response as UserProfile);
  const finalTokens = resolvedTokens ?? DEFAULT_MOCK_TOKENS;

  persistSession(finalTokens, userProfile);
  setState({
    isAuthenticated: true,
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
      setState({ user, loading: false, error: null, isAuthenticated: true, tokens: DEFAULT_MOCK_TOKENS });
      persistSession(DEFAULT_MOCK_TOKENS, user);
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
    const currentTokens = state.tokens || DEFAULT_MOCK_TOKENS;
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
      throw error;
    }
  },

  async fetchProfile(): Promise<void> {
    const accessToken = state.tokens?.access || DEFAULT_MOCK_TOKENS.access;
    startLoading();
    try {
      const profile = await authApi.fetchUserProfile(accessToken);
      setState({ loading: false, user: profile, isAuthenticated: true, error: null });
      persistSession(state.tokens || DEFAULT_MOCK_TOKENS, profile);
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<void> {
    const accessToken = state.tokens?.access || DEFAULT_MOCK_TOKENS.access;
    startLoading();
    try {
      const profile = await authApi.updateUserProfile(accessToken, payload);
      setState({ loading: false, user: profile, error: null });
      persistSession(state.tokens || DEFAULT_MOCK_TOKENS, profile);
    } catch (error) {
      setState({ loading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  async logout(): Promise<void> {
    setState({
      isAuthenticated: false,
      loading: false,
      user: null,
      tokens: null,
      error: null,
    });
    persistSession(null, null);
    notify();
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
  if (tokens) {
    state = {
      ...state,
      tokens,
      isAuthenticated: true,
    };
  }
  notify();
});
