// src/data/products.ts
// The original layout was designed assuming the floor container is 150vh tall,
// so percentage positions (products 1–18) resolve against that baseline.
const PERCENT_BASELINE_VH = 150;

const parseTopToVh = (top: string): number => {
  const percentMatch = top.match(/(-?\d+(\.\d+)?)%/);
  if (percentMatch) {
    return (parseFloat(percentMatch[1]) / 100) * PERCENT_BASELINE_VH;
  }
  const vhMatch = top.match(/(-?\d+(\.\d+)?)vh/);
  if (vhMatch) {
    return parseFloat(vhMatch[1]);
  }
  return 0;
};

export const getFloorHeightVh = (products: Product[]): number => {
  const maxTop = Math.max(
    ...products.flatMap(p => [
      parseTopToVh(p.position.top),
      p.mobilePosition ? parseTopToVh(p.mobilePosition.top) : 0,
    ])
  );
  return maxTop + 30; // buffer so the last row + card height isn't clipped
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;        // keep this — used for grid thumbnails / cards
  images: string[];     // NEW — the 4 photos shown in the product detail gallery
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
    name: 'Blue Y2 Hoodie',
    price: 89,
    image: '/products/1.png',
    images: [
      '/products/1a.png',
      '/products/1.png',
      '/products/1b.png',
      '/products/1c.png',
    ],
    position: { top: 'calc(15% - 72px)', left: '2%' },
    mobilePosition: { top: 'calc(10% - 70px)', left: '5%' },
    rotation: -8,
    scale: 0.9,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '2',
    name: 'Y2 T-Shirt No.1',
    price: 65,
    image: '/products/15.png',
    images: [
      '/products/15a.png',
      '/products/15.png',
      '/products/15b.png',
      '/products/15c.png',
    ],
    position: { top: 'calc(22% - 96px)', left: '18%' },
    mobilePosition: { top: 'calc(10% - 70px)', left: '38%' },
    rotation: 15,
    scale: 0.85,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '3',
    name: 'Y2 T-Shirt No.13',
    price: 45,
    image: '/products/36.png',
    images: [
      '/products/36a.png',
      '/products/36.png',
      '/products/36b.png',
      '/products/36c.png',
    ],
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
    name: 'Pink Y2 Hoodie',
    price: 45,
    image: '/products/2.png',
    images: [
      '/products/2a.png',
      '/products/2.png',
      '/products/2b.png',
      '/products/2c.png',
    ],
    position: { top: 'calc(19% - 96px)', left: '50%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '5%' },
    rotation: -3,
    scale: 0.88,
    zIndex: 4,
    category: 'top'
  },
  {
    id: '5',
    name: 'Y2 T-Shirt No.2',
    price: 125,
    image: '/products/23.png',
    images: [
      '/products/23a.png',
      '/products/23.png',
      '/products/23b.png',
      '/products/23c.png',
    ],
    position: { top: 'calc(14% - 96px)', left: '66%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '38%' },
    rotation: -12,
    scale: 0.98,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '6',
    name: 'Y2 T-Shirt No.14',
    price: 45,
    image: '/products/28.png',
    images: [
      '/products/28a.png',
      '/products/28.png',
      '/products/28b.png',
      '/products/28c.png',
    ],
    position: { top: 'calc(14% - 96px)', left: '82%' },
    mobilePosition: { top: 'calc(25% - 70px)', left: '71%' },
    rotation: 8,
    scale: 0.82,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '7',
    name: 'Y2 T-Shirt No.15',
    price: 35,
    image: '/products/27.png',
    images: [
      '/products/27a.png',
      '/products/27.png',
      '/products/27b.png',
      '/products/27c.png',
    ],
    position: { top: 'calc(42% - 96px)', left: '8%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '5%' },
    rotation: 45,
    scale: 0.75,
    zIndex: 8,
    category: 'accessory'
  },
  {
    id: '8',
    name: 'Y2 T-Shirt No.3',
    price: 75,
    image: '/products/25.png',
    images: [
      '/products/25a.png',
      '/products/25.png',
      '/products/25b.png',
      '/products/25c.png',
    ],
    position: { top: 'calc(46% - 96px)', left: '24%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '38%' },
    rotation: -5,
    scale: 0.92,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '9',
    name: 'Brown Y2 Hoodie',
    price: 85,
    image: '/products/7.png',
    images: [
      '/products/7a.png',
      '/products/7.png',
      '/products/7b.png',
      '/products/7c.png',
    ],
    position: { top: 'calc(54% - 96px)', left: '40%' },
    mobilePosition: { top: 'calc(40% - 70px)', left: '71%' },
    rotation: 12,
    scale: 0.96,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '10',
    name: 'Y2 T-Shirt No.16',
    price: 68,
    image: '/products/29.png',
    images: [
      '/products/29a.png',
      '/products/29.png',
      '/products/29b.png',
      '/products/29c.png',
    ],
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
    name: 'Orange Y2 Hoodie',
    price: 40,
    image: '/products/8.png',
    images: [
      '/products/8a.png',
      '/products/8.png',
      '/products/8b.png',
      '/products/8c.png',
    ],
    position: { top: 'calc(48% - 96px)', left: '72%' },
    mobilePosition: { top: 'calc(55% - 70px)', left: '38%' },
    rotation: -35,
    scale: 0.7,
    zIndex: 9,
    category: 'accessory'
  },
  /*{
    id: '12',
    name: 'Y2 T-Shirt No.',
    price: 72,
    image: '/products/18.png',
    images: [
      '/products/10.png',
      '/products/10-2.png',
      '/products/10-3.png',
      '/products/10-4.png',
    ],
    position: { top: 'calc(48% - 96px)', left: '88%' },
    mobilePosition: { top: 'calc(55% - 70px)', left: '71%' },
    rotation: 6,
    scale: 0.87,
    zIndex: 3,
    category: 'bottom'
  },
  */
  {
    id: '13',
    name: 'Red Y2 Hoodie',
    price: 78,
    image: '/products/6.png',
    images: [
      '/products/6a.png',
      '/products/6.png',
      '/products/6b.png',
      '/products/6c.png',
    ],
    position: { top: 'calc(76% - 96px)', left: '4%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '5%' },
    rotation: -10,
    scale: 0.93,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '14',
    name: 'Y2 T-Shirt No.17',
    price: 58,
    image: '/products/32.png',
    images: [
      '/products/32a.png',
      '/products/32.png',
      '/products/32b.png',
      '/products/32c.png',
    ],
    position: { top: 'calc(80% - 96px)', left: '20%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '38%' },
    rotation: 25,
    scale: 0.85,
    zIndex: 7,
    category: 'accessory'
  },
  {
    id: '15',
    name: 'Y2 T-Shirt No.4',
    price: 55,
    image: '/products/19.png',
    images: [
      '/products/19a.png',
      '/products/19.png',
      '/products/19b.png',
      '/products/19c.png',
    ],
    position: { top: 'calc(74% - 96px)', left: '36%' },
    mobilePosition: { top: 'calc(70% - 70px)', left: '71%' },
    rotation: 4,
    scale: 0.91,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '16',
    name: 'Y2 T-Shirt No.18',
    price: 92,
    image: '/products/31.png',
    images: [
      '/products/31a.png',
      '/products/31.png',
      '/products/31b.png',
      '/products/31c.png',
    ],
    position: { top: 'calc(82% - 96px)', left: '52%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '5%' },
    rotation: -7,
    scale: 0.98,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '17',
    name: 'Blue Y2 Hoodie',
    price: 65,
    image: '/products/3.png',
    images: [
      '/products/3a.png',
      '/products/3.png',
      '/products/3b.png',
      '/products/3c.png',
    ],
    position: { top: 'calc(78% - 96px)', left: '68%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '38%' },
    rotation: 9,
    scale: 0.86,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '18',
    name: 'Y2 T-Shirt No.5',
    price: 42,
    image: '/products/20.png',
    images: [
      '/products/20a.png',
      '/products/20.png',
      '/products/20b.png',
      '/products/20c.png',
    ],
    position: { top: 'calc(78% - 96px)', left: '84%' },
    mobilePosition: { top: 'calc(85% - 70px)', left: '71%' },
    rotation: -2,
    scale: 0.94,
    zIndex: 5,
    category: 'top'
  },
      {
    id: '19',
    name: 'Y2 T-Shirt No.19',
    price: 48,
    image: '/products/4.png',
    images: [
      '/products/4a.png',
      '/products/4.png',
      '/products/4b.png',
      '/products/4c.png',
    ],
    position: { top: 'calc(106vh - 96px)', left: '2%' },
    mobilePosition: { top: 'calc(100vh - 70px)', left: '5%' },
    rotation: -6,
    scale: 0.9,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '20',
    name: 'Green Y2 Hoodie',
    price: 95,
    image: '/products/5.png',
    images: [
      '/products/5a.png',
      '/products/5.png',
      '/products/5b.png',
      '/products/5c.png',
    ],
    position: { top: 'calc(112vh - 96px)', left: '18%' },
    mobilePosition: { top: 'calc(100vh - 70px)', left: '38%' },
    rotation: 10,
    scale: 0.88,
    zIndex: 3,
    category: 'top'
  },
  {
    id: '21',
    name: 'Y2 T-Shirt No.20',
    price: 45,
    image: '/products/9.png',
    images: [
      '/products/9a.png',
      '/products/9.png',
      '/products/9b.png',
      '/products/9c.png',
    ],
    position: { top: 'calc(108vh - 96px)', left: '34%' },
    mobilePosition: { top: 'calc(100vh - 70px)', left: '71%' },
    rotation: 3,
    scale: 0.95,
    zIndex: 7,
    category: 'top'
  },
  {
    id: '22',
    name: 'Y2 Cargo Shorts No.1',
    price: 70,
    image: '/products/10.png',
    images: [
      '/products/10a.png',
      '/products/10.png',
      '/products/10b.png',
      '/products/10c.png',
    ],
    position: { top: 'calc(114vh - 96px)', left: '50%' },
    mobilePosition: { top: 'calc(115vh - 70px)', left: '5%' },
    rotation: -4,
    scale: 0.86,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '23',
    name: 'Black Y2 Hoodie',
    price: 130,
    image: '/products/11.png',
    images: [
      '/products/11a.png',
      '/products/11.png',
      '/products/11b.png',
      '/products/11c.png',
    ],
    position: { top: 'calc(110vh - 96px)', left: '66%' },
    mobilePosition: { top: 'calc(115vh - 70px)', left: '38%' },
    rotation: -14,
    scale: 0.98,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '24',
    name: 'Y2 T-Shirt No.21',
    price: 45,
    image: '/products/12.png',
    images: [
      '/products/12a.png',
      '/products/12.png',
      '/products/12b.png',
      '/products/12c.png',
    ],
    position: { top: 'calc(110vh - 96px)', left: '82%' },
    mobilePosition: { top: 'calc(115vh - 70px)', left: '71%' },
    rotation: 7,
    scale: 0.83,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '25',
    name: 'Y2 Chain Necklace',
    price: 38,
    image: '/products/13.png',
    images: [
      '/products/13a.png',
      '/products/13.png',
      '/products/13b.png',
      '/products/13c.png',
    ],
    position: { top: 'calc(138vh - 96px)', left: '8%' },
    mobilePosition: { top: 'calc(130vh - 70px)', left: '5%' },
    rotation: 40,
    scale: 0.74,
    zIndex: 8,
    category: 'accessory'
  },
  {
    id: '26',
    name: 'Y2 Cargo Shorts No.2',
    price: 76,
    image: '/products/14.png',
    images: [
      '/products/14a.png',
      '/products/14.png',
      '/products/14b.png',
      '/products/14c.png',
    ],
    position: { top: 'calc(142vh - 96px)', left: '24%' },
    mobilePosition: { top: 'calc(130vh - 70px)', left: '38%' },
    rotation: -6,
    scale: 0.91,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '27',
    name: 'Y2 T-Shirt No.22',
    price: 85,
    image: '/products/16.png',
    images: [
      '/products/16a.png',
      '/products/16.png',
      '/products/16b.png',
      '/products/16c.png',
    ],
    position: { top: 'calc(150vh - 96px)', left: '40%' },
    mobilePosition: { top: 'calc(130vh - 70px)', left: '71%' },
    rotation: 13,
    scale: 0.96,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '28',
    name: 'Y2 Cargo Shorts No.3',
    price: 68,
    image: '/products/17.png',
    images: [
      '/products/17a.png',
      '/products/17.png',
      '/products/17b.png',
      '/products/17c.png',
    ],
    position: { top: 'calc(144vh - 96px)', left: '56%' },
    mobilePosition: { top: 'calc(145vh - 70px)', left: '5%' },
    rotation: -9,
    scale: 0.85,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '29',
    name: 'Y2 Studded Belt No.2',
    price: 42,
    image: '/products/21.png',
    images: [
      '/products/21a.png',
      '/products/21.png',
      '/products/21b.png',
      '/products/21c.png',
    ],
    position: { top: 'calc(144vh - 96px)', left: '72%' },
    mobilePosition: { top: 'calc(145vh - 70px)', left: '38%' },
    rotation: -32,
    scale: 0.71,
    zIndex: 9,
    category: 'accessory'
  },
  {
    id: '30',
    name: 'Y2 Cargo Shorts No.4',
    price: 73,
    image: '/products/22.png',
    images: [
      '/products/22a.png',
      '/products/22.png',
      '/products/22b.png',
      '/products/22c.png',
    ],
    position: { top: 'calc(144vh - 96px)', left: '88%' },
    mobilePosition: { top: 'calc(145vh - 70px)', left: '71%' },
    rotation: 5,
    scale: 0.88,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '31',
    name: 'Y2 Cargo Shorts No.5',
    price: 79,
    image: '/products/24.png',
    images: [
      '/products/24a.png',
      '/products/24.png',
      '/products/24b.png',
      '/products/24c.png',
    ],
    position: { top: 'calc(172vh - 96px)', left: '4%' },
    mobilePosition: { top: 'calc(160vh - 70px)', left: '5%' },
    rotation: -11,
    scale: 0.92,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '32',
    name: 'Y2 Bucket Hat No.2',
    price: 55,
    image: '/products/26.png',
    images: [
      '/products/26a.png',
      '/products/26.png',
      '/products/26b.png',
      '/products/26c.png',
    ],
    position: { top: 'calc(176vh - 96px)', left: '20%' },
    mobilePosition: { top: 'calc(160vh - 70px)', left: '38%' },
    rotation: 22,
    scale: 0.84,
    zIndex: 7,
    category: 'accessory'
  },
  {
    id: '33',
    name: 'Y2 T-Shirt No.23',
    price: 55,
    image: '/products/30.png',
    images: [
      '/products/30a.png',
      '/products/30.png',
      '/products/30b.png',
      '/products/30c.png',
    ],
    position: { top: 'calc(170vh - 96px)', left: '36%' },
    mobilePosition: { top: 'calc(160vh - 70px)', left: '71%' },
    rotation: 4,
    scale: 0.9,
    zIndex: 2,
    category: 'top'
  },
  {
    id: '34',
    name: 'Y2 T-Shirt No.24',
    price: 90,
    image: '/products/33.png',
    images: [
      '/products/33a.png',
      '/products/33.png',
      '/products/33b.png',
      '/products/33c.png',
    ],
    position: { top: 'calc(178vh - 96px)', left: '52%' },
    mobilePosition: { top: 'calc(175vh - 70px)', left: '5%' },
    rotation: -7,
    scale: 0.97,
    zIndex: 6,
    category: 'top'
  },
  {
    id: '35',
    name: 'Y2 Cargo Shorts No.6',
    price: 66,
    image: '/products/34.png',
    images: [
      '/products/34a.png',
      '/products/34.png',
      '/products/34b.png',
      '/products/34c.png',
    ],
    position: { top: 'calc(174vh - 96px)', left: '68%' },
    mobilePosition: { top: 'calc(175vh - 70px)', left: '38%' },
    rotation: 8,
    scale: 0.85,
    zIndex: 3,
    category: 'bottom'
  },
  {
    id: '36',
    name: 'Y2 T-Shirt No.25',
    price: 44,
    image: '/products/35.png',
    images: [
      '/products/35a.png',
      '/products/35.png',
      '/products/35b.png',
      '/products/35c.png',
    ],
    position: { top: 'calc(174vh - 96px)', left: '84%' },
    mobilePosition: { top: 'calc(175vh - 70px)', left: '71%' },
    rotation: -3,
    scale: 0.93,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '37',
    name: 'Y2 Cargo Shorts No.7',
    price: 71,
    image: '/products/37.png',
    images: [
      '/products/37a.png',
      '/products/37.png',
      '/products/37b.png',
      '/products/37c.png',
    ],
    position: { top: 'calc(202vh - 96px)', left: '2%' },
    mobilePosition: { top: 'calc(190vh - 70px)', left: '5%' },
    rotation: -9,
    scale: 0.89,
    zIndex: 4,
    category: 'bottom'
  },
  {
    id: '38',
    name: 'Y2 Bucket Hat No.3',
    price: 60,
    image: '/products/38.png',
    images: [
      '/products/38a.png',
      '/products/38.png',
      '/products/38b.png',
      '/products/38c.png',
    ],
    position: { top: 'calc(206vh - 96px)', left: '18%' },
    mobilePosition: { top: 'calc(190vh - 70px)', left: '38%' },
    rotation: 28,
    scale: 0.8,
    zIndex: 7,
    category: 'accessory'
  },
  {
    id: '39',
    name: 'Y2 T-Shirt No.26',
    price: 46,
    image: '/products/39.png',
    images: [
      '/products/39a.png',
      '/products/39.png',
      '/products/39b.png',
      '/products/39c.png',
    ],
    position: { top: 'calc(204vh - 96px)', left: '34%' },
    mobilePosition: { top: 'calc(190vh - 70px)', left: '71%' },
    rotation: 5,
    scale: 0.94,
    zIndex: 5,
    category: 'top'
  },
  {
    id: '40',
    name: 'Yellow Y2 Hoodie',
    price: 110,
    image: '/products/40.png',
    images: [
      '/products/40a.png',
      '/products/40.png',
      '/products/40b.png',
      '/products/40c.png',
    ],
    position: { top: 'calc(210vh - 96px)', left: '50%' },
    mobilePosition: { top: 'calc(205vh - 70px)', left: '5%' },
    rotation: -13,
    scale: 0.96,
    zIndex: 6,
    category: 'top'
  }
];
