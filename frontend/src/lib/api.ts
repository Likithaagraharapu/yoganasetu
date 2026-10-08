import {
  Scheme,
  SearchRequest,
  SearchResponse,
  ChatRequest,
  ChatResponse,
  EligibilityProfile,
  EligibilityResponse,
  StatsResponse,
  BookmarkItem,
  DatabaseStats,
  User,
  AuthResponse,
  SignupData,
  LoginData,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('ys_auth_token');
    } catch {
      // ignore
    }
  }

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMsg = `API error ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson && errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// -------------------------------------------------------------
// Live API functions
// -------------------------------------------------------------

export async function getSchemes(params?: {
  category?: string;
  target_group?: string;
  query?: string;
  limit?: number;
}): Promise<Scheme[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.set('category', params.category);
  if (params?.target_group) queryParams.set('target_group', params.target_group);
  if (params?.query) queryParams.set('query', params.query);
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/schemes?${queryParams.toString()}`;
  return fetchWithTimeout<Scheme[]>(url);
}

export async function getSchemeById(id: string): Promise<Scheme> {
  const url = `${API_BASE_URL}/api/schemes/${encodeURIComponent(id)}`;
  return fetchWithTimeout<Scheme>(url);
}

export async function getCategories(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/categories`;
  return fetchWithTimeout<string[]>(url);
}

export async function searchSchemes(payload: SearchRequest): Promise<SearchResponse> {
  const url = `${API_BASE_URL}/api/search`;
  return fetchWithTimeout<SearchResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/api/chat`;
  return fetchWithTimeout<ChatResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 25000); // 25s for Gemini reasoning if called
}

export async function checkEligibility(payload: EligibilityProfile): Promise<EligibilityResponse> {
  const url = `${API_BASE_URL}/api/eligibility`;
  return fetchWithTimeout<EligibilityResponse>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getStats(): Promise<StatsResponse> {
  const url = `${API_BASE_URL}/api/stats`;
  return fetchWithTimeout<StatsResponse>(url);
}

// -------------------------------------------------------------
// SQLite 3 Persistence & Citizen Bookmarks
// -------------------------------------------------------------

export async function getBookmarks(userId: string = 'guest_user'): Promise<BookmarkItem[]> {
  const url = `${API_BASE_URL}/api/bookmarks?user_id=${encodeURIComponent(userId)}`;
  return fetchWithTimeout<BookmarkItem[]>(url);
}

export async function addBookmark(
  schemeId: string,
  notes?: string,
  userId: string = 'guest_user'
): Promise<{ scheme_id: string; saved: boolean }> {
  const url = `${API_BASE_URL}/api/bookmarks`;
  return fetchWithTimeout<{ scheme_id: string; saved: boolean }>(url, {
    method: 'POST',
    body: JSON.stringify({
      scheme_id: schemeId,
      user_identifier: userId,
      notes: notes || null,
    }),
  });
}

export async function removeBookmark(
  schemeId: string,
  userId: string = 'guest_user'
): Promise<{ status: string; scheme_id: string }> {
  const url = `${API_BASE_URL}/api/bookmarks/${encodeURIComponent(schemeId)}?user_id=${encodeURIComponent(userId)}`;
  return fetchWithTimeout<{ status: string; scheme_id: string }>(url, {
    method: 'DELETE',
  });
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const url = `${API_BASE_URL}/api/db/stats`;
  return fetchWithTimeout<DatabaseStats>(url);
}

// -------------------------------------------------------------
// Citizen Authentication API
// -------------------------------------------------------------

export async function signupUser(data: SignupData): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/api/auth/signup`;
  return fetchWithTimeout<AuthResponse>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/api/auth/login`;
  return fetchWithTimeout<AuthResponse>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(customToken?: string): Promise<User> {
  const url = `${API_BASE_URL}/api/auth/me`;
  const headers: Record<string, string> = customToken ? { Authorization: `Bearer ${customToken}` } : {};
  return fetchWithTimeout<User>(url, { headers });
}
