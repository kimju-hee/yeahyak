import { Card, Flex, Form, message, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../../components/LoginForm';
import { useAuthStore } from '../../../stores/authStore';
import type { Role } from '../../../types/auth';

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<Role>('BRANCH');

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'BRANCH') {
        navigate('/branch', { replace: true });
      } else {
        navigate('/hq', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password, activeTab);
    } catch (e: any) {
      messageApi.error(e.message);
    }
  };

  const tabsItems = [
    {
      key: 'BRANCH',
      label: '가맹점 로그인',
      children: <LoginForm role="BRANCH" form={form} handleSubmit={handleSubmit} />,
    },
    {
      key: 'ADMIN',
      label: '본사 로그인',
      children: <LoginForm role="ADMIN" form={form} handleSubmit={handleSubmit} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <Flex vertical justify="center" align="center">
        <Typography.Title level={1} style={{ marginBottom: '24px' }}>
          예약 로그인
        </Typography.Title>

        <Card style={{ padding: '8px' }}>
          <Tabs
            activeKey={activeTab}
            centered
            items={tabsItems}
            onChange={(key) => setActiveTab(key as Role)}
          />
        </Card>
      </Flex>
    </>
  );
}
