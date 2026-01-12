import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Grid3X3, Sparkles, Instagram, Heart } from 'lucide-react';
import { Product, CartItem } from '../types/Product';
import ProductItem from './ProductItem';
import ProductGrid from './ProductGrid';
import CurrencySelector from './CurrencySelector';
import { Currency } from '../hooks/useCurrency';
import { User as UserType } from '../hooks/useAuth';
import { Product as ProductType } from '../types/Product';

interface ProductFloorProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onProductClick: (product: Product) => void;
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  user: UserType | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  wishlistItems: ProductType[];
  onToggleWishlist: (product: ProductType) => void;
  onOpenWishlist: () => void;
}

const ProductFloor: React.FC<ProductFloorProps> = ({
  products,
  cartItems,
  onAddToCart,
  onOpenCart,
  onProductClick,
  currencies,
  selectedCurrency,
  onCurrencyChange,
  formatPrice,
  user,
  onAuthClick,
  onSignOut,
  wishlistItems,
  onToggleWishlist,
  onOpenWishlist,
}) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const [viewMode, setViewMode] = useState<'floor' | 'grid'>('floor');
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [showFooter, setShowFooter] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Animate products loading one by one
  useEffect(() => {
    setVisibleProducts([]);
    const timer = setTimeout(() => {
      products.forEach((product, index) => {
        setTimeout(() => {
          setVisibleProducts(prev => [...prev, product]);
        }, index * 100); // 100ms delay between each product (total ~2 seconds for 21 products)
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [products]);

  // Handle window resize to update product positions
  useEffect(() => {
    const handleResize = () => {
      // Force re-render when screen size changes
      setVisibleProducts([]);
      setTimeout(() => {
        setVisibleProducts(products);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);

  // Handle scroll for footer visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show footer when near bottom of page
      const isNearBottom = currentScrollY + windowHeight >= documentHeight - 100;
      
      setShowFooter(isNearBottom);
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleProductHover = (product: Product | null) => {
    setHoveredProduct(product);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100 px-2 sm:px-4 md:px-6">
        <div className="flex items-center justify-between py-2 sm:py-4 md:py-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <img
    src="/logo/1a.jpg"
    alt="Notorious Y2"
    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
  />
            <h1 className="hidden sm:block text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: '100' }}>
              NOTORIous.Y2
            </h1>
            <h1 className="sm:hidden text-sm font-light tracking-[0.15em] text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: '100' }}>
              Y2
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <CurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={onCurrencyChange}
            />
            
            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('floor')}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  viewMode === 'floor' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Sparkles size={14} />
                <span>FLOOR</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Grid3X3 size={14} />
                <span>GRID</span>
              </button>
            </div>
            
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('floor')}
                className={`p-1 rounded-sm transition-all duration-200 ${
                  viewMode === 'floor' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Sparkles size={12} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-sm transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Grid3X3 size={12} />
              </button>
            </div>
            
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Hello, {user.name}</span>
                  <button
                    onClick={onSignOut}
                    className="text-xs text-gray-600 hover:text-black transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  className="hidden md:flex items-center space-x-1 px-2 py-1 text-xs hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={onAuthClick}
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
                <button
                  className="md:hidden p-1 hover:bg-gray-50 rounded-full transition-colors duration-200"
                  onClick={onAuthClick}
                >
                  <User size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
                </button>
              </>
            )}
            
            <button
              onClick={onOpenWishlist}
              data-wishlist-button
              className="relative p-1 sm:p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
            >
              <Heart size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center font-medium" style={{ fontSize: '10px' }}>
                  {wishlistCount}
                </span>
              )}
            </button>
            
            <button
              onClick={onOpenCart}
              data-cart-button
              className="relative p-1 sm:p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
            >
              <ShoppingBag size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center font-medium" style={{ fontSize: '10px' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Product Floor */}
      <div className={`pt-12 sm:pt-14 md:pt-20 relative ${viewMode === 'floor' ? 'pb-20 sm:pb-24' : 'pb-12 sm:pb-16'}`}>
        {/* Floor surface with subtle texture */}
        <div className={`absolute inset-0 ${viewMode === 'floor' ? 'bg-gradient-to-b from-gray-50/30 to-white' : 'bg-white'}`}></div>
        
        {viewMode === 'floor' ? (
          /* Products scattered on floor with luxury spacing */
          <div className="relative w-full px-0" style={{ height: 'calc(150vh - 60px)', marginBottom: '15px' }}>
            {visibleProducts.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
                onHover={handleProductHover}
              />
            ))}
          </div>
        ) : (
          /* Grid layout */
          <div className="px-0" style={{ marginBottom: '15px' }}>
            <ProductGrid
              products={visibleProducts}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              formatPrice={formatPrice}
              onHover={handleProductHover}
            />
          </div>
        )}
      </div>

      {/* Cursor-following tooltip */}
      {hoveredProduct && (
        <div
          className="fixed pointer-events-none z-50 bg-white px-3 py-2 text-sm font-light tracking-[0.2em] text-black border border-black"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 10,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: '100',
          }}
        >
          {hoveredProduct.name.toUpperCase()}
        </div>
      )}

      {/* Brand footer with Instagram */}
      <footer className={`fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-100 z-30 transition-transform duration-300 ${
        showFooter ? 'translate-y-0' : 'translate-y-full'
      } px-2 sm:px-4`}>
        <div className="max-w-7xl mx-auto py-1 sm:py-2 md:py-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-1 sm:mb-2 md:mb-4">
            {/* Newsletter Signup */}
            <div>
              <h3 className="text-xs font-medium mb-1 sm:mb-2 md:mb-3 tracking-[0.05em] sm:tracking-[0.1em]">JOIN OUR MAIL LIST</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 text-xs border border-gray-300 rounded-l-md focus:outline-none focus:border-black"
                />
                <button className="px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 bg-black text-white text-xs rounded-r-md hover:bg-gray-800 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xs font-medium mb-1 sm:mb-2 md:mb-3 tracking-[0.05em] sm:tracking-[0.1em]">FOLLOW US</h3>
              <div className="flex space-x-1 sm:space-x-2 md:space-x-3">
                <a href="https://youtube.com/@notori.Y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com/@notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">
                  <Instagram size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </a>
                <a href="https://twitter.com/@notoriY2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://pinterest.com/notoriy2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-500 transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-xs font-medium mb-1 sm:mb-2 md:mb-3 tracking-[0.05em] sm:tracking-[0.1em]">WE ACCEPT</h3>
              <div className="grid grid-cols-5 gap-0.5 sm:gap-1 md:gap-2">
                {/* Visa */}
                <div className="bg-white border border-gray-200 rounded p-0.5 sm:p-1 md:p-2 flex items-center justify-center shadow-sm h-4 sm:h-5 md:h-8">
                  <svg viewBox="0 0 48 32" className="w-full h-full">
                    <rect width="48" height="32" fill="#1A1F71"/>
                    <path d="M19.8 11.3L17 20.7H14.5L12.9 13.6C12.8 13.1 12.5 12.7 12 12.4C11.1 11.9 10 11.5 9 11.2L9.3 11.3H13.4C14 11.3 14.5 11.9 14.6 12.5L15.6 17.6L18.5 11.3H19.8ZM26.2 20.7H23.9L25.7 11.3H28L26.2 20.7ZM33.7 14.9C33.7 14.3 33.2 13.9 32.3 13.5C31.7 13.2 31.3 12.9 31.3 12.5C31.3 12.3 31.7 11.9 32.4 11.9C33 11.9 33.5 12.1 34 12.3L34.3 11.5C33.9 11.2 33.1 11.1 32.4 11.1C30.5 11.1 29.2 12.1 29.2 13.6C29.2 14.7 30.1 15.3 30.7 15.7C31.3 16.1 31.6 16.4 31.6 16.8C31.6 17.3 31 17.6 30.4 17.6C29.6 17.6 28.9 17.3 28.3 16.9L28 17.8C28.6 18.1 29.4 18.4 30.3 18.4C32.4 18.4 33.7 17.3 33.7 15.9V14.9ZM39.8 20.7H37.8L38.2 19.6H35.5L35 20.7H33.1L36.1 11.3H38L39.8 20.7ZM37 13.6L36.1 17.5H37.8L37 13.6Z" fill="white"/>
                  </svg>
                </div>
                
                {/* Mastercard */}
                <div className="bg-white border border-gray-200 rounded p-0.5 sm:p-1 md:p-2 flex items-center justify-center shadow-sm h-4 sm:h-5 md:h-8">
                  <svg viewBox="0 0 48 32" className="w-full h-full">
                    <rect width="48" height="32" fill="white"/>
                    <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                    <circle cx="30" cy="16" r="10" fill="#FF5F00"/>
                    <path d="M24 8C26 10.4 27 13.1 27 16C27 18.9 26 21.6 24 24C22 21.6 21 18.9 21 16C21 13.1 22 10.4 24 8Z" fill="#FF5F00"/>
                  </svg>
                </div>
                
                {/* American Express */}
                <div className="bg-white border border-gray-200 rounded p-0.5 sm:p-1 md:p-2 flex items-center justify-center shadow-sm h-4 sm:h-5 md:h-8">
                  <svg viewBox="0 0 48 32" className="w-full h-full">
                    <rect width="48" height="32" fill="#006FCF"/>
                    <path d="M6.5 12.5H9L10 14.5L11 12.5H13.5L11.8 15.5L13.5 18.5H11L10 16.5L9 18.5H6.5L8.2 15.5L6.5 12.5Z" fill="white"/>
                    <path d="M15 12.5H19.5V13.5H16V14.5H19V15.5H16V17.5H19.5V18.5H15V12.5Z" fill="white"/>
                    <path d="M21 12.5H24.5C25.3 12.5 26 13.2 26 14V17C26 17.8 25.3 18.5 24.5 18.5H21V12.5ZM22 13.5V17.5H24.5C24.8 17.5 25 17.3 25 17V14C25 13.7 24.8 13.5 24.5 13.5H22Z" fill="white"/>
                    <path d="M28 12.5H32.5V13.5H29V14.5H32V15.5H29V17.5H32.5V18.5H28V12.5Z" fill="white"/>
                    <path d="M34 12.5H37.5L39 14.5L40.5 12.5H44L41.5 15.5L44 18.5H40.5L39 16.5L37.5 18.5H34L36.5 15.5L34 12.5Z" fill="white"/>
                  </svg>
                </div>
                
                {/* PayPal */}
                <div className="bg-white border border-gray-200 rounded p-0.5 sm:p-1 md:p-2 flex items-center justify-center shadow-sm h-4 sm:h-5 md:h-8">
                  <svg viewBox="0 0 48 32" className="w-full h-full">
                    <rect width="48" height="32" fill="white"/>
                    <path d="M14 8H20C22.8 8 24.5 9.5 24.5 12.5C24.5 16 22.5 18 19.5 18H16.5L15.5 22H12.5L14 8ZM16.8 15.5H19C20.5 15.5 21.5 14.8 21.5 13.2C21.5 12.2 20.8 11.5 19.5 11.5H17.5L16.8 15.5Z" fill="#003087"/>
                    <path d="M25 8H31C33.8 8 35.5 9.5 35.5 12.5C35.5 16 33.5 18 30.5 18H27.5L26.5 22H23.5L25 8ZM27.8 15.5H30C31.5 15.5 32.5 14.8 32.5 13.2C32.5 12.2 31.8 11.5 30.5 11.5H28.5L27.8 15.5Z" fill="#009CDE"/>
                  </svg>
                </div>
                
                {/* Apple Pay */}
                <div className="bg-white border border-gray-200 rounded p-0.5 sm:p-1 md:p-2 flex items-center justify-center shadow-sm h-4 sm:h-5 md:h-8">
                  <svg viewBox="0 0 48 32" className="w-full h-full">
                    <rect width="48" height="32" fill="black"/>
                    <path d="M19.8 11.3C19.4 11.3 19 11.6 18.8 11.9C18.5 12.3 18.2 12.8 18.4 13.3C18.9 13.3 19.3 13.1 19.5 12.8C19.8 12.4 19.9 11.9 19.8 11.3ZM19.5 13.5C18.7 13.5 18.1 13.9 17.7 13.9C17.2 13.9 16.7 13.5 16.1 13.5C15.1 13.5 14.3 14.0 13.9 14.8C13.0 16.4 13.6 18.8 14.5 20.1C14.9 20.8 15.5 21.5 16.1 21.5C16.6 21.5 16.9 21.1 17.7 21.1C18.4 21.1 18.7 21.5 19.3 21.5C19.9 21.5 20.4 20.9 20.8 20.3C21.3 19.5 21.5 18.8 21.5 18.7C21.5 18.7 20.6 18.3 20.6 17.2C20.6 16.3 21.2 15.7 21.2 15.7C20.7 14.9 19.9 13.5 19.5 13.5Z" fill="white"/>
                    <path d="M26.4 11.3V20.7H28.2V17.3H30.6C32.4 17.3 33.6 16.0 33.6 14.0S32.4 11.3 30.6 11.3H26.4V11.3ZM28.2 12.6H30.3C31.3 12.6 32.0 13.3 32.0 14.0S31.3 14.7 30.3 14.7H28.2V12.6Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright  */}
          <div className="border-t border-gray-200 pt-1 sm:pt-2 md:pt-4">
            <p className="text-xs tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] font-light text-center" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#C44D2B', fontSize: '10px' }}>
              © 2025 NOTORIOUS.Y2 • CRAFTED FOR THE DISCERNING • TIMELESS ELEGANCE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductFloor;