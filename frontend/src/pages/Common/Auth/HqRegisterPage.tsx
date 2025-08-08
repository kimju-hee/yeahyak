import { Button, Card, Flex, Form, Input, message, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../../api/api';
import TermsAndPrivacyCheckbox from '../../../components/TermsAndPolicyCheckbox';
import type { AdminSignupRequest } from '../../../types/auth.type';
import { ADMIN_DEPARTMENT } from '../../../types/profile.type';

export default function HqRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const departmentOptions = Object.entries(ADMIN_DEPARTMENT).map(([value, label]) => ({
    value,
    label,
  }));

  const handleSubmit = async (
    values: AdminSignupRequest & {
      confirmPassword: string;
      agreement: boolean;
    },
  ) => {
    try {
      const { confirmPassword, agreement, ...payload } = values;
      const res = await instance.post('/auth/admin/signup', payload);
      // LOG: 테스트용 로그
      console.log('🧪 회원가입 응답:', res.data);
      if (res.data.success) {
        navigate('/login', { replace: true });
      }
    } catch (e: any) {
      console.error('회원가입 실패:', e);
      messageApi.error(e.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Flex vertical justify="center" align="center">
        <Typography.Title level={1} style={{ marginBottom: '24px' }}>
          예약 관리자 회원가입
        </Typography.Title>

        <Card style={{ padding: '24px' }}>
          <Form
            name="admin-register"
            onFinish={handleSubmit}
            scrollToFirstError
            autoComplete="off"
            layout="vertical"
          >
            <Flex vertical justify="center">
              <Form.Item
                name="email"
                label="이메일"
                rules={[
                  { required: true, message: '이메일을 입력해주세요.' },
                  { type: 'email', message: '잘못된 형식의 이메일입니다.' },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true, message: '비밀번호를 입력해주세요.' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const length = value.length;
                      const hasUpper = /[A-Z]/.test(value);
                      const hasLower = /[a-z]/.test(value);
                      const hasNumber = /[0-9]/.test(value);
                      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                      const typeCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
                        Boolean,
                      ).length;

                      if (typeCount >= 3 && length >= 8) return Promise.resolve();

                      return Promise.reject(
                        new Error('영문, 숫자, 특수문자를 조합하여 8자리 이상으로 입력해주세요.'),
                      );
                    },
                  },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="영문, 숫자, 특수문자 조합 (8자리 이상)" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="비밀번호 확인"
                dependencies={['password']}
                rules={[
                  { required: true, message: '비밀번호 확인을 입력해주세요.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="adminName"
                label="이름"
                rules={[{ required: true, message: '이름을 입력해주세요.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="department"
                label="소속 부서"
                rules={[{ required: true, message: '소속 부서를 선택해주세요.' }]}
              >
                <Select placeholder="소속 부서를 선택하세요" options={departmentOptions} />
              </Form.Item>

              <TermsAndPrivacyCheckbox />

              <Button type="primary" htmlType="submit" block>
                관리자 회원가입
              </Button>
            </Flex>
          </Form>
        </Card>
      </Flex>
    </>
  );
}
