export interface Manufacturer {
  id: string;
  name: string;
  city: string;
  state: string;
  country?: string;
  industry: string;
  rating: number;
  rating_count: number;
  verified: boolean;
  avatar?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  category: string;
  image_url: string;
  gallery_urls?: string[];
  material?: string;
  unit_price: number;
  price_unit?: string;
  moq: number;
  lead_time_days: number;
  certifications: string[];
  sample_available?: boolean;
  value_label?: string;
  value_proposition?: string;
  manufacturer: Manufacturer;
}

export interface DealRoomItem {
  id: string;
  partnerName: string;
  partnerRole: string;
  partnerLocation: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  rfqStatus: 'Active RFQ' | 'NDA Pending' | 'Milestone 2/4' | 'Reviewing Spec';
  dealValue: string;
  sector: string;
  verified: boolean;
  ndaSigned: boolean;
}

export interface MatchAvatar {
  id: string;
  name: string;
  company: string;
  avatar: string;
  role: string;
  verified: boolean;
  isNew: boolean;
}
