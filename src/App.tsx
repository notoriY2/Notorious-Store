import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import ProductFloor from './components/ProductFloor';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import AuthModal from './components/AuthModal';
import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { useWishlist } from './hooks/useWishlist';
import { products, Product } from './data/products';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const { cartItems, addToCart, updateQuantity, removeItem } = useCart();
  const { user, isLoading, signIn, signUp, signInWithProvider, signOut } = useAuth();
  const { currencies, selectedCurrency, setSelectedCurrency, formatPrice } = useCurrency();
  const { wishlistItems, toggleWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Increased to 4.5 seconds (3 seconds + 1.5 seconds for full display)

    return () => clearTimeout(timer);
  }, []);

  const handleProductClick = (product: Product) => {
    // Close cart and wishlist when navigating to product
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handle clicks outside cart and wishlist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside cart and not on cart button
      if (isCartOpen && cartRef.current && !cartRef.current.contains(target)) {
        // Don't close if clicking on the cart button
        const cartButton = document.querySelector('[data-cart-button]');
        if (!cartButton || !cartButton.contains(target)) {
          setIsCartOpen(false);
        }
      }
      
      // Check if click is outside wishlist and not on wishlist button
      if (isWishlistOpen && wishlistRef.current && !wishlistRef.current.contains(target)) {
        // Don't close if clicking on the wishlist button
        const wishlistButton = document.querySelector('[data-wishlist-button]');
        if (!wishlistButton || !wishlistButton.contains(target)) {
          setIsWishlistOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, isWishlistOpen]);

  const handleCartProductClick = (product: any) => {
    setIsCartOpen(false);
    setTimeout(() => {
      handleProductClick(product);
    }, 100);
  };

  const handleWishlistProductClick = (product: any) => {
    setIsWishlistOpen(false);
    setTimeout(() => {
      handleProductClick(product);
    }, 100);
  };
  return (
    <>
      <SplashScreen isVisible={showSplash} />
      
      {!showSplash && (
        <>
          <ProductFloor
            products={products}
            cartItems={cartItems}
            onAddToCart={addToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onProductClick={handleCartProductClick}
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            formatPrice={formatPrice}
            user={user}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onSignOut={signOut}
            wishlistItems={wishlistItems}
            onToggleWishlist={toggleWishlist}
            onOpenWishlist={() => setIsWishlistOpen(true)}
          />
          
          <ProductDetail
            product={selectedProduct}
            isOpen={isProductDetailOpen}
            onClose={handleCloseProductDetail}
            onAddToCart={addToCart}
            formatPrice={formatPrice}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            user={user}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onSignOut={signOut}
            wishlistItems={wishlistItems}
            cartItems={cartItems}
            isCartOpen={isCartOpen}
            onOpenCart={() => setIsCartOpen(true)}
            onCloseCart={() => setIsCartOpen(false)}
            onUpdateCartQuantity={updateQuantity}
            onRemoveCartItem={removeItem}
            onOpenWishlist={() => setIsWishlistOpen(true)}
            cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onProductClick={handleProductClick}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSignIn={signIn}
            onSignUp={signUp}
            onSignInWithProvider={signInWithProvider}
            isLoading={isLoading}
          />

          <Wishlist
            ref={wishlistRef}
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            items={wishlistItems}
            onRemoveItem={removeFromWishlist}
            onAddToCart={addToCart}
            formatPrice={formatPrice}
            onProductClick={handleWishlistProductClick}
          />

          <Cart
            ref={cartRef}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            formatPrice={formatPrice}
            onProductClick={handleCartProductClick}
            onAddToCart={addToCart}
            onCheckout={handleCheckout}
          />

          <Checkout
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cartItems}
            formatPrice={formatPrice}
            onBackToShopping={() => {
              setIsCheckoutOpen(false);
              // Optionally open cart or go back to main page
            }}
            user={user}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onSignIn={signIn}
            onSignUp={signUp}
            onSignInWithProvider={signInWithProvider}
            isAuthLoading={isLoading}
          />
        </>
      )}
    </>
  );
}

export default App;