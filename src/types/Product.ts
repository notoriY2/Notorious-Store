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

export interface CartItem extends Product {
  quantity: number;
  uniqueId: string;
  selectedSize?: string;
  selectedColor?: string;
}