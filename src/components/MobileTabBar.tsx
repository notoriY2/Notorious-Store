import React from 'react';
import { Sparkles, Heart, ShoppingBag, User } from 'lucide-react';
import { User as UserType } from '../hooks/useAuth';

interface MobileTabBarProps {
  activeTab: 'shop' | 'wishlist' | 'cart' | 'account';
  wishlistCount: number;
  cartCount: number;
  user: UserType | null;
  onShopClick: () => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onAccountClick: () => void;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  wishlistCount,
  cartCount,
  user,
  onShopClick,
  onWishlistClick,
  onCartClick,
  onAccountClick,
}) => {
  const tabs = [
    { id: 'shop', label: 'Shop', icon: Sparkles, onClick: onShopClick, count: 0 },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, onClick: onWishlistClick, count: wishlistCount },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, onClick: onCartClick, count: cartCount },
    { id: 'account', label: 'Account', icon: User, onClick: onAccountClick, count: 0 },
  ] as const;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[56] bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-100 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isAccountTab = tab.id === 'account';

        return (
          <button
            key={tab.id}
            type="button"
            onClick={tab.onClick}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative active:scale-90 transition-transform duration-150"
          >
            <div className="relative">
              {isAccountTab && user ? (
                user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'Account'} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-light">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )
              ) : (
                <Icon size={20} className={isActive ? 'text-black' : 'text-gray-400'} strokeWidth={1.5} />
              )}
              {tab.count > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </div>
            <span className={`text-[9px] uppercase tracking-wide ${isActive ? 'text-black font-medium' : 'text-gray-400'}`}>
              {isAccountTab ? (user ? 'Account' : 'Sign In') : tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;