import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import type { Admin } from '../../mocks/types';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileEditPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const profile = useAuthStore((state) => state.profile) as Admin;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  useEffect(() => {
    form.setFieldsValue({
      adminName: profile.adminName,
      department: profile.department,
    });
  }, [form, profile]);

  const onFinish = (values: Partial<Admin>) => {
    console.log('관리자 정보 수정 시도:', values);
    const updatedProfile = { ...profile, ...values };

    // TODO: 여기에 관리자 정보 수정 API 호출 로직을 추가하세요.

    updateProfile(updatedProfile);
    messageApi.success('내 정보가 수정되었습니다!');
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        내 정보 수정
      </Typography.Title>
      <Card>
        <Form form={form} name="profile-edit" onFinish={onFinish}>
          <Form.Item
            name="adminName"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="부서"
            rules={[{ required: true, message: '부서를 입력해주세요.' }]}
          >
            <Input />
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
