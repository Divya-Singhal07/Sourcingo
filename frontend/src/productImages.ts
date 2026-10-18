const CATEGORY_FALLBACKS: Record<string, string> = {
  'Gears & Powertrain': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  'Metals & Alloys': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'Polymers': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
  'Aerospace': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  'Automotive': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  'Medical Devices': 'https://images.unsplash.com/photo-1583912267670-6575ad373678?w=800&auto=format&fit=crop&q=80',
  'Precision CNC': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  'Renewables': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'Packaging': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80';

export function getProductImage(_name?: string, imageUrl?: string | null, category?: string): string {
  if (imageUrl && imageUrl.trim() && !imageUrl.startsWith('/images/')) {
    return imageUrl;
  }
  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }
  return DEFAULT_IMAGE;
}