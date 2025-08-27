import { Button, Card, Flex, Form, Input, message, Select, Typography } from 'antd';
import { useEffect } from 'react';
import { profileAPI } from '../../api';
import { ADMIN_DEPARTMENT_OPTIONS } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import type { Admin, AdminDepartment, AdminProfileUpdateRequest } from '../../types/pharmacy.type';

export default function HqProfileEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const profile = useAuthStore((state) => state.profile) as Admin;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  useEffect(() => {
    form.setFieldsValue({
      adminName: profile.adminName,
      department: profile.department,
    });
  }, [profile]);

  const handleSubmit = async (values: { adminName: string; department: AdminDepartment }) => {
    try {
      const payload: AdminProfileUpdateRequest = {
        adminId: profile.adminId,
        userId: profile.userId,
        adminName: values.adminName,
        department: values.department,
      };
      const res = await profileAPI.updateAdminProfile(payload);

      if (res.success) {
        updateProfile(payload);
        messageApi.success('개인 정보가 수정되었습니다!');
      }
    } catch (e: any) {
      console.error('개인 정보 수정 실패:', e);
      messageApi.error(e.response?.data?.message || '개인 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        내 정보 수정
      </Typography.Title>

      <Card style={{ width: '80%', padding: '8px', margin: '0 auto' }}>
        <Form
          form={form}
          name="hq-profile-edit"
          onFinish={handleSubmit}
          labelCol={{ span: 6 }}
          labelWrap
          wrapperCol={{ span: 15, offset: -3 }}
        >
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
            <Select placeholder="소속 부서를 선택하세요" options={[...ADMIN_DEPARTMENT_OPTIONS]} />
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
