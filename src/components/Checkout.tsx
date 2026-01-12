import React, { useState } from 'react';
import { X, ChevronDown, Info, Search, Lock } from 'lucide-react';
import { CartItem } from '../types/Product';
import { User as UserType } from '../hooks/useAuth';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  formatPrice: (price: number) => string;
  onBackToShopping: () => void;
  user?: UserType | null;
  onAuthClick?: () => void;
  onSignIn?: (email: string, password: string) => Promise<void>;
  onSignUp?: (email: string, password: string, name: string) => Promise<void>;
  onSignInWithProvider?: (provider: 'google' | 'facebook' | 'instagram') => Promise<void>;
  isAuthLoading?: boolean;
}

const Checkout: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  formatPrice,
  onBackToShopping,
  user,
  onAuthClick,
  onSignIn,
  onSignUp,
  onSignInWithProvider,
  isAuthLoading = false
}) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    emailOffers: false,
    country: 'United States',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    nameOnCard: '',
    useBillingAddress: true,
    billingCountry: 'United States',
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingApartment: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingPhone: '',
    rememberMe: true,
    mobilePhone: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState('');
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpressCheckout = (method: 'shopPay' | 'googlePay') => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        onClose();
        setOrderComplete(false);
      }, 3000);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate form submission and payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        onClose();
        setOrderComplete(false);
      }, 3000);
    }, 2000);
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@notorious.y2.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+27 63 503 5882';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      if (isSignUp && onSignUp) {
        await onSignUp(loginEmail, loginPassword, loginName);
      } else if (onSignIn) {
        await onSignIn(loginEmail, loginPassword);
      }
      
      // Clear form and close login
      setLoginEmail('');
      setLoginPassword('');
      setLoginName('');
      setShowLoginForm(false);
      setIsSignUp(false);
    } catch (error) {
      setLoginError('Authentication failed. Please try again.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'instagram') => {
    setLoginError('');
    try {
      if (onSignInWithProvider) {
        await onSignInWithProvider(provider);
        setShowLoginForm(false);
      }
    } catch (error) {
      setLoginError('Social login failed. Please try again.');
    }
  };

  const toggleLoginForm = () => {
    if (onAuthClick && !onSignIn) {
      // If we don't have direct auth functions, use the modal
      onAuthClick();
    } else {
      // Use inline form
      setShowLoginForm(!showLoginForm);
      setLoginError('');
    }
  };

  // Show order success screen
  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-4 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-6 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              Thank you for your purchase. You'll receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              Order #NY2-{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show processing screen
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6"></div>
            <h1 className="text-xl font-light mb-2 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              Processing Your Order
            </h1>
            <p className="text-gray-600 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
              Please wait while we process your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💿</span>
            <h1 className="text-xl font-light tracking-[0.3em] text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: '100' }}>
              NOTORIOUS.Y2
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </header>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Checkout Form */}
            <div className="flex-1 p-4 md:p-8 max-w-2xl">
              {/* Express Checkout */}
              <div className="mb-8">
                <h2 className="text-lg font-light mb-6 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                  Express checkout
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => handleExpressCheckout('shopPay')}
                    className="bg-purple-600 text-white py-4 px-6 font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                    style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  >
                    <span className="text-lg font-bold">shop</span>
                    <span className="ml-1 text-lg font-bold">Pay</span>
                  </button>
                  <button
                    onClick={() => handleExpressCheckout('googlePay')}
                    className="bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  >
                    <span className="text-lg font-bold">G</span>
                    <span className="ml-2 text-lg">Pay</span>
                  </button>
                </div>
                <div className="text-center text-gray-500 text-sm font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                  OR
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-light tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      Contact
                    </h3>
                    {!user && (
                      <button 
                        type="button" 
                        onClick={toggleLoginForm}
                        className="font-light tracking-wide text-sm transition-colors"
                        style={{ 
                          fontFamily: 'Helvetica Neue, Arial, sans-serif',
                          color: '#DDA743'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {showLoginForm ? 'Cancel' : 'Log in'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {user ? (
                      <div className="p-4 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-600 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              Logged in as {user.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : showLoginForm ? (
                      <div className="border border-gray-200 p-4 bg-gray-50">
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {isSignUp ? 'Create Account' : 'Sign In'}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setIsSignUp(!isSignUp)}
                              className="text-sm text-gray-600 hover:text-black transition-colors"
                            >
                              {isSignUp ? 'Already have an account?' : 'Need an account?'}
                            </button>
                          </div>
                          
                          {loginError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
                              {loginError}
                            </div>
                          )}
                          
                          {isSignUp && (
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={loginName}
                              onChange={(e) => setLoginName(e.target.value)}
                              className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                              required
                            />
                          )}
                          
                          <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            required
                          />
                          
                          <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            required
                          />
                          
                          <button
                            type="submit"
                            disabled={isAuthLoading}
                            className="w-full bg-black text-white py-3 font-light tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                          >
                            {isAuthLoading ? 'LOADING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                          </button>
                          
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => handleSocialLogin('google')}
                              disabled={isAuthLoading}
                              className="flex items-center justify-center py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleSocialLogin('facebook')}
                              disabled={isAuthLoading}
                              className="flex items-center justify-center py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleSocialLogin('instagram')}
                              disabled={isAuthLoading}
                              className="flex items-center justify-center py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C8.396 0 7.989.013 7.041.072 6.094.131 5.42.333 4.844.63c-.611.324-1.13.756-1.649 1.275-.518.52-.95 1.038-1.275 1.649-.297.576-.499 1.25-.558 2.197C.013 7.75 0 8.157 0 11.778v.444c0 3.621.013 4.028.072 4.976.059.947.261 1.621.558 2.197.324.611.756 1.13 1.275 1.649.52.518 1.038.95 1.649 1.275.576.297 1.25.499 2.197.558.948.059 1.355.072 4.976.072h.444c3.621 0 4.028-.013 4.976-.072.947-.059 1.621-.261 2.197-.558.611-.324 1.13-.756 1.649-1.275.518-.52.95-1.038 1.275-1.649.297-.576.499-1.25.558-2.197.059-.948.072-1.355.072-4.976v-.444c0-3.621-.013-4.028-.072-4.976-.059-.947-.261-1.621-.558-2.197-.324-.611-.756-1.13-1.275-1.649-.52-.518-1.038-.95-1.649-1.275-.576-.297-1.25-.499-2.197-.558C16.028.013 15.621 0 12 0h-.017zm-.117 2.164h.234c3.534 0 3.952.01 5.347.072.889.041 1.374.19 1.695.315.426.166.73.364 1.048.682.318.318.516.622.682 1.048.125.321.274.806.315 1.695.062 1.395.072 1.813.072 5.347 0 3.534-.01 3.952-.072 5.347-.041.889-.19 1.374-.315 1.695-.166.426-.364.73-.682 1.048-.318.318-.622.516-1.048.682-.321.125-.806.274-1.695.315-1.395.062-1.813.072-5.347.072-3.534 0-3.952-.01-5.347-.072-.889-.041-1.374-.19-1.695-.315-.426-.166-.73-.364-1.048-.682-.318-.318-.516-.622-.682-1.048-.125-.321-.274-.806-.315-1.695-.062-1.395-.072-1.813-.072-5.347 0-3.534.01-3.952.072-5.347.041-.889.19-1.374.315-1.695.166-.426.364-.73.682-1.048.318-.318.622-.516 1.048-.682.321-.125.806-.274 1.695-.315 1.221-.056 1.693-.067 4.113-.07v.003zm-.004 3.709c-2.987 0-5.41 2.423-5.41 5.41s2.423 5.41 5.41 5.41 5.41-2.423 5.41-5.41-2.423-5.41-5.41-5.41zm0 8.916c-1.937 0-3.506-1.569-3.506-3.506s1.569-3.506 3.506-3.506 3.506 1.569 3.506 3.506-1.569 3.506-3.506 3.506zM19.54 5.277c0 .698-.566 1.265-1.265 1.265-.698 0-1.265-.567-1.265-1.265 0-.698.567-1.265 1.265-1.265.698 0 1.265.567 1.265 1.265z"/>
                              </svg>
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                    )}
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.emailOffers}
                        onChange={(e) => handleInputChange('emailOffers', e.target.checked)}
                        className="w-4 h-4"
                        style={{ accentColor: '#DDA743' }}
                      />
                      <span className="text-sm font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                        Email me with news and offers
                      </span>
                    </label>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h3 className="text-lg font-light mb-6 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Delivery
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                        Country/Region
                      </label>
                      <div className="relative">
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors appearance-none bg-white font-light"
                          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full p-4 pr-12 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                      style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                      <div className="relative">
                        <select
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors appearance-none bg-white font-light"
                          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                          required
                        >
                          <option value="">State</option>
                          <option value="CA">California</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          <option value="FL">Florida</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="ZIP code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-4 pr-12 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                      />
                      <Info className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h3 className="text-lg font-light mb-6 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Shipping method
                  </h3>
                  <div className="p-4 bg-gray-50 border border-gray-200 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                    Enter your shipping address to view available shipping methods.
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="text-lg font-light mb-2 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Payment
                  </h3>
                  <p className="text-sm mb-6 font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                    All transactions are secure and encrypted.
                  </p>
                  
                  <div className="border border-gray-300 overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b border-gray-300">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          value="credit_card"
                          checked={formData.paymentMethod === 'credit_card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="w-4 h-4"
                          style={{ accentColor: '#DDA743' }}
                        />
                        <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Credit card
                        </span>
                        <div className="flex space-x-2 ml-auto">
                          <div className="w-8 h-5 bg-blue-600 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                          <div className="w-8 h-5 bg-red-500 flex items-center justify-center text-white text-xs font-bold">MC</div>
                          <div className="w-8 h-5 bg-blue-700 flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                          <div className="w-8 h-5 bg-orange-500 flex items-center justify-center text-white text-xs font-bold">DISC</div>
                          <span className="text-sm font-light" style={{ color: '#666' }}>+4</span>
                        </div>
                      </label>
                    </div>
                    
                    {formData.paymentMethod === 'credit_card' && (
                      <div className="p-4 space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Card number"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            className="w-full p-4 pr-12 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            required
                          />
                          <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Expiration date (MM / YY)"
                            value={formData.expirationDate}
                            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                            className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            required
                          />
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Security code"
                              value={formData.securityCode}
                              onChange={(e) => handleInputChange('securityCode', e.target.value)}
                              className="w-full p-4 pr-12 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                              required
                            />
                            <Info className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Name on card"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                          className="w-full p-4 border border-gray-300 focus:outline-none focus:border-black transition-colors font-light"
                          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                          required
                        />

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.useBillingAddress}
                            onChange={(e) => handleInputChange('useBillingAddress', e.target.checked)}
                            className="w-4 h-4"
                            style={{ accentColor: '#DDA743' }}
                          />
                          <span className="text-sm font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                            Use shipping address as billing address
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Shop Pay Installments */}
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 text-white px-3 py-1 text-sm font-bold">
                        shop<span className="font-normal">Pay</span>
                      </div>
                      <span className="text-sm font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                        Pay in full or in installments
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remember Me */}
                {!user && (
                  <div>
                    <h3 className="text-lg font-light mb-6 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      Remember me
                    </h3>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                        className="w-4 h-4 mt-1"
                        style={{ accentColor: '#DDA743' }}
                      />
                      <span className="text-sm font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                        Save my information for a faster checkout with a Shop account
                      </span>
                    </label>
                    
                    {formData.rememberMe && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-3 p-4 border border-gray-300">
                          <span className="text-gray-500">📱</span>
                          <div className="flex-1">
                            <label className="block text-sm font-light mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                              Mobile phone number
                            </label>
                            <input
                              type="tel"
                              placeholder="+1"
                              value={formData.mobilePhone}
                              onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                              className="w-full border-none outline-none text-sm font-light"
                              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center justify-between text-sm" style={{ color: '#666' }}>
                  <div className="flex items-center space-x-2">
                    <Lock size={16} />
                    <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      Secure and encrypted
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">shop</span>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 px-6 font-light text-lg tracking-wide hover:bg-gray-800 transition-colors"
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Pay now
                </button>

                {/* Terms */}
                <div className="text-xs font-light text-center" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                  Your info will be saved to a Shop account. By continuing, you agree to Shop's{' '}
                  <button 
                    onClick={() => handleLinkClick('https://shop.app/terms')}
                    className="underline hover:no-underline" 
                    style={{ color: '#DDA743' }}
                  >
                    Terms of Service
                  </button> and acknowledge the{' '}
                  <button 
                    onClick={() => handleLinkClick('https://shop.app/privacy')}
                    className="underline hover:no-underline" 
                    style={{ color: '#DDA743' }}
                  >
                    Privacy Policy
                  </button>.
                </div>
              </form>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:w-96 bg-gray-50 p-4 md:p-8 border-l border-gray-200">
              {/* Help & Contact Section */}
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium mb-3 tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                  Need Help?
                </h3>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={handleEmailClick}
                    className="block text-left hover:underline transition-colors"
                    style={{ color: '#DDA743' }}
                  >
                    📧 support@notorious.y2.com
                  </button>
                  <button
                    onClick={handlePhoneClick}
                    className="block text-left hover:underline transition-colors"
                    style={{ color: '#DDA743' }}
                  >
                    📞 063 503 5882
                  </button>
                  <button
                    onClick={() => handleLinkClick('https://notorious.y2.com/help')}
                    className="block text-left hover:underline transition-colors"
                    style={{ color: '#DDA743' }}
                  >
                    ❓ Help Center
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.uniqueId} className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover border border-gray-200"
                        />
                        <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs w-5 h-5 flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-light text-gray-900 text-sm" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          {item.name}
                        </h4>
                        <div className="text-xs font-light space-y-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                          {item.selectedColor && <div>{item.selectedColor} / {item.selectedSize || 'One Size'}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-light text-gray-900" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                      Subtotal • {itemCount} items
                    </span>
                    <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                      Shipping
                    </span>
                    <span className="font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                      Enter shipping address
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-light tracking-wide" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Total
                      </span>
                      <div className="text-right">
                        <div className="text-xs font-light mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#666' }}>
                          USD
                        </div>
                        <div className="text-xl font-light" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          {formatPrice(total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <button
                    onClick={() => handleLinkClick('https://notori.y2.com/shipping')}
                    className="text-left hover:underline transition-colors"
                    style={{ color: '#666' }}
                  >
                    Shipping Info
                  </button>
                  <button
                    onClick={() => handleLinkClick('https://notori.y2.com/returns')}
                    className="text-left hover:underline transition-colors"
                    style={{ color: '#666' }}
                  >
                    Returns Policy
                  </button>
                  <button
                    onClick={() => handleLinkClick('https://notori.y2.com/size-guide')}
                    className="text-left hover:underline transition-colors"
                    style={{ color: '#666' }}
                  >
                    Size Guide
                  </button>
                  <button
                    onClick={() => handleLinkClick('https://notori.y2.com/faq')}
                    className="text-left hover:underline transition-colors"
                    style={{ color: '#666' }}
                  >
                    FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;