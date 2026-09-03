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
  
  // Less negative X translation on desktop shifts products to the right
  const translateX = isMobile ? '-28%' : '-17%';
  
  return (
    <div
      className="absolute cursor-pointer group active:scale-95 transition-transform duration-150"
      onClick={() => onProductClick(product)}
      onMouseEnter={() => onHover(product)}
      onMouseLeave={() => onHover(null)}
      style={{
        top: position.top,
        left: position.left,
        transform: `translate(${translateX}, 0) rotate(${product.rotation}deg) scale(${product.scale * 0.8})`,
        zIndex: product.zIndex,
      }}
    >
      {/* Mobile size stays w-44 h-44; desktop container size increased to w-64 h-64 */}
      <div className="relative m-3 md:m-6 w-44 h-44 md:w-72 md:h-72 flex items-center justify-center">
        {isMobile && (
          <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-b from-white/70 to-transparent blur-sm -z-10" />
        )}
        
        <img
          src={product.image}
          alt={product.name}
          width="300"
          height="400"
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover shadow-sm ${
            isMobile ? 'rounded-2xl' : 'rounded-lg'
          }`}
        />
      </div>
    </div>
  );
};

export default ProductItem;