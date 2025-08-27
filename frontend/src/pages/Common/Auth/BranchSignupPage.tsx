import { Button, Card, Flex, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';
import AddressInput from '../../../components/AddressInput';
import TermsAndPrivacyCheckbox from '../../../components/TermsAndPolicyCheckbox';
import type { PharmacySignupReq } from '../../../types';
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
    values: PharmacySignupReq & {
      confirmPassword: string;
      agreement: boolean;
    },
  ) => {
    try {
      const { confirmPassword, agreement, ...payload } = values;
      const res = await authAPI.pharmacySignup(payload);

      if (res.success) {
        messageApi.success('회원가입이 완료되었습니다.');
        navigate('/login', { replace: true });
      }
    } catch (e: any) {
      console.error('약국 회원가입 실패:', e);
      messageApi.error(e.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Flex vertical justify="center" align="center">
        <Typography.Title level={1} style={{ marginBottom: '24px' }}>
          예약 회원가입
        </Typography.Title>

        <Card style={{ padding: '24px' }}>
          <Form
            form={form}
            name="signup-branch"
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
                name="pharmacyName"
                label="약국명"
                rules={[{ required: true, message: '약국명을 입력해주세요.' }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="bizRegNo"
                label="사업자등록번호"
                rules={[{ required: true, message: '사업자등록번호를 입력해주세요.' }]}
                normalize={(value) => {
                  if (!value) return '';
                  return value.replace(/\D/g, '');
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
                rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}
                validateTrigger="onBlur"
              >
                <Input />
              </Form.Item>
              <AddressInput
                postcodeName="postcode"
                addressName="address"
                detailAddressName="detailAddress"
                region="region"
                label="주소"
              />
              <Form.Item
                name="contact"
                label="연락처"
                rules={[{ required: true, message: '연락처를 입력해주세요.' }]}
                normalize={(value) => {
                  if (!value) return '';
                  return value.replace(/\D/g, '');
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
