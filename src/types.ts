
export interface Hotel {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  locationEn: string;
  price: number;
  basePrice?: number; // Added for compatibility with ApiHotel
  rating: number;
  reviews: number;
  image: string;
  coords: [number, number];
  amenities: string[];
  images?: string[]; // Gallery/Room images
  description: string;
  isOffer?: boolean;
  discount?: string;
  distanceFromHaram?: string; // المسافة من الحرم
  hasFreeBreakfast?: boolean;
  hasFreeTransport?: boolean;
  view?: string; // e.g. "Kaaba View", "Haram View"
  isFeatured?: boolean;
  partialMatch?: boolean; // [FIX] Include partial match flag
  city?: string; // 'makkah', 'madinah'
  nearbyLandmarks?: {
    name: string;
    distance: string;
    icon: string;
    type?: string;
  }[];
  lat?: string | number;
  lng?: string | number;
}

export interface SearchFilters {
  destination: string;
  dates: string;
  guests: number;
}
