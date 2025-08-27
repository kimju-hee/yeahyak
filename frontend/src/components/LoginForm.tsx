import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import type { UserRole } from '../types';

interface LoginFormProps {
  role: UserRole;
  form: any;
  handleSubmit: (values: { email: string; password: string }) => void;
}

export default function LoginForm({ role, form, handleSubmit }: LoginFormProps) {
  return (
    <Form name={`login-${role.toLowerCase()}`} form={form} onFinish={handleSubmit}>
      <Flex vertical justify="center" gap={4}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
          validateTrigger="onSubmit"
        >
          <Input
            prefix={<UserOutlined style={{ margin: '0 8px' }} />}
            placeholder="이메일"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          validateTrigger="onSubmit"
        >
          <Input
            prefix={<LockOutlined style={{ margin: '0 8px' }} />}
            type="password"
            placeholder="비밀번호"
            size="large"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          style={{ marginBottom: '16px' }}
          size="large"
        >
          로그인
        </Button>

        <Flex justify="center" align="center" gap="small">
          {role === 'PHARMACY' ? (
            <>
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}>
                아이디 찾기
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}>
                비밀번호 찾기
              </Link>
              <Divider type="vertical" />
              <Link
                to="/signup-branch"
                style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}
              >
                회원가입
              </Link>
            </>
          ) : (
            <>
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}>
                아이디 찾기
              </Link>
              <Divider type="vertical" />
              <Link to="" style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}>
                비밀번호 찾기
              </Link>
              <Divider type="vertical" />
              <Link
                to="/signup-hq"
                style={{ color: 'black', whiteSpace: 'nowrap', fontSize: '16px' }}
              >
                회원가입
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Form>
  );
}
