// API client for KALA backend

const BASE_URL = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('kala_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP Error ${response.status}`);
  }

  return data;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  designCategory?: string;
  description: string;
  price: number;
  salePrice?: number | null;
  badge?: string | null;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  isSoldOut: boolean;
  availableSizes?: string[];
  availableColors?: string[];
  isFeatured: boolean;
  isCustomizable: boolean;
  createdAt: string;
}

export interface Meeting {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  companyName?: string;
  purpose: string;
  date: string;
  time: string;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  adminNotes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN';
  authProvider?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }>;
  subtotal: number;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export const api = {
  // Products
  async getProducts(params: Record<string, any> = {}): Promise<{ count: number; products: Product[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return request(`/products/${encodeURIComponent(id)}`);
  },

  async createProduct(data: Partial<Product>): Promise<{ product: Product; message: string }> {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<{ product: Product; message: string }> {
    return request(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleProductStock(id: string, updates: { isSoldOut?: boolean; inStock?: boolean }): Promise<{ product: Product; message: string }> {
    return request(`/products/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    return request(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Meetings
  async getMeetingSlots(date: string): Promise<{ date: string; slots: Array<{ time: string; isAvailable: boolean }> }> {
    return request(`/meetings/slots?date=${encodeURIComponent(date)}`);
  },

  async bookMeeting(meetingData: Omit<Meeting, 'id' | 'status' | 'createdAt'>): Promise<{ message: string; meeting: Meeting }> {
    return request('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  async getMeetings(params: Record<string, string> = {}): Promise<{ count: number; meetings: Meeting[] }> {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return request(`/meetings${qs}`);
  },

  async updateMeetingStatus(id: string, status: string, adminNotes = ''): Promise<{ message: string; meeting: Meeting }> {
    return request(`/meetings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem('kala_auth_token', res.token);
      localStorage.setItem('kala_user_profile', JSON.stringify(res.user));
    }
    return res;
  },

  async register(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('kala_auth_token', res.token);
      localStorage.setItem('kala_user_profile', JSON.stringify(res.user));
    }
    return res;
  },

  async googleAuth(data: { googleId: string; email: string; name: string; avatar?: string }): Promise<{ user: User; token: string }> {
    const res = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('kala_auth_token', res.token);
      localStorage.setItem('kala_user_profile', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  logout() {
    localStorage.removeItem('kala_auth_token');
    localStorage.removeItem('kala_user_profile');
  },

  // Orders
  async createOrder(orderData: any): Promise<{ order: Order; message: string }> {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(params: Record<string, string> = {}): Promise<{ count: number; orders: Order[] }> {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return request(`/orders${qs}`);
  },

  async updateOrderStatus(id: string, status: string): Promise<{ order: Order }> {
    return request(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Contact
  async submitContact(data: { name: string; email: string; phone?: string; subject?: string; message: string; channel?: string }): Promise<{ message: string }> {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getContacts(): Promise<{ count: number; contacts: any[] }> {
    return request('/contact');
  },
};
