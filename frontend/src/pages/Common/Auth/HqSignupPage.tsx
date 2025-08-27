import { Button, Card, Flex, Form, Input, message, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import TermsAndPrivacyCheckbox from '../../../components/TermsAndPolicyCheckbox';
import { ADMIN_DEPARTMENT_OPTIONS } from '../../../constants';
import type { AdminSignupRequest } from '../../../types/auth.type';
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
        messageApi.success('회원가입이 완료되었습니다.');
        navigate('/login', { replace: true });
      }
    } catch (e: any) {
      console.error('본사 회원가입 실패:', e);
      messageApi.error(e.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
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
            form={form}
            name="signup-hq"
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
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true, message: '비밀번호를 입력해주세요.' },
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
                rules={[
                  { required: true, message: '비밀번호 확인을 입력해주세요.' },
                  passwordConfirmRule(form.getFieldValue, 'password'),
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="adminName"
                label="이름"
                rules={[{ required: true, message: '이름을 입력해주세요.' }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="department"
                label="소속 부서"
                rules={[{ required: true, message: '소속 부서를 선택해주세요.' }]}
                validateTrigger="onBlur"
              >
                <Select
                  placeholder="소속 부서를 선택하세요"
                  options={[...ADMIN_DEPARTMENT_OPTIONS]}
                />
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
