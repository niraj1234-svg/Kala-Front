import type { AuthTokens } from './auth';

type TokenListener = (tokens: AuthTokens | null) => void;

const TOKEN_STORAGE_KEY = 'appral.auth.tokens';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readTokensFromStorage(): AuthTokens | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

function writeTokensToStorage(tokens: AuthTokens | null): void {
  if (!isBrowser()) {
    return;
  }
  if (tokens) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

let currentTokens: AuthTokens | null = readTokensFromStorage();
const listeners = new Set<TokenListener>();

function notify(): void {
  listeners.forEach((listener) => listener(currentTokens));
}

export const tokenManager = {
  getTokens(): AuthTokens | null {
    return currentTokens;
  },

  getAccessToken(): string | null {
    return currentTokens?.access ?? null;
  },

  getRefreshToken(): string | null {
    return currentTokens?.refresh ?? null;
  },

  setTokens(tokens: AuthTokens | null): void {
    currentTokens = tokens;
    writeTokensToStorage(tokens);
    notify();
  },

  clearTokens(): void {
    this.setTokens(null);
  },

  subscribe(listener: TokenListener): () => void {
    listeners.add(listener);
    listener(currentTokens);
    return () => listeners.delete(listener);
  }
};
