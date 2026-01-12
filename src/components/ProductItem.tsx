import React from 'react';
import { Product } from '../types/Product';

interface ProductItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onHover: (product: Product | null) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onAddToCart, onProductClick, onHover }) => {
  // Use mobile position on small screens, fallback to regular position
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
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
        {/* Main product image */}
        <img
          src={product.image}
          alt={product.name}
          className="mobile-floor-product md:w-48 md:h-49 lg:w-60 lg:h-61 xl:w-72 xl:h-73 object-cover rounded-lg"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
          }}
        />
        
        {/* Floor reflection effect */}
        <div 
          className="absolute top-full left-0 w-full h-full opacity-20 pointer-events-none"
          style={{
            background: `url(${product.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'scaleY(-1) translateY(-2px)',
            filter: 'blur(1px)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 60%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};

export default ProductItem;