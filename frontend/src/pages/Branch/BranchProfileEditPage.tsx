import { Button, Card, Flex, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import { authAPI } from '../../api';
import AddressInput from '../../components/AddressInput';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy, PharmacyUpdateRequest } from '../../types';
import { formatBizRegNo, formatContact, handleNumberOnlyKeyDown } from '../../utils';

export default function BranchProfileEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  Form.useWatch([], form);

  useEffect(() => {
    form.setFieldsValue({
      pharmacyName: profile.pharmacyName,
      bizRegNo: formatBizRegNo(profile.bizRegNo),
      representativeName: profile.representativeName,
      postcode: profile.postcode,
      address: profile.address,
      detailAddress: profile.detailAddress,
      region: profile.region,
      contact: formatContact(profile.contact),
    });
  }, [profile]);

  const handleSubmit = async (values: PharmacyUpdateRequest & { bizRegNo: string }) => {
    try {
      const { bizRegNo, ...payload } = values;
      const res = await authAPI.updatePharmacy(profile.pharmacyId, payload);

      if (res.success) {
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
      <Typography.Title
        level={3}
        style={{ marginBottom: '24px', textAlign: 'center', width: '100%' }}
      >
        약국 정보 수정
      </Typography.Title>

      <Card style={{ width: '80%', padding: '8px', margin: '0 auto' }}>
        <Form
          form={form}
          name="pharmacy-edit"
          onFinish={handleSubmit}
          labelCol={{ span: 6 }}
          labelWrap
          wrapperCol={{ span: 15, offset: -3 }}
        >
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
            regionName="region"
            label="주소"
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
              onKeyDown={handleNumberOnlyKeyDown}
            />
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
