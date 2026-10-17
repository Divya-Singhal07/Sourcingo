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

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  return res;
}

// ---------- Products (public) ----------
export async function fetchProducts(): Promise<ProductCard[]> {
  try {
    const res = await apiFetch('/api/marketplace/products');
    if (!res.ok) return INITIAL_PRODUCTS;

    const data = await res.json();
    if (!data.products?.length) return INITIAL_PRODUCTS;

    return data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image_url: p.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
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
        industry: p.manufacturer?.industry || '',
        rating: p.manufacturer?.rating || 0,
        rating_count: p.manufacturer?.rating_count || 0,
        verified: true,
        avatar: undefined,
      },
    }));
  } catch {
    return INITIAL_PRODUCTS;
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
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  const res = await apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, chatHistory }),
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