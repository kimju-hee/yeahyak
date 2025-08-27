import { Card, Carousel, Flex, Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import {
  landing_main,
  landing_sub_01,
  landing_sub_02,
  landing_sub_03,
  landing_sub_04,
} from '../../../assets';
import LoginForm from '../../../components/LoginForm';
import { useAuthStore } from '../../../stores/authStore';
import {
  USER_ROLE,
  type AdminLoginRes,
  type LoginReq,
  type PharmacyLoginRes,
  type UserRole,
} from '../../../types';

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<UserRole>(USER_ROLE.PHARMACY);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === USER_ROLE.PHARMACY) {
        navigate('/branch', { replace: true });
      } else {
        navigate('/hq', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (values: LoginReq) => {
    try {
      if (activeTab === USER_ROLE.PHARMACY) {
        const res = await authAPI.pharmacyLogin({ email: values.email, password: values.password });

        if (res.success) {
          const pharmacyData = res.data as PharmacyLoginRes;
          setAuth(pharmacyData);
        }
      } else {
        const res = await authAPI.adminLogin({ email: values.email, password: values.password });

        if (res.success) {
          const adminData = res.data as AdminLoginRes;
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
    <>
      {contextHolder}
      <Flex vertical justify="center">
        {/* 상단 섹션 - 메인 이미지와 로그인폼 */}
        <div
          style={{
            backgroundImage: `url(${landing_main})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center top',
            position: 'relative',
            width: '100%',
            height: 'auto',
            aspectRatio: '2/1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 로그인폼 */}
          <Card
            tabList={tabList}
            activeTabKey={activeTab}
            tabProps={{ centered: true }}
            onTabChange={onTabChange}
            style={{
              position: 'absolute',
              top: '70%',
              left: '75%',
              transform: 'translate(-50%, -50%)',
              padding: '24px',
              zIndex: 2,
              maxWidth: '400px',
              borderRadius: '16px',
              boxShadow: '-5px 0px 12px 4px rgba(0, 0, 0, 0.09)',
            }}
          >
            <LoginForm role={activeTab} form={form} handleSubmit={handleSubmit} />
          </Card>
        </div>

        {/* 하단 섹션 - 캐러셀 */}
        <Carousel autoplay autoplaySpeed={6000} style={{ width: '100%', maxWidth: '1200px' }}>
          <img
            src={landing_sub_01}
            alt="챗봇을 이용해 혼선 없는 체인 운영의 시작!"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
          <img
            src={landing_sub_02}
            alt="발주/반품 프로세스의 표준!"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
          <img
            src={landing_sub_03}
            alt="AI의 도움으로 오늘의 지침이 전국으로 즉시 반영!"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
          <img
            src={landing_sub_04}
            alt="손쉬운 의약품 정보 획득"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </Carousel>
      </Flex>
    </>
  );
}
