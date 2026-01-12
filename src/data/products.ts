// src/data/products.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  position: {
    top: string;
    left: string;
  };
  mobilePosition?: {
    top: string;
    left: string;
  };
  rotation: number;
  scale: number;
  zIndex: number;
  category?: 'top' | 'bottom' | 'accessory';
  soldOut?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Red Plaid Shirt',
    price: 89,
    image: '/products/10.jpeg',
    position: { top: 'calc(15% - 72px)', left: '2%' },
    mobilePosition: { top: 'calc(10% - 70px)', left: '5%' },
    rotation: -8,
    scale: 0.9,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '2',
    name: 'Black Denim Shorts',
    price: 65,
    image: '/products/18.jpeg',
    position: { top: 'calc(22% - 96px)', left: '18%' },
    mobilePosition: { top: 'calc(10% - 70px)', left: '38%' },
    rotation: 15,
    scale: 0.85,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '3',
    name: 'Red 80564 T-Shirt',
    price: 45,
    image: '/products/19.jpeg',
    position: { top: 'calc(12% - 96px)', left: '34%' },
    mobilePosition: { top: 'calc(10% - 70px)', left: '71%' },
    rotation: 2,
    scale: 0.95,
    zIndex: 7,
    category: 'top',
    soldOut: true
  },
  {
    id: '4',
    name: 'Black 80564 T-Shirt',
    price: 45,
    image: '/products/2.jpeg',
    position: { top: 'calc(19% - 96px)', left: '50%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '5%' },
    rotation: -3,
    scale: 0.88,
    zIndex: 4,
    category: 'top'
  },
  {
    id: '5',
    name: 'Black 80564 Hoodie',
    price: 125,
    image: '/products/23.jpeg',
    position: { top: 'calc(14% - 96px)', left: '66%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '38%' },
    rotation: -12,
    scale: 0.98,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '6',
    name: 'Purple 80564 T-Shirt',
    price: 45,
    image: '/products/24.jpeg',
    position: { top: 'calc(14% - 96px)', left: '82%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '71%' },
    rotation: 8,
    scale: 0.82,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '7',
    name: 'Pink Studded Belt',
    price: 35,
    image: '/products/25.jpeg',
    position: { top: 'calc(42% - 96px)', left: '8%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '5%' },
    rotation: 45,
    scale: 0.75,
    zIndex: 8,
    category: 'accessory'
  },
  {
    id: '8',
    name: 'Blue Plaid Shorts',
    price: 75,
    image: '/products/26.jpeg',
    position: { top: 'calc(46% - 96px)', left: '24%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '38%' },
    rotation: -5,
    scale: 0.92,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '9',
    name: 'Striped Long Sleeve',
    price: 85,
    image: '/products/28.jpeg',
    position: { top: 'calc(54% - 96px)', left: '40%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '71%' },
    rotation: 12,
    scale: 0.96,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '10',
    name: 'Colorful Plaid Shorts',
    price: 68,
    image: '/products/29.jpeg',
    position: { top: 'calc(48% - 96px)', left: '56%' },
    mobilePosition: { top: 'calc(55% - 70px)', left: '5%' },
    rotation: -8,
    scale: 0.84,
    zIndex: 4,
    category: 'bottom',
    soldOut: true
  },
  {
    id: '11',
    name: 'Green Studded Belt',
    price: 40,
    image: '/products/3.jpeg',
    position: { top: 'calc(48% - 96px)', left: '72%' },
    mobilePosition: { top: 'calc(55% - 70px)', left: '38%' },
    rotation: -35,
    scale: 0.7,
    zIndex: 9,
    category: 'accessory'
  },
  {
    id: '12',
    name: 'Beige Plaid Shorts',
    price: 72,
    image: '/products/30.jpeg',
    position: { top: 'calc(48% - 96px)', left: '88%' },
    mobilePosition: { top: 'calc(55% - 70px)', left: '71%' },
    rotation: 6,
    scale: 0.87,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '13',
    name: 'Orange Plaid Shorts',
    price: 78,
    image: '/products/31.jpeg',
    position: { top: 'calc(76% - 96px)', left: '4%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '5%' },
    rotation: -10,
    scale: 0.93,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '14',
    name: 'Cow Print Bucket Hat',
    price: 58,
    image: '/products/32.jpeg',
    position: { top: 'calc(80% - 96px)', left: '20%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '38%' },
    rotation: 25,
    scale: 0.85,
    zIndex: 7,
    category: 'accessory'
  },
  {
    id: '15',
    name: 'Purple Ringer Tee',
    price: 55,
    image: '/products/4.jpeg',
    position: { top: 'calc(74% - 96px)', left: '36%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '71%' },
    rotation: 4,
    scale: 0.91,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '16',
    name: 'Pink Striped Long Sleeve',
    price: 92,
    image: '/products/6.jpeg',
    position: { top: 'calc(82% - 96px)', left: '52%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '5%' },
    rotation: -7,
    scale: 0.98,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '17',
    name: 'Distressed Denim Shorts',
    price: 65,
    image: '/products/7.jpeg',
    position: { top: 'calc(78% - 96px)', left: '68%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '38%' },
    rotation: 9,
    scale: 0.86,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '18',
    name: 'White 80564 T-Shirt',
    price: 42,
    image: '/products/8.jpeg',
    position: { top: 'calc(78% - 96px)', left: '84%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '71%' },
    rotation: -2,
    scale: 0.94,
    zIndex: 5,
    category: 'top'
  }
];
