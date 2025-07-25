import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ 로컬 스토리지나 세션에서 토큰/유저 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    // ✅ 로그인 페이지로 이동
    navigate('/login', { replace: true });
  }, [navigate]);

  return null; // UI 없이 바로 리디렉션 처리
}
