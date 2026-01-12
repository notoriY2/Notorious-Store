import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
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
  onAddToCart,
  onCheckout
}, ref) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={ref}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light tracking-wide">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-light">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.uniqueId} className="flex items-start space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover cursor-pointer"
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
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onUpdateQuantity(item.uniqueId, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.uniqueId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.uniqueId)}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors"
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
              className="w-full bg-black text-white py-3 font-light tracking-wide hover:bg-gray-800 transition-colors"
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