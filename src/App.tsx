import {
  useEffect,
  useRef,
  useState,
} from 'react';

import SplashScreen from './components/SplashScreen';
import ProductFloor from './components/ProductFloor';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import AuthModal from './components/AuthModal';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import { lazy, Suspense } from 'react';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
import MyAccount from './components/MyAccount';

import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { useCurrency } from './hooks/useCurrency';
import { useWishlist } from './hooks/useWishlist';
import { useProducts } from './hooks/useProducts';

import type { Product } from './types/Product';

import BannerCollection from './components/BannerCollection';
import type { StorefrontBanner } from './data/banners';

import { trackEvent } from './lib/analytics';
import MobileTabBar from './components/MobileTabBar';

function App() {
  /* =========================================================
     UI STATE
  ========================================================= */

  const [showSplash, setShowSplash] = useState(true);
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor');

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(
    null
  );

  const [
    isProductDetailOpen,
    setIsProductDetailOpen,
  ] = useState(false);

  const [
    isAuthModalOpen,
    setIsAuthModalOpen,
  ] = useState(false);

  const [
    authContextMessage,
    setAuthContextMessage,
  ] = useState<string | undefined>();

  const [
    isWishlistOpen,
    setIsWishlistOpen,
  ] = useState(false);

  const [
    isCheckoutOpen,
    setIsCheckoutOpen,
  ] = useState(false);

  const [
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
  ] = useState(false);

  const [
    isMyAccountOpen,
    setIsMyAccountOpen,
  ] = useState(false);

  const [
    selectedBanner,
    setSelectedBanner,
  ] = useState<StorefrontBanner | null>(
    null
  );

  const [
    isBannerCollectionOpen,
    setIsBannerCollectionOpen,
  ] = useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const cartRef =
    useRef<HTMLDivElement>(null);

  const wishlistRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     DATA HOOKS
  ========================================================= */

  const {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
  } = useAuth();

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
  } = useCart(user?.id ?? null);

  const {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    formatPrice,
  } = useCurrency();

  const {
    wishlistItems,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist(user?.id ?? null);

  useEffect(() => {
    trackEvent('page_view');
  }, []);

  /* =========================================================
     SPLASH SCREEN
  ========================================================= */

  useEffect(() => {
    const t = window.setTimeout(() => setShowSplash(false), 3000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const maxTimer = window.setTimeout(() => setShowSplash(false), 6000);
    return () => window.clearTimeout(maxTimer);
  }, []);

  /* =========================================================
     PRODUCT NAVIGATION
  ========================================================= */

  const handleProductClick = (
    product: Product
  ) => {
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);

    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  const handleCloseProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProduct(null);
  };

  /* =========================================================
     CART
  ========================================================= */

  const handleOpenCart = () => {
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);

    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleCartProductClick = (product: Product) => {
    handleProductClick(product);
    setIsCartOpen(false);
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleOpenWishlist = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);

    setIsWishlistOpen(true);
  };

  const handleCloseWishlist = () => {
    setIsWishlistOpen(false);
  };

  const handleWishlistProductClick = (product: Product) => {
    handleProductClick(product);
    setIsWishlistOpen(false);
  };

  /* =========================================================
     BANNER COLLECTION
  ========================================================= */

  const handleBannerClick = (
    banner: StorefrontBanner
  ) => {
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);
    setIsProductDetailOpen(false);

    setSelectedBanner(banner);
    setIsBannerCollectionOpen(true);
  };

  const handleBannerCollectionProductClick = (product: Product) => {
    handleProductClick(product);
    setIsBannerCollectionOpen(false);
    setSelectedBanner(null);
  };

  /* =========================================================
     HERO COLLECTION
  ========================================================= */

  const handleHeroClick = (
    productIds: string[],
    title: string
  ) => {
    const heroProducts =
      products.filter(
        (product) =>
          productIds.includes(product.id)
      );

    if (heroProducts.length === 0) {
      return;
    }

    const heroBanner =
      {
        id: 'hero-section',
        title,
        image: '',
        position: 'Top' as const,
        products: heroProducts,
        productIds,
      } as StorefrontBanner & {
        productIds: string[];
      };

    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);
    setIsProductDetailOpen(false);

    setSelectedBanner(heroBanner);
    setIsBannerCollectionOpen(true);
  };

  const handleCloseBannerCollection = () => {
    setIsBannerCollectionOpen(false);
    setSelectedBanner(null);
  };

  /* =========================================================
     CHECKOUT
  ========================================================= */

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsProductDetailOpen(false);

    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleBackToShopping = () => {
    setIsCheckoutOpen(false);
  };

  /* =========================================================
     AUTH
  ========================================================= */

  const handleOpenAuth = (message?: string) => {
    setAuthContextMessage(message);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  /* =========================================================
     ADMIN
  ========================================================= */

  const handleOpenAdminDashboard = () => {
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);
    setIsProductDetailOpen(false);

    setIsAdminDashboardOpen(true);
  };

  const handleCloseAdminDashboard = () => {
    setIsAdminDashboardOpen(false);
  };

  /* =========================================================
     MY ACCOUNT
  ========================================================= */

  const handleOpenMyAccount = () => {
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(false);
    setIsProductDetailOpen(false);

    setIsMyAccountOpen(true);
  };

  const handleCloseMyAccount = () => {
    setIsMyAccountOpen(false);
  };

  /* =========================================================
     OUTSIDE CLICK HANDLER
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        isCartOpen &&
        cartRef.current &&
        !cartRef.current.contains(target)
      ) {
        const cartButton =
          document.querySelector(
            '[data-cart-button]'
          );

        if (
          !cartButton ||
          !cartButton.contains(target)
        ) {
          setIsCartOpen(false);
        }
      }

      if (
        isWishlistOpen &&
        wishlistRef.current &&
        !wishlistRef.current.contains(target)
      ) {
        const wishlistButton =
          document.querySelector(
            '[data-wishlist-button]'
          );

        if (
          !wishlistButton ||
          !wishlistButton.contains(target)
        ) {
          setIsWishlistOpen(false);
        }
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [
    isCartOpen,
    isWishlistOpen,
  ]);

  /* =========================================================
     CART COUNT
  ========================================================= */

  const cartItemsCount =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <ProductFloor
        products={products}
        isLoading={productsLoading}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onOpenCart={handleOpenCart}
        onProductClick={handleProductClick}
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        formatPrice={formatPrice}
        user={user}
        onAuthClick={handleOpenAuth}
        onSignOut={signOut}
        wishlistItems={wishlistItems}
        onToggleWishlist={toggleWishlist}
        onOpenWishlist={handleOpenWishlist}
        onOpenAdminDashboard={
          handleOpenAdminDashboard
        }
        onOpenMyAccount={
          handleOpenMyAccount
        }
        onBannerClick={
          handleBannerClick
        }
        onHeroClick={
          handleHeroClick
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ProductDetail
        product={selectedProduct}
        allProducts={products}
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
        onAuthClick={handleOpenAuth}
        onSignOut={signOut}
        wishlistItems={wishlistItems}
        cartItems={cartItems}
        isCartOpen={isCartOpen}
        onOpenCart={handleOpenCart}
        onCloseCart={handleCloseCart}
        onUpdateCartQuantity={
          updateQuantity
        }
        onRemoveCartItem={removeItem}
        onOpenWishlist={
          handleOpenWishlist
        }
        cartItemsCount={cartItemsCount}
        onProductClick={handleProductClick}
        onOpenAdminDashboard={
          handleOpenAdminDashboard
        }
        onOpenMyAccount={
          handleOpenMyAccount
        }
      />

      {isBannerCollectionOpen && (
        <BannerCollection
          banner={selectedBanner}
          isOpen={isBannerCollectionOpen}
          onClose={
            handleCloseBannerCollection
          }
          onProductClick={
            handleBannerCollectionProductClick
          }
          onAddToCart={addToCart}
          formatPrice={formatPrice}
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={
            setSelectedCurrency
          }
          user={user}
          onAuthClick={handleOpenAuth}
          wishlistItems={wishlistItems}
          onOpenWishlist={
            handleOpenWishlist
          }
          cartItemsCount={cartItemsCount}
          onOpenCart={handleOpenCart}
          onOpenAdminDashboard={
            handleOpenAdminDashboard
          }
          onOpenMyAccount={
            handleOpenMyAccount
          }
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          handleCloseAuth();
          setAuthContextMessage(undefined);
        }}
        onSignIn={signIn}
        onSignUp={signUp}
        onSignInWithProvider={
          signInWithProvider
        }
        isLoading={isLoading}
        contextMessage={authContextMessage}
      />

      <Wishlist
        ref={wishlistRef}
        isOpen={isWishlistOpen}
        onClose={handleCloseWishlist}
        items={wishlistItems}
        onRemoveItem={
          removeFromWishlist
        }
        onAddToCart={addToCart}
        formatPrice={formatPrice}
        onProductClick={
          handleWishlistProductClick
        }
      />

      <Cart
        ref={cartRef}
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        items={cartItems}
        onUpdateQuantity={
          updateQuantity
        }
        onRemoveItem={removeItem}
        formatPrice={formatPrice}
        onProductClick={
          handleCartProductClick
        }
        onAddToCart={addToCart}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        items={cartItems}
        formatPrice={formatPrice}
        onBackToShopping={
          handleBackToShopping
        }
        user={user}
        onAuthClick={handleOpenAuth}
        onSignIn={signIn}
        onSignUp={signUp}
        onSignInWithProvider={
          signInWithProvider
        }
        isAuthLoading={isLoading}
      />

      {isAdminDashboardOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[60] bg-white" />}>
          <AdminDashboard
            isOpen={isAdminDashboardOpen}
            onClose={handleCloseAdminDashboard}
            user={user}
            onSignOut={signOut}
          />
        </Suspense>
      )}

      <MyAccount
        isOpen={isMyAccountOpen}
        onClose={handleCloseMyAccount}
        user={user}
        onSignOut={signOut}
      />

      <MobileTabBar
        activeTab="shop"
        wishlistCount={wishlistItems.length}
        cartCount={cartItemsCount}
        user={user}
        onShopClick={() => {
          setViewMode('floor');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onWishlistClick={handleOpenWishlist}
        onCartClick={handleOpenCart}
        onAccountClick={user ? handleOpenMyAccount : () => handleOpenAuth()}
      />

      <SplashScreen
        isVisible={showSplash}
      />
    </>
  );
}

export default App;