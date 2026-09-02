import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import type { User } from '../hooks/useAuth';

interface AdminDashboardRouteProps {
  user: User | null;
  onSignOut: () => void;
}

const AdminDashboardRoute: React.FC<AdminDashboardRouteProps> = (props) => {
  const navigate = useNavigate();
  return <AdminDashboard {...props} isOpen={true} onClose={() => navigate('/')} />;
};

export default AdminDashboardRoute;