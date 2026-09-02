import { useNavigate } from 'react-router-dom';
import MyAccount from '../components/MyAccount';
import type { User } from '../hooks/useAuth';

interface MyAccountRouteProps {
  user: User | null;
  onSignOut: () => void;
}

const MyAccountRoute: React.FC<MyAccountRouteProps> = (props) => {
  const navigate = useNavigate();
  return <MyAccount {...props} isOpen={true} onClose={() => navigate('/')} />;
};

export default MyAccountRoute;