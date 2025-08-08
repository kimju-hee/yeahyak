import { Button, Card, Flex, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../../api/api';
import AddressInput from '../../../components/AddressInput';
import TermsAndPrivacyCheckbox from '../../../components/TermsAndPolicyCheckbox';
import type { SignupRequest } from '../../../types/auth.type';

export default function RegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 연락처 포맷터
  const formatContact = (value: number | string | undefined) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, '');

    // 02-000-0000 또는 02-0000-0000
    if (num.startsWith('02')) {
      if (num.length <= 2) return num;
      if (num.length <= 6) return `${num.slice(0, 2)}-${num.slice(2)}`;
      return num.length === 10
        ? `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
        : `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
    }

    // 000-000-0000 또는 000-0000-0000
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return num.length === 11
      ? `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
      : `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  };

  // 사업자등록번호 포맷터 (000-00-00000)
  const formatBizRegNo = (value: number | string | undefined) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, '');
    if (num.length <= 3) return num;
    if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
  };

  const handleSubmit = async (
    values: SignupRequest & {
      confirmPassword: string;
      agreement: boolean;
    },
  ) => {
    try {
      const { confirmPassword, agreement, ...payload } = values;
      const res = await instance.post('/auth/signup', payload);
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
          예약 회원가입
        </Typography.Title>

        <Card style={{ padding: '24px' }}>
          <Form
            form={form}
            name="register"
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
                name="pharmacyName"
                label="약국명"
                rules={[{ required: true, message: '약국명을 입력해주세요.' }]}
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
              >
                <Input
                  maxLength={12}
                  onChange={(e) => {
                    const formattedValue = formatBizRegNo(e.target.value);
                    form.setFieldValue('bizRegNo', formattedValue);
                  }}
                  onKeyDown={(e) => {
                    // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        'Backspace',
                        'Delete',
                        'Tab',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="representativeName"
                label="대표자명"
                rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}
              >
                <Input />
              </Form.Item>
              <AddressInput
                postcodeName="postcode"
                addressName="address"
                detailAddressName="detailAddress"
                label="주소"
                required={true}
              />
              <Form.Item
                name="contact"
                label="연락처"
                rules={[{ required: true, message: '연락처를 입력해주세요.' }]}
                normalize={(value) => {
                  if (!value) return '';
                  return value.replace(/\D/g, '');
                }}
              >
                <Input
                  maxLength={13}
                  onChange={(e) => {
                    const formattedValue = formatContact(e.target.value);
                    form.setFieldValue('contact', formattedValue);
                  }}
                  onKeyDown={(e) => {
                    // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        'Backspace',
                        'Delete',
                        'Tab',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
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
