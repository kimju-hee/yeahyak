import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import type { UserRole } from '../types';

interface LoginFormProps {
  form: any;
  role: UserRole;
  handleSubmit: (values: { email: string; password: string }) => void;
}

export function LoginForm({ form, role, handleSubmit }: LoginFormProps) {
  return (
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      size="large"
      validateMessages={{ required: '${label}을(를) 입력해주세요' }}
    >
      <Flex vertical justify="center" gap={8}>
        <Form.Item name="이메일" rules={[{ required: true }]} validateTrigger="onSubmit">
          <Input prefix={<UserOutlined style={{ margin: '0 8px' }} />} placeholder="이메일" />
        </Form.Item>
        <Form.Item name="비밀번호" rules={[{ required: true }]} validateTrigger="onSubmit">
          <Input
            prefix={<LockOutlined style={{ margin: '0 8px' }} />}
            type="password"
            placeholder="비밀번호"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          로그인
        </Button>

        <Flex justify="center" align="center" gap="middle">
          <>
            <Link to="" style={{ color: '#000000E0', whiteSpace: 'nowrap', fontSize: 16 }}>
              아이디 찾기
            </Link>
            <Divider type="vertical" />
            <Link to="" style={{ color: '#000000E0', whiteSpace: 'nowrap', fontSize: 16 }}>
              비밀번호 찾기
            </Link>
            <Divider type="vertical" />
            {role === 'ADMIN' ? (
              <Link
                to="/signup-hq"
                style={{ color: '#000000E0', whiteSpace: 'nowrap', fontSize: 16 }}
              >
                회원가입
              </Link>
            ) : (
              <Link
                to="/signup-branch"
                style={{ color: '#000000E0', whiteSpace: 'nowrap', fontSize: 16 }}
              >
                회원가입
              </Link>
            )}
          </>
        </Flex>
      </Flex>
    </Form>
  );
}
