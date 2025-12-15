export enum Category {
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  OUTERWEAR = 'Outerwear',
  SHOES = 'Shoes',
  ACCESSORIES = 'Accessories'
}

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  category: Category;
  imageUrl: string;
  dateAdded: string;
  color: string;
}

export interface Drop {
  id: string;
  brand: string;
  name: string;
  date: string;
  time: string;
  imageUrl: string;
  notified: boolean;
  url?: string;
}

export enum Carrier {
  USPS = 'USPS',
  UPS = 'UPS',
  FEDEX = 'FedEx'
}

export enum TrackingStatus {
  PRE_TRANSIT = 'Pre-Transit',
  IN_TRANSIT = 'In Transit',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered'
}

export interface TrackingEvent {
  date: string;
  location: string;
  description: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  carrier: Carrier;
  itemName: string;
  status: TrackingStatus;
  estimatedDelivery: string;
  history: TrackingEvent[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}