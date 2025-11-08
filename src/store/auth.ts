const API_BASE_URL = 'https://api.dddgroup.in/api/auth';

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
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, headers } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

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

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  return request<UserProfile>('/register/', {
    method: 'POST',
    body: payload,
  });
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>('/login/', {
    method: 'POST',
    body: payload,
  });
}

export async function refreshAuthToken(payload: RefreshTokenPayload): Promise<AuthTokens> {
  return request<AuthTokens>('/token/refresh/', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  return request<UserProfile>('/profile/', {
    method: 'GET',
    accessToken,
  });
}

export async function updateUserProfile(accessToken: string, payload: ProfileUpdatePayload): Promise<UserProfile> {
  return request<UserProfile>('/profile/', {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}

export async function logoutUser(accessToken: string, payload: RefreshTokenPayload): Promise<void> {
  await request<void>('/logout/', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

export async function requestPasswordReset(payload: PasswordResetRequestPayload): Promise<{ detail: string }> {
  return request<{ detail: string }>('/password-reset/', {
    method: 'POST',
    body: payload,
  });
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<{ detail: string }> {
  return request<{ detail: string }>('/password-reset/confirm/', {
    method: 'POST',
    body: payload,
  });
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
