import { products } from '../data/products';

import React, { useState } from 'react';
import { X, Heart, Share2, Facebook, Twitter, Instagram, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ShoppingBag, User, MessageCircle } from 'lucide-react';
import { Product } from '../types/Product';
import ImageGallery from './ImageGallery';
import Cart from './Cart';
import CurrencySelector from './CurrencySelector';
import { Currency } from '../hooks/useCurrency';
import { User as UserType } from '../hooks/useAuth';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  user: UserType | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  wishlistItems: Product[];
  cartItems: any[];
  isCartOpen: boolean;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onUpdateCartQuantity: (uniqueId: string, quantity: number) => void;
  onRemoveCartItem: (uniqueId: string) => void;
  onOpenWishlist: () => void;
  cartItemsCount: number;
  onProductClick: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  formatPrice,
  onToggleWishlist,
  isInWishlist,
  currencies,
  selectedCurrency,
  onCurrencyChange,
  user,
  onAuthClick,
  onSignOut,
  wishlistItems,
  cartItems,
  isCartOpen,
  onOpenCart,
  onCloseCart,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onOpenWishlist,
  cartItemsCount,
  onProductClick,
}) => {
  const wishlistCount = wishlistItems.length;
  const [selectedSize, setSelectedSize] = useState(product?.category === 'top' ? 'MEDIUM' : '30');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Regent St Blue');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [currentRecommendationPage, setCurrentRecommendationPage] = useState(0);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize selected size based on product category
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.category === 'top' ? 'MEDIUM' : '30');
      setSelectedColor('Regent St Blue');
    }
  }, [product]);

  // Track mouse position for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (!isOpen || !product) return null;

  const colors = [
    { name: 'Regent St Blue', color: '#4A90E2', image: product.image },
    { name: 'Forest Green', color: '#228B22', image: product.image },
    { name: 'Burgundy Red', color: '#800020', image: product.image }
  ];

  // Size availability logic - some sizes/colors can be sold out
  const getSizeAvailability = (size: string) => {
    // Mock availability logic - you can customize this
    if (product.category === 'top') {
      return !(size === 'MEDIUM' && selectedColor === 'Forest Green'); // Medium Forest Green sold out
    } else {
      return !(size === '32' && selectedColor === 'Burgundy Red'); // Size 32 Burgundy Red sold out
    }
  };

  const getColorAvailability = (color: string) => {
    // Mock availability logic
    return !(color === 'Forest Green' && selectedSize === 'MEDIUM');
  };

  // Product images - exact dimensions 710x860px
  const getProductImages = () => {
    const selectedColorData = colors.find(c => c.name === selectedColor);
    const baseImage = selectedColorData?.image || product.image;
    return [
      baseImage, // Hero image
      baseImage, // Secondary image
      baseImage, // Thumbnail 1
      baseImage, // Thumbnail 2
    ];
  };

  const productImages = getProductImages();

  // Style with products - complementary items based on viewed product category
  const getStyleWithProducts = () => {
    // Get actual products from the home page data
    const homeProducts = products.filter(p => p.id !== product.id);

    // Filter out same category items and the current product
    if (product.category === 'top') {
      return homeProducts.filter(p => p.category !== 'top').slice(0, 4);
    } else if (product.category === 'bottom') {
      return homeProducts.filter(p => p.category !== 'bottom').slice(0, 4);
    } else {
      return homeProducts.filter(p => p.category !== 'accessory').slice(0, 4);
    }
  };

  // You may also like products - similar items in same category
  const getYouMayLikeProducts = () => {
    // Get actual products from the home page data
    const homeProducts = products.filter(p => p.id !== product.id);

    // Show similar items in same category
    return homeProducts.filter(p => p.category === product.category);
  };

  const styleWithProducts = getStyleWithProducts();
  const allRecommendations = getYouMayLikeProducts();

  // Product details based on the image
  const getProductFeatures = (product: Product) => {
    if (product.category === 'top') {
      return [
        '100% Cotton',
        'Regular Fit',
        'Machine Washable',
        'Imported',
        'Classic Design'
      ];
    } else if (product.category === 'bottom') {
      return [
        '100% Cotton Plaid',
        'Relaxed Fit',
        '6 Pockets (2 Front, 2 Back, 2 Leg)',
        'Button Flap Front & Back Welt Pockets',
        'Cargo Pockets',
        'Drawstring Hem',
        'Exposed Button Fly'
      ];
    } else {
      return [
        'Premium Materials',
        'Adjustable',
        'One Size Fits Most',
        'Durable Construction',
        'Stylish Design'
      ];
    }
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setAddToCartSuccess(false);
    
    // Add animation delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedSize, selectedColor);
    }
    
    // Show success animation
    setAddToCartSuccess(true);
    setTimeout(() => setAddToCartSuccess(false), 2000);
    
    setIsAddingToCart(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleWishlistToggle = (productToToggle: Product) => {
    onToggleWishlist(productToToggle);
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
  };

  const handleProductClick = (clickedProduct: any) => {
    // Close current modal and open the clicked product
    onClose();
    setTimeout(() => {
      onProductClick(clickedProduct);
    }, 100);
  };

  // Carousel logic - show 4 items at a time, slide one by one
  const visibleItems = 4;
  const maxSlides = 3; // Can slide 3 times to show items 5, 6, 7
  const totalPages = Math.ceil(allRecommendations.length / visibleItems);
  const youMayLikeProducts = allRecommendations.slice(
    currentRecommendationPage,
    currentRecommendationPage + visibleItems
  );

  const nextRecommendations = () => {
    setCurrentRecommendationPage((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevRecommendations = () => {
    setCurrentRecommendationPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto" onMouseMove={handleMouseMove}>
        <div className="min-h-screen">
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
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center font-medium" style={{ fontSize: '10px' }}>
                      {cartItemsCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </header>

          {/* Main Product Section with top padding for fixed header */}
          <div className="pt-12 sm:pt-14 md:pt-20 flex flex-col lg:flex-row">
            {/* Left Side - Images */}
            <div className="flex-1 lg:flex-none lg:w-2/3">
              {/* Top Row - Hero and Secondary Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                <div 
                  className="cursor-pointer"
                  onClick={() => openGallery(0)}
                  style={{ width: '100%', height: 'auto', aspectRatio: '4/6.4' }}
                >
                  <img
                    src={productImages[0]}
                    alt={`${product.name} - Hero`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => openGallery(1)}
                  style={{ width: '100%', height: 'auto', aspectRatio: '4/6.4' }}
                >
                  <img
                    src={productImages[1]}
                    alt={`${product.name} - Secondary`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Row - Thumbnails */}
              <div className="grid grid-cols-2 gap-0">
                <div 
                  className="cursor-pointer"
                  onClick={() => openGallery(2)}
                  style={{ width: '100%', height: 'auto', aspectRatio: '4/6.4' }}
                >
                  <img
                    src={productImages[2]}
                    alt={`${product.name} - View 3`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => openGallery(3)}
                  style={{ width: '100%', height: 'auto', aspectRatio: '4/6.4' }}
                >
                  <img
                    src={productImages[3]}
                    alt={`${product.name} - View 4`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="lg:w-1/3 p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-xl md:text-2xl font-light tracking-[0.1em] uppercase" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: '300' }}>
                      {product.name.toUpperCase()}
                    </h1>
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                    >
                      <Heart 
                        size={24} 
                        className={isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
                      />
                    </button>
                  </div>
                  <p className="text-xl md:text-2xl font-light">{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* Product Features - Dynamic based on category */}
              <div>
                <ul className="space-y-1 text-sm">
                  {getProductFeatures(product).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-light mb-3 tracking-wide text-sm md:text-base">COLOR <span className="font-normal">{selectedColor}</span></h3>
                <div className="flex space-x-3 mb-2">
                  {colors.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => handleColorChange(colorOption.name)}
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-200 ${
                        selectedColor === colorOption.name 
                          ? 'ring-2 ring-black ring-offset-2' 
                          : ''
                      }`}
                      style={{ backgroundColor: colorOption.color }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-light mb-3 tracking-wide text-sm md:text-base">SIZE <span className="font-normal">{selectedSize}</span></h3>
                {product.category === 'top' && (
                  <div className="flex space-x-2 mb-2">
                    {['SMALL', 'MEDIUM', 'LARGE'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2 text-center transition-colors text-sm border ${
                          selectedSize === size 
                            ? 'text-black font-medium bg-gray-100' 
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
                {product.category === 'bottom' && (
                <div className="flex space-x-2 mb-2">
                    {['28', '30', '32', '34', '36'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 text-center transition-colors text-sm border ${
                        selectedSize === size 
                          ? 'text-black font-medium bg-gray-100' 
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-light mb-3 tracking-wide text-sm md:text-base">QTY</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-sm md:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="relative">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.soldOut || !getSizeAvailability(selectedSize) || !getColorAvailability(selectedColor)}
                  className={`w-full py-3 md:py-4 font-light tracking-[0.2em] transition-all duration-300 border text-sm md:text-base transform ${
                    product.soldOut || !getSizeAvailability(selectedSize) || !getColorAvailability(selectedColor)
                      ? 'bg-gray-100 text-gray-500 border-gray-200' 
                      : addToCartSuccess
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-black text-white border-black hover:bg-gray-800 hover:scale-105'
                  } ${
                    product.soldOut || !getSizeAvailability(selectedSize) || !getColorAvailability(selectedColor)
                      ? 'cursor-not-allowed' 
                      : 'cursor-pointer'
                  } ${
                    isAddingToCart ? 'animate-pulse' : ''
                  }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  {product.soldOut || !getSizeAvailability(selectedSize) || !getColorAvailability(selectedColor)
                    ? 'SOLD OUT'
                    : addToCartSuccess 
                    ? '✓ ADDED TO BAG' 
                    : isAddingToCart 
                    ? 'ADDING...' 
                    : 'ADD TO BAG'
                  }
                </button>
                
                {/* Success animation overlay */}
                {addToCartSuccess && (
                  <div className="absolute inset-0 bg-green-500 text-white flex items-center justify-center font-light tracking-[0.2em] text-sm md:text-base animate-bounce">
                    ✓ ADDED TO BAG
                  </div>
                )}
              </div>

              {/* Share Social Links */}
              <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600 mr-2">Share:</span>
                <button
                  onClick={() => window.open(`https://instagram.com/share?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                >
                  <Instagram size={18} className="text-pink-600" />
                </button>
                <button
                  onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                >
                  <Facebook size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check out this ${product.name}`, '_blank')}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button
                  onClick={() => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=Check out this ${product.name}`, '_blank')}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Style With Section */}
          <div className="border-t border-gray-200 pt-8 md:pt-12 px-4 md:px-8">
            <h2 className="text-lg md:text-xl font-light mb-6 md:mb-8 tracking-[0.2em]" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              STYLE WITH
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {styleWithProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id} 
                  className="relative group cursor-pointer"
                  onClick={() => handleProductClick(relatedProduct)}
                  onMouseEnter={() => setHoveredProduct(relatedProduct)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="w-full overflow-hidden" style={{ aspectRatio: '3/5.6' }}>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {/* Secondary image overlay on hover */}
                    <img
                      src={relatedProduct.image}
                      alt={`${relatedProduct.name} - Secondary`}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(relatedProduct);
                    }}
                    className="absolute top-2 right-2 md:top-4 md:right-4 p-1 md:p-2 hover:scale-110 transition-all duration-200"
                  >
                    <Heart 
                      size={16} 
                      className="md:w-5 md:h-5"
                      style={{ 
                        color: isInWishlist(relatedProduct.id) ? '#C44D2B' : '#666',
                        fill: isInWishlist(relatedProduct.id) ? '#C44D2B' : 'none'
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* You May Also Like Section */}
          <div className="border-t border-gray-200 pt-8 md:pt-12 pb-8 md:pb-16 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-light tracking-[0.2em]" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                YOU MAY ALSO LIKE
              </h2>
              <div className="flex items-center space-x-2 md:space-x-4">
                <button 
                  onClick={prevRecommendations}
                  className="p-2 border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <ChevronLeft size={16} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={nextRecommendations}
                  className="p-2 border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <ChevronRight size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {youMayLikeProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id} 
                  className="relative group cursor-pointer"
                  onClick={() => handleProductClick(relatedProduct)}
                  onMouseEnter={() => setHoveredProduct(relatedProduct)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="w-full overflow-hidden" style={{ aspectRatio: '3/5.6' }}>
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(relatedProduct);
                    }}
                    className="absolute top-2 right-2 md:top-4 md:right-4 p-1 md:p-2 hover:scale-110 transition-all duration-200"
                  >
                    <Heart 
                      size={16} 
                      className="md:w-5 md:h-5"
                      style={{ 
                        color: isInWishlist(relatedProduct.id) ? '#C44D2B' : '#666',
                        fill: isInWishlist(relatedProduct.id) ? '#C44D2B' : 'none'
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 mb-30">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* Newsletter Signup */}
                <div>
                  <h3 className="text-sm font-medium mb-3 tracking-[0.1em]">JOIN OUR MAIL LIST</h3>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:border-black"
                    />
                    <button className="px-4 py-2 bg-black text-white text-sm rounded-r-md hover:bg-gray-800 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-sm font-medium mb-3 tracking-[0.1em]">FOLLOW US</h3>
                  <div className="flex space-x-3">
                    <a href="https://youtube.com/@notori.Y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    <a href="https://tiktok.com/@notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </a>
                    <a href="https://facebook.com/notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="https://instagram.com/notori.y2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">
                      <Instagram size={20} />
                    </a>
                    <a href="https://twitter.com/@notoriY2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href="https://pinterest.com/notoriy2" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-sm font-medium mb-3 tracking-[0.1em]">WE ACCEPT</h3>
                  <div className="flex space-x-3">
                    {/* Visa */}
                    <div className="bg-gray-100 p-2 rounded flex items-center justify-center" style={{ width: '40px', height: '24px' }}>
                      <svg viewBox="0 0 40 24" className="w-full h-full">
                        <rect width="40" height="24" fill="#1A1F71"/>
                        <path d="M16.5 8.5L14.2 15.5H12.1L10.9 10.2C10.8 9.8 10.6 9.5 10.2 9.3C9.5 8.9 8.6 8.6 7.8 8.4L8 8.5H11.2C11.7 8.5 12.1 8.9 12.2 9.4L13 13.2L15.4 8.5H16.5ZM21.8 15.5H19.9L21.4 8.5H23.3L21.8 15.5ZM28.1 11.2C28.1 10.7 27.7 10.4 26.9 10.1C26.4 9.9 26.1 9.7 26.1 9.4C26.1 9.2 26.4 8.9 27 8.9C27.5 8.9 27.9 9 28.3 9.2L28.6 8.6C28.2 8.4 27.6 8.3 27 8.3C25.4 8.3 24.3 9.1 24.3 10.2C24.3 11 25 11.5 25.5 11.8C26.1 12.1 26.3 12.3 26.3 12.6C26.3 13 25.8 13.2 25.3 13.2C24.7 13.2 24.1 13 23.6 12.7L23.3 13.3C23.8 13.6 24.5 13.8 25.2 13.8C27 13.8 28.1 13 28.1 11.9V11.2ZM33.2 15.5H31.5L31.8 14.7H29.6L29.2 15.5H27.6L30.1 8.5H31.6L33.2 15.5ZM30.8 10.2L30.1 13.1H31.5L30.8 10.2Z" fill="white"/>
                      </svg>
                    </div>
                    
                    {/* Maestro */}
                    <div className="bg-gray-100 p-2 rounded flex items-center justify-center" style={{ width: '40px', height: '24px' }}>
                      <svg viewBox="0 0 40 24" className="w-full h-full">
                        <rect width="40" height="24" fill="white"/>
                        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                        <circle cx="25" cy="12" r="7" fill="#00A2E5"/>
                        <path d="M20 7.5C21.5 8.8 22.5 10.3 22.5 12C22.5 13.7 21.5 15.2 20 16.5C18.5 15.2 17.5 13.7 17.5 12C17.5 10.3 18.5 8.8 20 7.5Z" fill="#7375CF"/>
                      </svg>
                    </div>
                    
                    {/* PayPal */}
                    <div className="bg-gray-100 p-2 rounded flex items-center justify-center" style={{ width: '40px', height: '24px' }}>
                      <svg viewBox="0 0 40 24" className="w-full h-full">
                        <rect width="40" height="24" fill="#003087"/>
                        <path d="M12 6H16.5C18.4 6 19.5 7.1 19.5 9C19.5 11.2 18.1 12.5 16 12.5H14L13.2 16H11L12 6ZM14.2 10.8H15.8C16.8 10.8 17.5 10.3 17.5 9.3C17.5 8.6 17 8.2 16.2 8.2H14.8L14.2 10.8Z" fill="#009CDE"/>
                        <path d="M19 6H23.5C25.4 6 26.5 7.1 26.5 9C26.5 11.2 25.1 12.5 23 12.5H21L20.2 16H18L19 6ZM21.2 10.8H22.8C23.8 10.8 24.5 10.3 24.5 9.3C24.5 8.6 24 8.2 23.2 8.2H21.8L21.2 10.8Z" fill="#012169"/>
                      </svg>
                    </div>
                    
                    {/* Google Pay */}
                    <div className="bg-gray-100 p-2 rounded flex items-center justify-center" style={{ width: '40px', height: '24px' }}>
                      <svg viewBox="0 0 40 24" className="w-full h-full">
                        <rect width="40" height="24" fill="white"/>
                        <path d="M20 8C22.2 8 24 9.8 24 12S22.2 16 20 16S16 14.2 16 12S17.8 8 20 8ZM20 9.5C18.6 9.5 17.5 10.6 17.5 12S18.6 14.5 20 14.5S22.5 13.4 22.5 12S21.4 9.5 20 9.5Z" fill="#4285F4"/>
                        <path d="M13 10V14H11V10H13ZM29 10V14H27V10H29Z" fill="#34A853"/>
                        <path d="M15 12L13 10V14L15 12ZM25 12L27 10V14L25 12Z" fill="#FBBC05"/>
                      </svg>
                    </div>
                    
                    {/* Apple Pay */}
                    <div className="bg-gray-100 p-2 rounded flex items-center justify-center" style={{ width: '40px', height: '24px' }}>
                      <svg viewBox="0 0 40 24" className="w-full h-full">
                        <rect width="40" height="24" fill="black"/>
                        <path d="M16.5 8.5C16.2 8.5 15.9 8.7 15.7 8.9C15.4 9.2 15.2 9.6 15.3 10C15.7 10 16 9.8 16.2 9.6C16.5 9.3 16.6 8.9 16.5 8.5ZM16.2 10.1C15.6 10.1 15.1 10.4 14.8 10.4C14.4 10.4 14 10.1 13.5 10.1C12.8 10.1 12.2 10.5 11.9 11.1C11.2 12.3 11.7 14.1 12.4 15.1C12.7 15.6 13.1 16.1 13.6 16.1C14 16.1 14.2 15.8 14.8 15.8C15.3 15.8 15.5 16.1 16 16.1C16.5 16.1 16.8 15.7 17.1 15.2C17.5 14.6 17.6 14.1 17.6 14C17.6 14 16.9 13.7 16.9 12.9C16.9 12.2 17.4 11.8 17.4 11.8C17 11.2 16.4 10.1 16.2 10.1Z" fill="white"/>
                        <path d="M22 8.5V15.5H23.5V13H25.5C27 13 28 12 28 10.5S27 8 25.5 8H22V8.5ZM23.5 9.5H25.2C26 9.5 26.5 10 26.5 10.5S26 11.5 25.2 11.5H23.5V9.5Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs tracking-[0.2em] font-light text-center" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#C44D2B' }}>
                  © 2025 NOTORIOUS.Y2 • CRAFTED FOR THE DISCERNING • TIMELESS ELEGANCE
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Cursor-following tooltip for related products */}
      {hoveredProduct && (
        <div
          className="fixed pointer-events-none z-50 bg-white px-3 py-2 text-sm font-medium tracking-wide text-black border border-black"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 10,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
          }}
        >
          {hoveredProduct?.name?.toUpperCase()}
        </div>
      )}

      <ImageGallery
        images={productImages}
        productName={product.name}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default ProductDetail;