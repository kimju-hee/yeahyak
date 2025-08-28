import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../api/auth.api';
import { useAuthStore } from '../../../stores/authStore';

export default function LogoutPage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
      } catch (e: any) {
        console.error('로그아웃 실패:', e);
      } finally {
        clearAuth();
        navigate('/login', { replace: true });
      }
    };

    handleLogout();
  }, [clearAuth, navigate]);

  return null;
}
