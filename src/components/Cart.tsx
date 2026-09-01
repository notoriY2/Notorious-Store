import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types/Product';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (uniqueId: string, quantity: number) => void;
  onRemoveItem: (uniqueId: string) => void;
  formatPrice: (price: number) => string;
  onProductClick?: (product: any) => void;
  onAddToCart: (product: any) => void;
  onCheckout: () => void;
}

const Cart = React.forwardRef<HTMLDivElement, CartProps>(({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  formatPrice,
  onProductClick,
  onCheckout
}, ref) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div 
      className="fixed inset-x-0 top-0 mobile-drawer-overlay bg-transparent z-[57] flex items-end lg:items-stretch lg:justify-end pointer-events-none" 
      ref={ref}
    >
      {/* Invisible/backdrop layer that catches clicks outside the drawer to close it */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto"
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
                Your Cart
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {items.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-800 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add items to your cart to start shopping.</p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {items.map((item) => (
                <div key={item.uniqueId} className="flex items-start gap-3 p-3 rounded-2xl lg:p-0 lg:rounded-none bg-gray-50/60 lg:bg-transparent">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 lg:w-20 lg:h-20 object-cover rounded-xl lg:rounded-none cursor-pointer flex-shrink-0"
                    onClick={() => onProductClick?.(item)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-gray-900 truncate cursor-pointer mb-1"
                      onClick={() => onProductClick?.(item)}
                      style={{
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DDA743'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                    >
                      {item.name}
                    </h3>
                    {item.selectedColor && (
                      <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                    )}
                    {item.selectedSize && (
                      <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-3">{formatPrice(item.price)}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.uniqueId, Math.max(0, item.quantity - 1))}
                          className="w-9 h-9 flex items-center justify-center active:bg-gray-100 cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.uniqueId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center active:bg-gray-100 cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.uniqueId)}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Subtotal:</span>
              <span className="text-lg font-medium">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Taxes and shipping calculated at checkout
            </p>
            <button
              onClick={onCheckout}
              className="w-full bg-black text-white py-3 font-light tracking-wide hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

Cart.displayName = 'Cart';

export default Cart;