import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Row, Typography } from 'antd';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/hq', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: any) => {
    console.log('로그인 시도:', values);

    // TODO: 여기에 로그인 API 호출 로직을 추가하세요.

    if (!values.email.includes('admin')) {
      messageApi.error('관리자 계정으로 로그인해주세요.');
      return;
    }

    try {
      await login(values.email, values.password);
      navigate('/hq', { replace: true });
    } catch (error: any) {
      console.error('로그인 중 오류 발생:', error);
      messageApi.error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={1} style={{ marginBottom: 24 }}>
        예약 로그인
      </Typography.Title>
      <Card>
        <Form name="login" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: '이메일을 입력해주세요.' }]}>
            <Input prefix={<UserOutlined />} placeholder="이메일" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="비밀번호" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              로그인
            </Button>
          </Form.Item>
          <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/admin-register">관리자 회원가입</Link>
            <Link to="/login">일반 로그인</Link>
          </Row>
        </Form>
      </Card>
    </>
  );
}
