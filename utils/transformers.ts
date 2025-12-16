import { ClothingItem, Order, Drop } from '../models/types';

export const transformWardrobeData = (data: any[]): ClothingItem[] => {
  if (!data) return [];
  return data.map((item) => ({
    id: String(item.id), // Enforce string ID
    name: item.name,
    brand: item.brand,
    category: item.category,
    imageUrl: item.image_url,
    // Convert timestamptz to string YYYY-MM-DD for frontend consistency
    dateAdded: item.date_added 
      ? new Date(item.date_added).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    color: item.color
  }));
};

export const transformOrderData = (data: any[]): Order[] => {
  if (!data) return [];
  return data.map((item) => ({
    id: String(item.id), // Enforce string ID
    trackingNumber: item.tracking_number,
    carrier: item.carrier,
    itemName: item.item_name,
    status: item.status,
    // Handle timestamp -> string conversion
    estimatedDelivery: item.estimated_delivery 
      ? new Date(item.estimated_delivery).toLocaleDateString() 
      : 'Pending',
    history: item.history || []
  }));
};

export const transformDropData = (data: any[]): Drop[] => {
  if (!data) return [];
  return data.map((item) => {
    const dropDate = new Date(item.drop_datetime);
    return {
      id: String(item.id), // Enforce string ID
      brand: item.brand,
      name: item.name,
      // Split drop_datetime back into date and time for frontend
      date: dropDate.toISOString().split('T')[0],
      time: dropDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: item.image_url,
      notified: item.notified,
      url: item.url
    };
  });
};