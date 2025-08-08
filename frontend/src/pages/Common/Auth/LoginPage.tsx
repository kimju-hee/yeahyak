import { Card, Flex, Form, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../../components/LoginForm';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE, type UserRole } from '../../../types/profile.type';

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<UserRole>(USER_ROLE.BRANCH);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === USER_ROLE.BRANCH) {
        navigate('/branch', { replace: true });
      } else {
        navigate('/hq', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login({ ...values, role: activeTab });
    } catch (e: any) {
      messageApi.error({ content: e.message, duration: 5 });
    }
  };

  const tabList = [
    {
      key: USER_ROLE.BRANCH,
      tab: '가맹점 로그인',
    },
    {
      key: USER_ROLE.ADMIN,
      tab: '본사 로그인',
    },
  ];

  const renderTabContent = (key: UserRole) => {
    switch (key) {
      case USER_ROLE.BRANCH:
        return <LoginForm role={USER_ROLE.BRANCH} form={form} handleSubmit={handleSubmit} />;
      case USER_ROLE.ADMIN:
        return <LoginForm role={USER_ROLE.ADMIN} form={form} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="center" wrap="wrap">
        <Card
          style={{
            flex: 1,
            padding: '16px',
            textAlign: 'center',
            borderRadius: 0,
          }}
        >
          <Typography.Title level={1}>예약</Typography.Title>
          <Typography.Paragraph>
            예약 시스템에 오신 것을 환영합니다. <br />
            AI 도입 발주 시스템! <br />
            어쩌구 저쩌구 <br />
            그림도 하나 넣구
          </Typography.Paragraph>
        </Card>
        <Card
          tabList={tabList}
          activeTabKey={activeTab}
          tabProps={{ centered: true }}
          onTabChange={(key) => setActiveTab(key as UserRole)}
          style={{
            flex: 1,
            padding: '16px',
            textAlign: 'center',
            borderRadius: 0,
          }}
        >
          {renderTabContent(activeTab)}
        </Card>
      </Flex>
    </>
  );
}
