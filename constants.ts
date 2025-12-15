import { Category, ClothingItem, Drop, Carrier, TrackingStatus, Order } from './models/types';

export const MOCK_WARDROBE: ClothingItem[] = [
  {
    id: '1',
    name: 'Box Logo Hoodie',
    brand: 'Supreme',
    category: Category.TOPS,
    color: 'Heather Grey',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    dateAdded: '2023-10-15'
  },
  {
    id: '2',
    name: 'Chicago 1s',
    brand: 'Jordan',
    category: Category.SHOES,
    color: 'Red/White/Black',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    dateAdded: '2023-11-02'
  },
  {
    id: '3',
    name: 'Work Jacket',
    brand: 'Carhartt WIP',
    category: Category.OUTERWEAR,
    color: 'Black',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    dateAdded: '2023-12-01'
  },
  {
    id: '4',
    name: 'Double Knee Pants',
    brand: 'Dickies',
    category: Category.BOTTOMS,
    color: 'Navy',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    dateAdded: '2024-01-10'
  },
  {
    id: '5',
    name: 'Samba OG',
    brand: 'Adidas',
    category: Category.SHOES,
    color: 'White/Black',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    dateAdded: '2024-02-14'
  },
  {
    id: '6',
    name: 'Vintage Tee',
    brand: 'Nike',
    category: Category.TOPS,
    color: 'Faded Black',
    imageUrl: 'https://picsum.photos/400/400?random=9',
    dateAdded: '2024-03-01'
  },
  {
    id: '7',
    name: '501 Original',
    brand: 'Levis',
    category: Category.BOTTOMS,
    color: 'Light Wash',
    imageUrl: 'https://picsum.photos/400/400?random=10',
    dateAdded: '2024-03-05'
  },
  {
    id: '8',
    name: 'Mohair Cardigan',
    brand: 'Needles',
    category: Category.OUTERWEAR,
    color: 'Purple',
    imageUrl: 'https://picsum.photos/400/400?random=11',
    dateAdded: '2024-03-10'
  },
  {
    id: '9',
    name: 'Wallabee',
    brand: 'Clarks',
    category: Category.SHOES,
    color: 'Maple Suede',
    imageUrl: 'https://picsum.photos/400/400?random=12',
    dateAdded: '2024-03-15'
  },
  {
    id: '10',
    name: 'Tote Bag',
    brand: 'LL Bean',
    category: Category.ACCESSORIES,
    color: 'Canvas',
    imageUrl: 'https://picsum.photos/400/400?random=13',
    dateAdded: '2024-03-20'
  },
  {
    id: '11',
    name: 'Ribbed Tank',
    brand: 'Uniqlo',
    category: Category.TOPS,
    color: 'White',
    imageUrl: 'https://picsum.photos/400/400?random=14',
    dateAdded: '2024-03-22'
  },
  {
    id: '12',
    name: 'Cargo Shorts',
    brand: 'Stone Island',
    category: Category.BOTTOMS,
    color: 'Olive',
    imageUrl: 'https://picsum.photos/400/400?random=15',
    dateAdded: '2024-03-25'
  }
];

export const MOCK_DROPS: Drop[] = [
  {
    id: 'd1',
    brand: 'Nike',
    name: 'Dunk Low "Panda" Restock',
    date: '2025-06-15',
    time: '10:00 AM EST',
    imageUrl: 'https://picsum.photos/400/400?random=6',
    notified: true
  },
  {
    id: 'd2',
    brand: 'Kith',
    name: 'Summer 2025 Collection',
    date: '2025-06-20',
    time: '11:00 AM EST',
    imageUrl: 'https://picsum.photos/400/400?random=7',
    notified: false
  },
  {
    id: 'd3',
    brand: 'Stüssy',
    name: 'Big Ol\' Jean Release',
    date: '2025-06-22',
    time: '1:00 PM EST',
    imageUrl: 'https://picsum.photos/400/400?random=8',
    notified: false
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    trackingNumber: '1Z999AA10123456784',
    carrier: Carrier.UPS,
    itemName: 'New Balance 990v6',
    status: TrackingStatus.IN_TRANSIT,
    estimatedDelivery: 'June 12, 2025',
    history: [
      { date: 'June 10, 8:00 AM', location: 'Louisville, KY', description: 'Departed Facility' },
      { date: 'June 9, 4:00 PM', location: 'Nashville, TN', description: 'Arrived at Facility' }
    ]
  },
  {
    id: 'o2',
    trackingNumber: '9400100000000000000000',
    carrier: Carrier.USPS,
    itemName: 'Vintage Levi\'s 501',
    status: TrackingStatus.DELIVERED,
    estimatedDelivery: 'June 8, 2025',
    history: [
      { date: 'June 8, 2:30 PM', location: 'Front Porch', description: 'Delivered' }
    ]
  }
];