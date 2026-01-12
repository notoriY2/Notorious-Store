import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { Product } from '../types/Product';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (id: string) => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  onProductClick?: (product: Product) => void;
}

const Wishlist = React.forwardRef<HTMLDivElement, WishlistProps>(({ 
  isOpen, 
  onClose, 
  items, 
  onRemoveItem, 
  onAddToCart,
  formatPrice,
  onProductClick
}, ref) => {
  const [animatingButtons, setAnimatingButtons] = useState<Set<string>>(new Set());
  const [addedToCartButtons, setAddedToCartButtons] = useState<Set<string>>(new Set());

  // Auto-animate buttons every 10 seconds
  useEffect(() => {
    if (items.length === 0) return;
    
    const interval = setInterval(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setAnimatingButtons(prev => new Set(prev).add(randomItem.id));
      
      setTimeout(() => {
        setAnimatingButtons(prev => {
          const newSet = new Set(prev);
          newSet.delete(randomItem.id);
          return newSet;
        });
      }, 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, [items]);

  const handleProductClick = (product: Product) => {
    onClose();
    setTimeout(() => {
      onProductClick?.(product);
    }, 100);
  };

  const handleAddToCart = async (item: Product) => {
    setAnimatingButtons(prev => new Set(prev).add(item.id));
    
    // Add to cart
    onAddToCart(item);
    
    // Show success state immediately
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
      setAddedToCartButtons(prev => new Set(prev).add(item.id));
    }, 300);
    
    // Remove from wishlist and reset success state after showing success
    setTimeout(() => {
      onRemoveItem(item.id);
      setAddedToCartButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" 
      ref={ref}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-wide">Wishlist</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-light">Your wishlist is empty</p>
              <p className="text-sm text-gray-400 mt-2">Save items you love</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-100 bg-white">
                  <div className="flex items-start space-x-4 p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover flex-shrink-0"
                      onClick={() => handleProductClick(item)}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-gray-900 truncate cursor-pointer transition-colors"
                        onClick={() => handleProductClick(item)}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#DDA743'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                      >
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">{formatPrice(item.price)}</p>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`text-sm px-4 py-2 font-light tracking-wide transition-all duration-300 transform ${
                          addedToCartButtons.has(item.id)
                            ? 'bg-green-500 text-white animate-bounce'
                            : animatingButtons.has(item.id)
                            ? 'bg-black text-white animate-pulse scale-105'
                            : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                        }`}
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                      >
                        {addedToCartButtons.has(item.id) ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
      </div>
    </div>
  );
});

Wishlist.displayName = 'Wishlist';

export default Wishlist;