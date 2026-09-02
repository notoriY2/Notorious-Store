import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BannerCollection from '../components/BannerCollection';
import { useBanners } from '../hooks/useBanners';
import type { Product } from '../types/Product';
import type { Currency } from '../hooks/useCurrency';
import type { User } from '../hooks/useAuth';

interface BannerCollectionRouteProps {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  user: User | null;
  onAuthClick: (message?: string) => void;
  wishlistItems: Product[];
  onOpenWishlist: () => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenAdminDashboard: () => void;
  onOpenMyAccount: () => void;
}

const BannerCollectionRoute: React.FC<BannerCollectionRouteProps> = (props) => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const { banners, isLoading } = useBanners();

  const banner = banners.find(b => b.id === bannerId) ?? null;

  // Banner genuinely doesn't exist (fetch finished, no match) — bail out.
  if (!isLoading && !banner) {
    return <Navigate to="/" replace />;
  }

  // Still fetching and we don't have the banner yet — show a loading
  // state instead of falling through to <BannerCollection banner={null} />,
  // which just renders null and produces a blank-page flash.
  if (isLoading && !banner) {
    return (
      <div className="fixed inset-x-0 top-0 h-[100dvh] bg-white z-[55] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BannerCollection
      {...props}
      banner={banner}
      isOpen={true}
      onClose={() => navigate('/')}
    />
  );
};

export default BannerCollectionRoute;