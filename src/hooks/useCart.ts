import { useState, useCallback } from 'react';
import { Product, CartItem } from '../types/Product';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, selectedSize?: string, selectedColor?: string) => {
    setCartItems(prev => {
      // Create a unique identifier that includes size and color for the same product
      const uniqueId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
      const existing = prev.find(item => item.uniqueId === uniqueId);
      
      if (existing) {
        return prev.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        uniqueId,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
      }];
    });
  }, []);

  const updateQuantity = useCallback((uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.uniqueId === uniqueId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((uniqueId: string) => {
    setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
  }, []);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
  };
};