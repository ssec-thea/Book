/**
 * 前端 API 客户端
 * 封装所有与后端 API 的通信，自动处理 JWT Token
 */

const BASE_URL = '/api';

interface ApiResponse<T> {
  code: number;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
}

/**
 * 通用请求函数
 */
async function request<T>(
  path: string,
  options?: RequestInit,
  isFormData = false
): Promise<T> {
  const token = localStorage.getItem('bv_token');
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('bv_token');
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ══════════════════════════════════════
// API 方法
// ══════════════════════════════════════

export const api = {
  // ── Auth ────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      request<ApiResponse<any>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (data: {
      username: string;
      email: string;
      password: string;
      avatar?: string;
      bio?: string;
    }) =>
      request<ApiResponse<any>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => request<ApiResponse<any>>('/auth/me'),

    updateProfile: (data: { username?: string; avatar?: string; bio?: string }) =>
      request<ApiResponse<any>>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // ── Books ───────────────────────────
  books: {
    list: (params?: { page?: number; size?: number; keyword?: string; category?: string }) => {
      const qs = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
      return request<ApiResponse<any>>(`/books?${qs.toString()}`);
    },

    getPublic: (params?: { page?: number; size?: number; keyword?: string; category?: string }) => {
      const qs = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
      return request<ApiResponse<any>>(`/books/public?${qs.toString()}`);
    },

    get: (id: number) => request<ApiResponse<any>>(`/books/${id}`),

    create: (data: any) =>
      request<ApiResponse<any>>('/books', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      request<ApiResponse<any>>(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      request<ApiResponse<any>>(`/books/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Reading ─────────────────────────
  reading: {
    getRecords: (bookId: number) =>
      request<ApiResponse<any>>(`/reading/${bookId}`),

    saveProgress: (data: {
      book_id: number;
      current_page?: number;
      progress?: number;
      duration?: number;
    }) =>
      request<ApiResponse<any>>('/reading', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Bookmarks ───────────────────────
  bookmarks: {
    list: (bookId?: number) => {
      const qs = bookId ? `?bookId=${bookId}` : '';
      return request<ApiResponse<any>>(`/bookmarks${qs}`);
    },

    create: (data: {
      book_id: number;
      position: number;
      chapter_title?: string;
      note?: string;
      text_snippet?: string;
    }) =>
      request<ApiResponse<any>>('/bookmarks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      request<ApiResponse<any>>(`/bookmarks/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Reviews ─────────────────────────
  reviews: {
    list: (params?: { bookId?: number; userId?: number; visibility?: number; page?: number; size?: number }) => {
      const qs = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
      return request<ApiResponse<any>>(`/reviews?${qs.toString()}`);
    },

    create: (data: {
      book_id: number;
      title: string;
      content: string;
      score: number;
      longitude?: number;
      latitude?: number;
      location_name?: string;
      visibility?: number;
    }) =>
      request<ApiResponse<any>>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      request<ApiResponse<any>>(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      request<ApiResponse<any>>(`/reviews/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Map ─────────────────────────────
  map: {
    myBooks: () => request<ApiResponse<any>>('/map/my-books'),

    sameBook: (bookId: number) =>
      request<ApiResponse<any>>(`/map/same-book/${bookId}`),

    publicReviews: (params?: { bookId?: string; author?: string; score?: string }) => {
      const qs = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
      return request<ApiResponse<any>>(`/map/public-reviews?${qs.toString()}`);
    },
  },
};
