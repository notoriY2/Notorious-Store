import React from 'react';
import { Product } from '../types/Product';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  formatPrice: (price: number) => string;
  onHover: (product: Product | null) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCart, 
  onProductClick,
  formatPrice,
  onHover
}) => {
  return (
    <div className="w-full py-8 bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer relative border-r border-b border-gray-200"
            onClick={() => onProductClick(product)}
            onMouseEnter={() => onHover(product)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="bg-white overflow-hidden p-2 sm:p-4 md:p-8" style={{ aspectRatio: '1/1.6' }}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Secondary image overlay on hover */}
              <img
                src={product.image}
                alt={`${product.name} - Secondary`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 sm:p-4 md:p-8"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;