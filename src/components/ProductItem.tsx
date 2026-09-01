// src/components/ProductItem.tsx
import React from 'react';
import { Product } from '../types/Product';

interface ProductItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onHover: (product: Product | null) => void;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

const ProductItem: React.FC<ProductItemProps> = ({ product, onProductClick, onHover }) => {
  const isMobile = useIsMobile();
  const position = isMobile && product.mobilePosition ? product.mobilePosition : product.position;
  
  return (
    <div
      className="absolute cursor-pointer group"
      onClick={() => onProductClick(product)}
      onMouseEnter={() => onHover(product)}
      onMouseLeave={() => onHover(null)}
      style={{
        top: position.top,
        left: position.left,
        transform: `rotate(${product.rotation}deg) scale(${product.scale * 0.8})`,
        zIndex: product.zIndex,
      }}
    >
      <div className="relative m-2 md:m-4">
        {isMobile && (
          <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-b from-white/70 to-transparent blur-sm -z-10" />
        )}
        {/* Main product image with explicit intrinsic dimensions to avoid layout shifts */}
        <img
          src={product.image}
          alt={product.name}
          width="300"
          height="400"
          loading="lazy"
          decoding="async"
          className={`mobile-floor-product md:w-48 md:h-49 lg:w-60 lg:h-61 xl:w-72 xl:h-73 object-cover ${
            isMobile ? 'rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)]' : 'rounded-lg'
          }`}
          style={!isMobile ? { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' } : undefined}
        />
      </div>
    </div>
  );
};

export default ProductItem;