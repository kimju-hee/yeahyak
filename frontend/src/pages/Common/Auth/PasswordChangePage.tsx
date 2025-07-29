import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import type { User } from '../../../mocks/types';
import { useAuthStore } from '../../../stores/authStore';

export default function PasswordChangePage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const user = useAuthStore((state) => state.user) as User;
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    form.setFieldsValue({
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }, [form, user]);

  const onFinish = (values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    console.log('계정 정보 수정 시도:', values);

    // TODO: 여기에 계정 정보 수정 API 호출 로직을 추가하세요.

    updateUser({ password: values.newPassword });
    messageApi.success('계정 정보가 수정되었습니다!');
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        계정 정보 수정
      </Typography.Title>
      <Card>
        <Form form={form} name="account-edit" onFinish={onFinish}>
          <Form.Item name="email" label="이메일">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="currentPassword"
            label="현재 비밀번호"
            rules={[
              { required: true, message: '현재 비밀번호를 입력해주세요.' },
              ({}) => ({
                validator(_, value) {
                  if (!value || user?.password === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('현재 비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="새 비밀번호"
            dependencies={['newPassword']}
            rules={[{ required: true, message: '새 비밀번호를 입력해주세요.' }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="새 비밀번호 확인"
            rules={[
              { required: true, message: '새 비밀번호 확인을 입력해주세요.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('새 비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              수정
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
