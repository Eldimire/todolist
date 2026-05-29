import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: Props) {
  const token = useAuthStore((state) => state.token);
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}
