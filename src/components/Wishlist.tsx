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

const Wishlist = React.forwardRef<HTMLDivElement, WishlistProps>((({ 
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
      className="fixed inset-x-0 top-0 mobile-drawer-overlay bg-transparent z-[57] flex items-end lg:items-stretch lg:justify-end pointer-events-none" 
      ref={ref}
    >
      {/* Invisible backdrop layer that catches clicks outside the drawer to close it */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      <div 
        className="
          relative bg-white w-full shadow-2xl flex flex-col pointer-events-auto
          rounded-t-[28px] max-h-[88dvh]
          lg:rounded-none lg:max-h-none lg:h-full lg:max-w-md
          animate-[sheetUp_260ms_ease-out]
        "
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* mobile-only drag handle */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 lg:p-6 border-b border-gray-100 lg:border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg lg:text-2xl font-medium lg:font-light tracking-wide">
                Wishlist
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {items.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-800 font-medium">Your wishlist is empty</p>
              <p className="text-sm text-gray-400 mt-1">Tap the heart on any item to save it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl lg:p-4 lg:rounded-none bg-gray-50/60 lg:bg-white lg:border lg:border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 lg:w-20 lg:h-20 object-cover rounded-xl lg:rounded-none flex-shrink-0 cursor-pointer"
                    onClick={() => handleProductClick(item)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-gray-900 truncate cursor-pointer transition-colors mb-1"
                      onClick={() => handleProductClick(item)}
                      style={{
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DDA743'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{formatPrice(item.price)}</p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`text-sm px-4 py-2 font-light tracking-wide transition-all duration-300 transform cursor-pointer ${
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
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
      </div>
    </div>
  );
}));

Wishlist.displayName = 'Wishlist';

export default Wishlist;