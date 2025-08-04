import { Button, Card, Form, Input, message, Select, Typography } from 'antd';
import instance from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import type { Admin } from '../../types/admin';

export default function HqProfileEditPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const profile = useAuthStore((state) => state.profile) as Admin;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // 로그인 API 연동 후 주석 해제
  // useEffect(() => {
  //   form.setFieldsValue({
  //     adminName: profile.adminName,
  //     department: profile.department,
  //   });
  // }, [form, profile]);

  const handleSubmit = async (values: Partial<Admin>) => {
    try {
      const payload = { ...profile, ...values };
      const dummyPayload = {
        adminName: '송쫑이',
        department: '멍멍부',
      };
      const res = await instance.put(`/auth/admin/update/${profile.id}`, dummyPayload);
      // 테스트용 로그
      console.log('🔥✅ 개인 정보 수정 응답:', res.data);
      updateProfile(payload);
      messageApi.success('개인 정보가 수정되었습니다!');
    } catch (error: any) {
      console.error('개인 정보 수정 실패:', error);
      messageApi.error(error.response?.data?.message || '개인 정보 수정에 실패했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        내 정보 수정
      </Typography.Title>

      <Card style={{ padding: '8px' }}>
        <Form form={form} name="hq-profile-edit" onFinish={handleSubmit}>
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
            {/* <Select defaultValue={profile.department} />*/}
            <Select
              placeholder="소속 부서를 선택하세요"
              options={[
                { value: '운영팀', label: '운영팀' },
                { value: '총무팀', label: '총무팀' },
                { value: '멍멍부', label: '멍멍부' },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            수정
          </Button>
        </Form>
      </Card>
    </>
  );
}
