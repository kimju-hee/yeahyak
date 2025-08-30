import { Card, Form, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
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

  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, setAuth } = useAuthStore();

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
      <Card
        tabList={tabList}
        activeTabKey={activeTab}
        tabProps={{ centered: true, size: 'large' }}
        onTabChange={onTabChange}
        variant="borderless"
        style={{
          width: 480,
          padding: 36,
          borderRadius: 36,
          boxShadow: '0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
        }}
        styles={{ header: { fontSize: 20 } }}
      >
        <LoginForm form={form} role={activeTab} handleSubmit={handleSubmit} />
      </Card>
    </>
  );
}
