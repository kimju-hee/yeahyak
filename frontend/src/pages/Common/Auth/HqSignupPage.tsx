import { Button, Card, Flex, Form, Input, message, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import { TermsAndPrivacyCheckbox } from '../../../components';
import { DEPARTMENT_OPTIONS } from '../../../constants';
import type { AdminSignupRequest } from '../../../types';
import {
  passwordConfirmRule,
  passwordNotSameAsIdRule,
  passwordValidationRule,
} from '../../../utils';

export default function HqSignupPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const handleSubmit = async (
    values: AdminSignupRequest & {
      confirmPassword: string;
      agreement: boolean;
    },
  ) => {
    try {
      const { confirmPassword, agreement, ...payload } = values;
      const res = await authAPI.adminSignup(payload);

      if (res.success) {
        navigate('/login', {
          replace: true,
          state: { message: '관리자 회원가입이 완료되었습니다' }, // 로그인 페이지에서 띄울 메시지
        });
      }
    } catch (e: any) {
      console.error('회원가입 실패:', e);
      messageApi.error(e.response?.data?.message || '회원가입 중 오류가 발생했습니다');
    }
  };

  return (
    <>
      {contextHolder}
      <Flex vertical justify="center" align="center">
        <Typography.Title
          level={2}
          style={{
            marginBottom: 24,
            color: '#ffffff',
            textShadow: '0px 3px 6px rgba(0, 0, 0, 0.12)',
          }}
        >
          YeahYak
        </Typography.Title>
        <Card
          title="본사 회원가입"
          variant="borderless"
          style={{ maxWidth: 640, minWidth: 480, padding: 36, borderRadius: 36 }}
          styles={{ header: { fontSize: 20, borderBottom: 'none' } }}
        >
          <Form
            form={form}
            name="signup-hq"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            autoComplete="off"
            scrollToFirstError={true}
            validateMessages={{
              required: '${label}을(를) 입력해주세요',
              types: {
                email: '잘못된 형식의 ${label}입니다',
              },
            }}
          >
            <Flex vertical justify="center" gap={4}>
              <Form.Item
                name="email"
                label="이메일"
                rules={[{ required: true }, { type: 'email' }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true },
                  passwordValidationRule,
                  passwordNotSameAsIdRule(form.getFieldValue, 'email'),
                ]}
                hasFeedback
              >
                <Input.Password placeholder="영문, 숫자, 특수문자 조합 (8자리 이상)" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="비밀번호 확인"
                dependencies={['password']}
                rules={[{ required: true }, passwordConfirmRule(form.getFieldValue, 'password')]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="adminName"
                label="이름"
                rules={[{ required: true }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="department"
                label="소속 부서"
                rules={[{ required: true }]}
                validateTrigger="onBlur"
              >
                <Select placeholder="소속 부서를 선택하세요" options={[...DEPARTMENT_OPTIONS]} />
              </Form.Item>
              {/* 약관 동의 체크박스 */}
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
