import { Card, Form, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import { landing01, landing02, landing03, landing04 } from '../../../assets';
import LoginForm from '../../../components/LoginForm';
import { useAuthStore } from '../../../stores/authStore';
import {
  USER_ROLE,
  type AdminLogin,
  type LoginRequest,
  type PharmacyLogin,
  type UserRole,
} from '../../../types';

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const messageShownRef = useRef(false);

  const [activeTab, setActiveTab] = useState<UserRole>(USER_ROLE.PHARMACY);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 배경 이미지 배열
  const backgroundImages = [landing01, landing02, landing03, landing04];

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 회원가입 완료 메시지 처리
  useEffect(() => {
    if (location.state?.message && !messageShownRef.current) {
      messageShownRef.current = true;
      messageApi.success(location.state.message);
      navigate('/login', { replace: true });
    }
  }, [location.state?.message, messageApi, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === USER_ROLE.PHARMACY) {
        navigate('/branch', { replace: true });
      } else {
        navigate('/hq', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // 배경 이미지 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIdx((prevIdx) => (prevIdx + 1) % backgroundImages.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleSubmit = async (values: LoginRequest) => {
    try {
      if (activeTab === USER_ROLE.PHARMACY) {
        const res = await authAPI.pharmacyLogin({
          email: values.email,
          password: values.password,
        });

        if (res.success) {
          const pharmacyData = res.data as PharmacyLogin;
          setAuth(pharmacyData);
        }
      } else {
        const res = await authAPI.adminLogin({
          email: values.email,
          password: values.password,
        });

        if (res.success) {
          const adminData = res.data as AdminLogin;
          setAuth(adminData);
        }
      }
    } catch (e: any) {
      console.error('로그인 실패:', e);
      messageApi.error({
        content: e.response?.data?.message || '로그인 중 오류가 발생했습니다.',
        duration: 5,
      });
    }
  };

  const tabList = [
    { key: USER_ROLE.PHARMACY, tab: '가맹점 로그인' },
    { key: USER_ROLE.ADMIN, tab: '본사 로그인' },
  ];

  const onTabChange = (key: string) => {
    setActiveTab(key as UserRole);
    form.resetFields();
    messageApi.destroy();
  };

  return (
    <div
      style={{
        position: 'relative',
        minWidth: '1024px',
        minHeight: '100vh',
        width: '100%',
        height: '100%',
      }}
    >
      {contextHolder}

      {/* 배경 이미지 컨테이너 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minWidth: '1024px',
          minHeight: '100vh',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        {/* 블러 처리된 배경 (빈 공간 채우기용) */}
        <img
          src={backgroundImages[currentImgIdx]}
          alt="배경 블러"
          style={{
            position: 'absolute',
            top: '50%',
            left: isSmallScreen ? '70%' : '50%', // 작은 화면 분기
            transform: 'translate(-50%, -50%)',
            minWidth: 'max(100%, 1024px)',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            filter: 'blur(10px)',
            opacity: 0.8,
          }}
        />
        {/* 메인 이미지 (전체 보이게) */}
        <img
          src={backgroundImages[currentImgIdx]}
          alt="배경"
          style={{
            position: 'absolute',
            top: '50%',
            left: isSmallScreen ? '70%' : '50%', // 작은 화면 분기
            transform: 'translate(-50%, -50%)',
            minWidth: 'max(100%, 1024px)',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            zIndex: 1,
          }}
        />
      </div>

      {/* 콘텐츠 영역 */}
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          minWidth: '1024px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: isSmallScreen ? '30%' : '0', // 작은 화면 분기
          paddingRight: isSmallScreen ? '5%' : '15%', // 작은 화면 분기
          zIndex: 1,
        }}
      >
        {/* 로그인폼 */}
        <Card
          tabList={tabList}
          activeTabKey={activeTab}
          tabProps={{ centered: true, size: 'large' }}
          onTabChange={onTabChange}
          style={{
            padding: '48px',
            width: '480px', // 고정 너비
            borderRadius: '16px',
            boxShadow: '0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <LoginForm role={activeTab} form={form} handleSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
