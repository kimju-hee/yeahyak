import { Card, Flex, Form, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import {
  chatbot3d,
  chatbottext,
  forecastbot3d,
  forecasttext,
  inventorybot3d,
  inventorytext,
  noticebot3d,
  noticetext,
  pill3d,
  text,
} from '../../../assets';
import { LoginForm } from '../../../components';
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
  const messageRef = useRef(false);
  const [activeTab, setActiveTab] = useState<UserRole>(USER_ROLE.PHARMACY);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [currentRobotIdx, setCurrentRobotIdx] = useState(0);
  const robotImages = [chatbot3d, forecastbot3d, inventorybot3d, noticebot3d];
  const robotTexts = [chatbottext, forecasttext, inventorytext, noticetext];

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1330); // 임계값 조정 가능
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRobotIdx((prevIdx) => (prevIdx + 1) % robotImages.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [robotImages.length]);

  // 회원가입 완료 메시지 처리
  useEffect(() => {
    if (location.state?.message && !messageRef.current) {
      messageRef.current = true;
      messageApi.success(location.state.message);
      navigate('/login', { replace: true });
    }
  }, [location.state?.message, messageApi, navigate]);

  // 인증된 사용자 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === USER_ROLE.ADMIN) {
        navigate('/hq', { replace: true });
      } else {
        navigate('/branch', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const tabList = [
    { key: USER_ROLE.PHARMACY, tab: '가맹점 로그인' },
    { key: USER_ROLE.ADMIN, tab: '본사 로그인' },
  ];

  const onTabChange = (key: string) => {
    setActiveTab(key as UserRole);
    form.resetFields();
    messageApi.destroy();
  };

  const handleSubmit = async (values: LoginRequest) => {
    try {
      if (activeTab === USER_ROLE.ADMIN) {
        const res = await authAPI.adminLogin({
          email: values.email,
          password: values.password,
        });

        if (res.success) {
          const adminData = res.data as AdminLogin;
          setAuth(adminData);
        }
      } else {
        const res = await authAPI.pharmacyLogin({
          email: values.email,
          password: values.password,
        });

        if (res.success) {
          const pharmacyData = res.data as PharmacyLogin;
          setAuth(pharmacyData);
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

  return (
    <>
      {contextHolder}
      {/* Pill 이미지 - 우하단 */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 640,
          zIndex: 0,
        }}
      >
        <img
          src={pill3d}
          alt="pill"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {isSmallScreen ? (
        <Flex vertical align="center" gap={36} style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <img
              src={text}
              alt="text"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <Card
            tabList={tabList}
            activeTabKey={activeTab}
            tabProps={{ centered: true, size: 'large' }}
            onTabChange={onTabChange}
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 36,
              borderRadius: 36,
              boxShadow: '0 9px 28px 8px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
            styles={{ header: { fontSize: 20 } }}
          >
            <LoginForm form={form} role={activeTab} handleSubmit={handleSubmit} />
          </Card>
        </Flex>
      ) : (
        <Flex
          justify="space-between"
          align="center"
          gap={36}
          style={{ width: '100%', maxWidth: '70vw' }}
        >
          <Flex vertical align="center" gap={36}>
            <div style={{ width: '100%', maxWidth: 520, marginBottom: 60 }}>
              <img
                src={text}
                alt="yeahyak-beginning-of-franchised"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                minHeight: 280,
                height: 280,
                zIndex: 1,
              }}
            >
              <img
                src={robotImages[currentRobotIdx]}
                alt="robot-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'opacity 0.5s ease-in-out',
                }}
              />
            </div>
            <div
              style={{
                minHeight: 36,
                height: 36,
                zIndex: 1,
              }}
            >
              <img
                src={robotTexts[currentRobotIdx]}
                alt="robot-text"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'opacity 0.5s ease-in-out',
                }}
              />
            </div>
          </Flex>

          <Card
            tabList={tabList}
            activeTabKey={activeTab}
            tabProps={{ centered: true, size: 'large' }}
            onTabChange={onTabChange}
            variant="borderless"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 36,
              borderRadius: 36,
              boxShadow: '0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
            styles={{ header: { fontSize: 20 } }}
          >
            <LoginForm form={form} role={activeTab} handleSubmit={handleSubmit} />
          </Card>
        </Flex>
      )}
    </>
  );
}
