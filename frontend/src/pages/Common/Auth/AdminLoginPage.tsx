import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('로그인 시도:', values);

    // TODO: 여기에 로그인 API 호출 로직을 추가하세요.
    // 실제 로그인 성공 여부는 API 응답에 따라 처리해야 합니다.
    // 예시로, 로그인 성공 시 대시보드로 이동합니다.

    navigate('/hq', { replace: true });
  };

  return (
    <>
      <Title level={1} style={{ marginBottom: 24 }}>
        예약
      </Title>
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
    </>
  );
}
