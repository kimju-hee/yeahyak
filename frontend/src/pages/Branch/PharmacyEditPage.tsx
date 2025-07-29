import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import type { Pharmacy } from '../../mocks/types';
import { useAuthStore } from '../../stores/authStore';

export default function PharmacyEditPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  useEffect(() => {
    form.setFieldsValue({
      pharmacyName: profile.pharmacyName,
      bizRegNo: profile.bizRegNo,
      representativeName: profile.representativeName,
      address: profile.address,
      contact: profile.contact,
    });
  }, [form, profile]);

  const onFinish = (values: Partial<Pharmacy>) => {
    console.log('약국 정보 수정 시도:', values);
    const updatedProfile = { ...profile, ...values };

    // TODO: 여기에 약국 정보 수정 API 호출 로직을 추가하세요.

    updateProfile(updatedProfile);
    messageApi.success('약국 정보가 수정되었습니다!');
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        약국 정보 수정
      </Typography.Title>
      <Card>
        <Form form={form} name="pharmacy-edit" onFinish={onFinish}>
          <Form.Item
            name="pharmacyName"
            label="약국명"
            rules={[{ required: true, message: '약국명을 입력해주세요.', whitespace: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="bizRegNo" label="사업자등록번호">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="representativeName"
            label="대표자명"
            rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="주소"
            rules={[{ required: true, message: '주소를 입력해주세요.', whitespace: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="연락처">
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
