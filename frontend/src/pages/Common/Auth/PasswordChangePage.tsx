import { Button, Card, Flex, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import { authAPI } from '../../../api';
import { useAuthStore } from '../../../stores/authStore';

import type { PasswordChangeRequest, User } from '../../../types';
import {
  passwordConfirmRule,
  passwordNotSameAsCurrentRule,
  passwordNotSameAsIdRule,
  passwordValidationRule,
} from '../../../utils';

export default function PasswordChangePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const user = useAuthStore((state) => state.user) as User;

  useEffect(() => {
    form.setFieldsValue({
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }, [form, user]);

  const handleSubmit = async (values: PasswordChangeRequest & { confirmNewPassword: string }) => {
    try {
      const payload: PasswordChangeRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      await authAPI.changePassword(payload);

      messageApi.success('비밀번호가 변경되었습니다!');
    } catch (e: any) {
      console.error('비밀번호 변경 실패:', e);
      messageApi.error(e.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      form.resetFields(['currentPassword', 'newPassword', 'confirmNewPassword']);
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title
        level={3}
        style={{ marginBottom: '24px', textAlign: 'center', width: '100%' }}
      >
        비밀번호 변경
      </Typography.Title>

      <Card style={{ width: '80%', padding: '8px', margin: '0 auto' }}>
        <Form
          form={form}
          name="password-change"
          onFinish={handleSubmit}
          labelCol={{ span: 6 }}
          labelWrap
          wrapperCol={{ span: 15, offset: -3 }}
        >
          <Form.Item name="email" label="이메일">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="currentPassword"
            label="현재 비밀번호"
            rules={[{ required: true, message: '현재 비밀번호를 입력해주세요.' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="새 비밀번호"
            rules={[
              { required: true, message: '새 비밀번호를 입력해주세요.' },
              passwordValidationRule,
              passwordNotSameAsIdRule(form.getFieldValue, 'email'),
              passwordNotSameAsCurrentRule(form.getFieldValue, 'currentPassword'),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="영문, 숫자, 특수문자 조합 (8자리 이상)" />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="새 비밀번호 확인"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '새 비밀번호 확인을 입력해주세요.' },
              passwordConfirmRule(form.getFieldValue, 'newPassword'),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Flex justify="center">
            <Button type="primary" htmlType="submit">
              수정
            </Button>
          </Flex>
        </Form>
      </Card>
    </>
  );
}
