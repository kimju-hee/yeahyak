import { Button, Card, Flex, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import { AddressInput, TermsAndPrivacyCheckbox } from '../../../components';
import type { PharmacySignupRequest } from '../../../types';
import {
  formatBizRegNo,
  formatContact,
  handleNumberOnlyKeyDown,
  passwordConfirmRule,
  passwordNotSameAsIdRule,
  passwordValidationRule,
} from '../../../utils';

export default function BranchSignupPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const handleSubmit = async (
    values: PharmacySignupRequest & {
      confirmPassword: string;
      agreement: boolean;
    },
  ) => {
    try {
      const { confirmPassword, agreement, ...payload } = values;
      const res = await authAPI.pharmacySignup(payload);

      if (res.success) {
        navigate('/login', {
          replace: true,
          state: { message: '회원가입이 완료되었습니다! 관리자 승인 후 서비스 이용이 가능합니다.' }, // 로그인 페이지에서 띄울 메시지
        });
      }
    } catch (e: any) {
      console.error('회원가입 실패:', e);
      messageApi.error(e.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
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
          title="가맹점 회원가입"
          variant="borderless"
          style={{ width: 640, minWidth: 480, padding: 36, borderRadius: 36 }}
          styles={{ header: { fontSize: 20, borderBottom: 'none' } }}
        >
          <Form
            form={form}
            name="signup-branch"
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
                name="pharmacyName"
                label="약국명"
                rules={[{ required: true }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="bizRegNo"
                label="사업자등록번호"
                rules={[{ required: true }]}
                normalize={(value) => {
                  if (!value) return '';
                  return value.replace(/\D/g, ''); // 하이픈 제거 후 숫자만 DB 저장
                }}
                validateTrigger="onBlur"
              >
                <Input
                  maxLength={12}
                  onChange={(e) => {
                    const formattedValue = formatBizRegNo(e.target.value);
                    form.setFieldValue('bizRegNo', formattedValue);
                  }}
                  onKeyDown={handleNumberOnlyKeyDown}
                />
              </Form.Item>
              <Form.Item
                name="representativeName"
                label="대표자명"
                rules={[{ required: true }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              {/* 주소 입력 컴포넌트 */}
              <AddressInput />
              <Form.Item
                name="contact"
                label="연락처"
                rules={[{ required: true }]}
                normalize={(value) => {
                  if (!value) return '';
                  return value.replace(/\D/g, ''); // 하이픈 제거 후 숫자만 DB 저장
                }}
                validateTrigger="onBlur"
              >
                <Input
                  maxLength={13}
                  onChange={(e) => {
                    const formattedValue = formatContact(e.target.value);
                    form.setFieldValue('contact', formattedValue);
                  }}
                  onKeyDown={handleNumberOnlyKeyDown}
                />
              </Form.Item>
              {/* 약관 동의 체크박스 */}
              <TermsAndPrivacyCheckbox />
              <Button type="primary" htmlType="submit" block>
                회원가입
              </Button>
            </Flex>
          </Form>
        </Card>
      </Flex>
    </>
  );
}
