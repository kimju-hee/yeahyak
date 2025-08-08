import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import type { UserRole } from '../types/profile.type';

interface LoginFormProps {
  role: UserRole;
  form: any;
  handleSubmit: (values: { email: string; password: string }) => void;
}

export default function LoginForm({ role, form, handleSubmit }: LoginFormProps) {
  return (
    <Form name={`${role.toLowerCase()}-login`} form={form} onFinish={handleSubmit}>
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

        <Flex justify="center" align="center" gap="small">
          {role === 'BRANCH' ? (
            <>
              <Link to="/register" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                회원가입
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                아이디 찾기
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                비밀번호 찾기
              </Link>
            </>
          ) : (
            <>
              <Link to="/hq-register" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                회원가입
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                아이디 찾기
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap' }}>
                비밀번호 찾기
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Form>
  );
}
