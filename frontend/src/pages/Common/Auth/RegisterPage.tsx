import { Button, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values: any) => {
    console.log('회원가입 시도:', values);

    // TODO: 여기에 회원가입 API 호출 로직을 추가하세요.
    // 현재는 API 호출 없이 성공 메시지를 표시하고 로그인 페이지로 이동합니다.
    // 실제 회원가입 성공 여부는 API 응답에 따라 처리해야 합니다.

    messageApi.success('회원가입 성공!');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {contextHolder}
      <Title level={1} style={{ marginBottom: 24 }}>
        예약
      </Title>
      <Form name="register" onFinish={onFinish}>
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
          dependencies={['password']}
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="비밀번호 확인"
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
          rules={[{ required: true, message: '약국명을 입력해주세요.', whitespace: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="businessNumber"
          label="사업자등록번호"
          rules={[{ required: true, message: '사업자등록번호를 입력해주세요.' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="representativeName"
          label="대표자명"
          rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="address" label="주소">
          <Input />
        </Form.Item>
        <Form.Item name="contact" label="연락처">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            회원가입
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
