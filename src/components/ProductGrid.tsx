// src/components/ProductGrid.tsx
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
            <div
              className="relative bg-white overflow-hidden p-2 sm:p-4 md:p-8"
              style={{ aspectRatio: '1/1.6' }}
            >
              {/* NORMAL: first image in images[] — e.g. /products/1a.png */}
              <img
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover p-2 sm:p-4 md:p-8 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              />

              {/* HOVER: product.image — e.g. /products/1.png */}
              <img
                src={product.image}
                alt={`${product.name} - Original`}
                className="absolute inset-0 w-full h-full object-cover p-2 sm:p-4 md:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
