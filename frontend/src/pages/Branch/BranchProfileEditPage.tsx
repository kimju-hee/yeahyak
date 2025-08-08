import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useEffect } from 'react';
import { instance } from '../../api/api';
import AddressInput from '../../components/AddressInput';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy, PharmacyProfileUpdateRequest } from '../../types/profile.type';

export default function BranchProfileEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // 연락처 포맷터
  const formatContact = (value: number | string | undefined) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, '');

    // 02-000-0000 또는 02-0000-0000
    if (num.startsWith('02')) {
      if (num.length <= 2) return num;
      if (num.length <= 6) return `${num.slice(0, 2)}-${num.slice(2)}`;
      return num.length === 10
        ? `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
        : `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
    }

    // 000-000-0000 또는 000-0000-0000
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return num.length === 11
      ? `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
      : `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  };

  // 사업자등록번호 포맷터 (000-00-00000)
  const formatBizRegNo = (value: number | string | undefined) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, '');
    if (num.length <= 3) return num;
    if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
  };

  useEffect(() => {
    form.setFieldsValue({
      pharmacyName: profile.pharmacyName,
      bizRegNo: formatBizRegNo(profile.bizRegNo),
      representativeName: profile.representativeName,
      postcode: profile.postcode,
      address: profile.address,
      detailAddress: profile.detailAddress,
      contact: formatContact(profile.contact),
    });
  }, [profile]);

  const handleSubmit = async (values: Omit<PharmacyProfileUpdateRequest, 'status'>) => {
    try {
      const payload: PharmacyProfileUpdateRequest = {
        ...values,
        pharmacyId: profile.pharmacyId,
        userId: profile.userId,
        status: profile.status,
      };
      const res = await instance.put(`/auth/update/${profile.pharmacyId}`, payload);
      // LOG: 테스트용 로그
      console.log('🧪 약국 정보 수정 응답:', res.data);
      if (res.data.success) {
        updateProfile(payload);
        messageApi.success('약국 정보가 수정되었습니다!');
      }
    } catch (e: any) {
      console.error('약국 정보 수정 실패:', e);
      messageApi.error(e.message || '약국 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        약국 정보 수정
      </Typography.Title>

      <Card style={{ width: '80%', padding: '8px', margin: '0 auto' }}>
        <Form
          form={form}
          name="branch-profile-edit"
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
            label="주소"
            required={true}
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
              onKeyDown={(e) => {
                // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    'Backspace',
                    'Delete',
                    'Tab',
                    'ArrowLeft',
                    'ArrowRight',
                    'ArrowUp',
                    'ArrowDown',
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
            />
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
