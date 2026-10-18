// frontend/src/api.ts
import type { ProductCard } from './types';
import { INITIAL_PRODUCTS } from './mockData';

const TOKEN_KEY = 'sourcingo_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/+$/, "");

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  return res;
}


// ---------- Products (public) ----------
export interface FetchProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  radiusKm?: number;
  autoExpand?: boolean;
  originCity?: string;
  buyerLat?: number;
  buyerLng?: number;
}

export interface FetchProductsResult {
  products: ProductCard[];
  searchMetadata?: import('./types').SearchMetadata;
}

export async function fetchProducts(
  params?: FetchProductsParams
): Promise<FetchProductsResult> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All Sectors') {
      query.set('category', params.category);
    }
    if (typeof params?.minPrice === 'number') {
      query.set('minPrice', params.minPrice.toString());
    }
    if (typeof params?.maxPrice === 'number') {
      query.set('maxPrice', params.maxPrice.toString());
    }
    if (typeof params?.radiusKm === 'number') {
      query.set('radiusKm', params.radiusKm.toString());
    }
    if (typeof params?.autoExpand === 'boolean') {
      query.set('autoExpand', params.autoExpand.toString());
    }
    if (params?.originCity) {
      query.set('originCity', params.originCity);
    }
    if (typeof params?.buyerLat === 'number') {
      query.set('buyerLat', params.buyerLat.toString());
    }
    if (typeof params?.buyerLng === 'number') {
      query.set('buyerLng', params.buyerLng.toString());
    }

    const qs = query.toString();
    const res = await apiFetch(`/api/marketplace/products${qs ? `?${qs}` : ''}`);
    if (!res.ok) return { products: INITIAL_PRODUCTS };

    const data = await res.json();
    if (!data.products?.length) {
      return { products: [], searchMetadata: data.searchMetadata };
    }

    const mapped: ProductCard[] = data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image_url:
        p.image_url ||
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      material: p.material || 'Engineered Industrial Alloy',
      unit_price: p.unit_price ?? 0,
      price_unit: p.price_unit || 'INR / unit',
      moq: p.moq || 100,
      lead_time_days: p.lead_time_days || 14,
      certifications: p.certifications || ['ISO 9001'],
      sample_available: p.sample_available ?? true,
      value_label: p.value_label || 'Verified OEM',
      value_proposition: p.value_proposition || 'Precision manufacturing.',
      manufacturer: {
        id: p.manufacturer?.id || 'mfg-0',
        name: p.manufacturer?.name || 'Vetted Partner',
        city: p.manufacturer?.city || '',
        state: p.manufacturer?.state || '',
        country: p.manufacturer?.country,
        industry: p.manufacturer?.industry || '',
        rating: p.manufacturer?.rating || 0,
        rating_count: p.manufacturer?.rating_count || 0,
        verified: true,
        avatar: undefined,
        latitude: p.manufacturer?.latitude ?? null,
        longitude: p.manufacturer?.longitude ?? null,
        distance_km: p.manufacturer?.distance_km ?? null,
      },
    }));

    return { products: mapped, searchMetadata: data.searchMetadata };
  } catch {
    return { products: INITIAL_PRODUCTS };
  }
}

// ---------- Swipes (needs auth) ----------
export async function postSwipe(targetBusinessId: string, action: 'like' | 'pass') {
  try {
    const res = await apiFetch('/api/marketplace/swipes', {
      method: 'POST',
      body: JSON.stringify({
        target_business_id: targetBusinessId,
        action,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Swipe failed:', err);
      return { matched: false };
    }
    return await res.json(); // { matched: boolean, match?: ... }
  } catch {
    return { matched: false };
  }
}

// ---------- Auth ----------
export async function login(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.session?.access_token) {
    localStorage.setItem(TOKEN_KEY, data.session.access_token);
  }
  return data;
}

export async function signup(
  email: string,
  password: string,
  role: 'buyer' | 'manufacturer'
) {
  const res = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  if (data.session?.access_token) {
    localStorage.setItem(TOKEN_KEY, data.session.access_token);
  }
  return data;
}

// ---------- Profile (needs auth) ----------
export async function fetchMyProfile() {
  const res = await apiFetch('/api/profile/me');
  if (!res.ok) throw new Error('Could not load profile');
  return res.json();
}

// ---------- Matches (needs auth) ----------
export async function fetchMatches() {
  const res = await apiFetch('/api/marketplace/matches');
  if (!res.ok) return { matches: [] };
  return res.json();
}
// Add at the bottom of frontend/src/api.ts

export async function sendChatMessage(
  message: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  userProfile?: {
    name?: string;
    companyName?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  } | null
) {
  const res = await apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, chatHistory, userProfile }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  return data as {
    message: string;
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    suppliersConsidered?: number;
  };
}