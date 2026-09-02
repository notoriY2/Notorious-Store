import { useNavigate } from 'react-router-dom';
import Checkout from '../components/Checkout';
import type { CartItem } from '../types/Product';
import type { User } from '../hooks/useAuth';

interface CheckoutRouteProps {
  items: CartItem[];
  formatPrice: (price: number) => string;
  user?: User | null;
  onAuthClick?: () => void;
  onSignIn?: (email: string, password: string) => Promise<void>;
  onSignUp?: (email: string, password: string, name: string) => Promise<void>;
  onSignInWithProvider?: (provider: 'google' | 'facebook' | 'instagram') => Promise<void>;
  isAuthLoading?: boolean;
  clearCart?: () => Promise<void>;
}

const CheckoutRoute: React.FC<CheckoutRouteProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Checkout
      {...props}
      isOpen={true}
      onClose={() => navigate('/')}
      onBackToShopping={() => navigate('/')}
    />
  );
};

export default CheckoutRoute;