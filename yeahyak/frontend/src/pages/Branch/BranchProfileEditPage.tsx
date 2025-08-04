import { Button, Card, Form, Input, message, Typography } from 'antd';
import instance from '../../api/api';
import AddressInput from '../../components/AddressInput';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy } from '../../types/pharmacy';

export default function BranchProfileEditPage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // 로그인 API 연동 후 주석 해제
  // useEffect(() => {
  //   form.setFieldsValue({
  //     pharmacyName: profile.pharmacyName,
  //     bizRegNo: profile.bizRegNo,
  //     representativeName: profile.representativeName,
  //     postcode: profile.postcode,
  //     address: profile.address,
  //     detailAddress: profile.detailAddress,
  //     contact: profile.contact,
  //   });
  // }, [form, profile]);

  const handleSubmit = async (values: Partial<Pharmacy>) => {
    try {
      const payload = { ...profile, ...values };
      const dummyPayload = {
        pharmacyName: '쫑이약국',
        representativeName: '송쫑이',
        address: '부산 해운대구 우동 111-11',
        phoneNumber: '051-123-4567',
      };
      const res = await instance.put(`/auth/update/${profile.id}`, dummyPayload);
      // 테스트용 로그
      console.log('🔥✅ 약국 정보 수정 응답:', res.data);
      updateProfile(payload);
      messageApi.success('약국 정보가 수정되었습니다!');
    } catch (error: any) {
      console.error('약국 정보 수정 실패:', error);
      messageApi.error(error.response?.data?.message || '약국 정보 수정에 실패했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        약국 정보 수정
      </Typography.Title>

      <Card style={{ padding: '8px' }}>
        <Form form={form} name="branch-profile-edit" onFinish={handleSubmit}>
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

          <Button type="primary" htmlType="submit" block>
            수정
          </Button>
        </Form>
      </Card>
    </>
  );
}
