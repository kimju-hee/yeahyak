import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { instance } from '../../api/api';
import AddressInput from '../../components/AddressInput';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy, PharmacyProfileUpdateRequest } from '../../types/profile.type';

export default function BranchProfileEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    form.setFieldsValue({
      pharmacyName: profile.pharmacyName,
      bizRegNo: profile.bizRegNo,
      representativeName: profile.representativeName,
      postcode: profile.postcode,
      address: profile.address,
      detailAddress: profile.detailAddress,
      contact: profile.contact,
    });
  }, [profile]);

  const handleSubmit = async (values: Omit<PharmacyProfileUpdateRequest, 'status'>) => {
    const payload: PharmacyProfileUpdateRequest = {
      ...values,
      pharmacyId: profile.pharmacyId,
      userId: profile.userId,
      status: profile.status,
    };
    try {
      const res = await instance.put(`/auth/update/${profile.pharmacyId}`, payload);
      // LOG: 테스트용 로그
      console.log('🔥✅ 약국 정보 수정 응답:', res.data);
      if (res.data.success) {
        updateProfile(payload);
        messageApi.success('약국 정보가 수정되었습니다!');
      }
    } catch (e: any) {
      console.error('약국 정보 수정 실패:', e);
      messageApi.error(e.response?.data?.message || '약국 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        약국 정보 수정
      </Typography.Title>

      <Card style={{ width: '80%', padding: '8px', margin: '0 auto' }}>
        <Form form={form} name="branch-profile-edit" onFinish={handleSubmit}>
          <Form.Item
            name="pharmacyName"
            label="약국명"
            rules={[{ required: true, message: '약국명을 입력해주세요.' }]}
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
          <AddressInput
            postcodeName="postcode"
            addressName="address"
            detailAddressName="detailAddress"
            label="주소"
            required={true}
          ></AddressInput>
          <Form.Item
            name="contact"
            label="연락처"
            rules={[{ required: true, message: '연락처를 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" htmlType="submit">
              수정
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
