import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Input, Space } from 'antd';
import { Link } from 'react-router-dom';
import type { Role } from '../types/auth';

interface LoginFormProps {
  role: Role;
  form: any;
  handleSubmit: (values: { email: string; password: string }) => void;
}

export default function LoginForm({ role, form, handleSubmit }: LoginFormProps) {
  return (
    <Form name={`${role}-login`} form={form} onFinish={handleSubmit}>
      <Flex vertical justify="center">
        <Form.Item
          name="email"
          rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
          validateTrigger="onSubmit"
        >
          <Input prefix={<UserOutlined />} placeholder="이메일" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          validateTrigger="onSubmit"
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="비밀번호" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block style={{ marginBottom: '8px' }}>
          로그인
        </Button>

        <Space align="center" split={<Divider type="vertical" />}>
          {role === 'BRANCH' ? (
            <>
              <Link to="/register" style={{ color: 'black' }}>
                회원가입
              </Link>
              <Link to="" style={{ color: 'black' }}>
                아이디 찾기
              </Link>
              <Link to="" style={{ color: 'black' }}>
                비밀번호 찾기
              </Link>
            </>
          ) : (
            <>
              <Link to="/hq-register" style={{ color: 'black' }}>
                회원가입
              </Link>
              <Link to="" style={{ color: 'black' }}>
                아이디 찾기
              </Link>
              <Link to="" style={{ color: 'black' }}>
                비밀번호 찾기
              </Link>
            </>
          )}
        </Space>
      </Flex>
    </Form>
  );
}
