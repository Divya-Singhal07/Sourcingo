import type { ProductCard } from './types';
import { INITIAL_PRODUCTS } from './mockData';

export async function fetchProducts(): Promise<ProductCard[]> {
  try {
    const res = await fetch('/api/marketplace/products');
    if (!res.ok) {
      return INITIAL_PRODUCTS;
    }
    const data = await res.json();
    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      return data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        image_url: p.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
        material: p.material || 'Engineered Industrial Alloy',
        unit_price: p.unit_price,
        price_unit: p.price_unit || 'EUR / unit',
        moq: p.moq || 100,
        lead_time_days: p.lead_time_days || 14,
        certifications: p.certifications || ['ISO 9001'],
        sample_available: p.sample_available ?? true,
        value_label: p.value_label || 'Verified OEM',
        value_proposition: p.value_proposition || 'Precision manufacturing with high-tolerance validation.',
        manufacturer: {
          id: p.manufacturer?.id || 'mfg-0',
          name: p.manufacturer?.name || 'Vetted Industrial Partner',
          city: p.manufacturer?.city || 'Munich',
          state: p.manufacturer?.state || 'Bavaria',
          country: 'Germany',
          industry: p.manufacturer?.industry || 'Industrial Engineering',
          rating: p.manufacturer?.rating || 4.9,
          rating_count: p.manufacturer?.rating_count || 42,
          verified: true,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
        },
      }));
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Backend offline or not reachable, using localized vetted database:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function postSwipe(targetBusinessId: string, action: 'like' | 'pass') {
  try {
    const res = await fetch('/api/marketplace/swipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_business_id: targetBusinessId, action }),
    });
    if (!res.ok) {
      return { matched: action === 'like' };
    }
    return await res.json();
  } catch {
    return { matched: action === 'like' };
  }
}
