import { Navigate, useNavigate, useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import type { Product, CartItem } from '../types/Product';
import type { Currency } from '../hooks/useCurrency';
import type { User } from '../hooks/useAuth';

interface ProductDetailRouteProps {
  products: Product[];
  onAddToCart: (product: Product, size?: string) => void;
  formatPrice: (price: number) => string;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  user: User | null;
  onAuthClick: (message?: string) => void;
  onSignOut: () => void;
  wishlistItems: Product[];
  cartItems: CartItem[];
  isCartOpen: boolean;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onUpdateCartQuantity: (uniqueId: string, quantity: number) => void;
  onRemoveCartItem: (uniqueId: string) => void;
  onOpenWishlist: () => void;
  cartItemsCount: number;
  onOpenAdminDashboard: () => void;
  onOpenMyAccount: () => void;
}

const ProductDetailRoute: React.FC<ProductDetailRouteProps> = (props) => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();

  const product =
    props.products.find(p => p.slug === slugOrId || p.id === slugOrId) ?? null;

  if (!product) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProductDetail
      {...props}
      product={product}
      allProducts={props.products}
      isOpen={true}
      onClose={() => navigate('/')}
      onProductClick={(p) => navigate(`/product/${p.slug ?? p.id}`)}
    />
  );
};

export default ProductDetailRoute;