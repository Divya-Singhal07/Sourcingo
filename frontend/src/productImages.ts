const PRODUCT_IMAGES: Record<string, string> = {
  "Helical Gear Set": "/images/gear.png",
  "Stainless Sheet Cut Parts": "/images/metals.png",
  "PCB Assembly Module": "/images/electronics.png",
  "Injection Molded Housing": "/images/polymers.png",
};

const FALLBACK_IMAGE = "/images/gear.png";

export function getProductImage(name: string, imageUrl?: string | null): string {
  return imageUrl || PRODUCT_IMAGES[name] || FALLBACK_IMAGE;
}