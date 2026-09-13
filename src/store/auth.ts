import { mockDb, DEMO_USER, DEMO_TOKENS } from './mockDb';

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: UserProfile;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export type ProfileUpdatePayload = Partial<
  Pick<UserProfile, 'email' | 'first_name' | 'last_name'>
>;

export interface RefreshTokenPayload {
  refresh: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface ApiErrorPayload {
  detail?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(status: number, data: unknown) {
    const message = typeof data === 'string' ? data : `Authentication error (${status})`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  const users = mockDb.getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

  if (existing) {
    const profile: UserProfile = {
      id: existing.id,
      email: existing.email,
      first_name: existing.first_name,
      last_name: existing.last_name,
      role: existing.role,
      is_active: existing.is_active,
      date_joined: existing.date_joined,
      updated_at: new Date().toISOString(),
    };
    mockDb.saveCurrentUser(profile);
    return Promise.resolve(profile);
  }

  const newUser: UserProfile = {
    id: Date.now(),
    email: payload.email,
    first_name: payload.first_name || 'Client',
    last_name: payload.last_name || 'Member',
    role: 'customer',
    is_active: true,
    date_joined: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockDb.saveUsers([
    ...users,
    {
      ...newUser,
      is_staff: false,
      last_login: new Date().toISOString(),
    },
  ]);
  mockDb.saveCurrentUser(newUser);

  return Promise.resolve(newUser);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const users = mockDb.getUsers();
  const user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

  const userProfile: UserProfile = user
    ? {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        date_joined: user.date_joined,
        updated_at: new Date().toISOString(),
      }
    : {
        id: Date.now(),
        email: payload.email,
        first_name: payload.email.split('@')[0] || 'Client',
        last_name: 'Member',
        role: 'customer',
        is_active: true,
        date_joined: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  mockDb.saveCurrentUser(userProfile);

  return Promise.resolve({
    access: DEMO_TOKENS.access,
    refresh: DEMO_TOKENS.refresh,
    user: userProfile,
  });
}

export async function refreshAuthToken(_payload: RefreshTokenPayload): Promise<AuthTokens> {
  return Promise.resolve(DEMO_TOKENS);
}

export async function fetchUserProfile(_accessToken: string): Promise<UserProfile> {
  const current = mockDb.getCurrentUser();
  return Promise.resolve(current || DEMO_USER);
}

export async function updateUserProfile(_accessToken: string, payload: ProfileUpdatePayload): Promise<UserProfile> {
  const current = mockDb.getCurrentUser() || DEMO_USER;
  const updated: UserProfile = {
    ...current,
    ...payload,
    updated_at: new Date().toISOString(),
  };
  mockDb.saveCurrentUser(updated);
  return Promise.resolve(updated);
}

export async function logoutUser(_accessToken: string, _payload: RefreshTokenPayload): Promise<void> {
  mockDb.saveCurrentUser(null);
  return Promise.resolve();
}

export async function requestPasswordReset(_payload: PasswordResetRequestPayload): Promise<{ detail: string }> {
  return Promise.resolve({ detail: 'Password reset link sent to email (Local Demo).' });
}

export async function confirmPasswordReset(_payload: PasswordResetConfirmPayload): Promise<{ detail: string }> {
  return Promise.resolve({ detail: 'Password has been reset successfully.' });
}

export const authApi = {
  registerUser,
  loginUser,
  refreshAuthToken,
  fetchUserProfile,
  updateUserProfile,
  logoutUser,
  requestPasswordReset,
  confirmPasswordReset,
};
