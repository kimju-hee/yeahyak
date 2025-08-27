import { Button, Flex, Form, Input } from 'antd';
import { useEffect } from 'react';
import type { Region } from '../types';

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressInputProps {
  postcodeName: string;
  addressName: string;
  detailAddressName: string;
  region: Region | string;
  label: string;
}

export default function AddressInput({
  postcodeName = '',
  addressName = '',
  detailAddressName = '',
  region = '',
  label = '주소',
}: AddressInputProps) {
  const form = Form.useFormInstance();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        const postcode = data.zonecode;
        const address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        const region = data.sido;
        form.setFieldsValue({
          [postcodeName]: postcode,
          [addressName]: address,
          [detailAddressName]: '',
          [region]: region,
        });
      },
    }).open();
  };

  return (
    <Form.Item label={label}>
      <Flex vertical gap={8}>
        <Flex gap={8}>
          <Form.Item
            name={postcodeName}
            noStyle
            rules={[{ required: true, message: '우편번호를 입력해주세요.' }]}
            validateTrigger="onSubmit"
          >
            <Input readOnly placeholder="우편번호" />
          </Form.Item>
          <Form.Item name={region} noStyle>
            <Input readOnly placeholder="지역" />
          </Form.Item>
          <Button onClick={handleSearchAddress}>주소 검색</Button>
        </Flex>
      </Flex>
      <Form.Item
        name={addressName}
        noStyle
        rules={[{ required: true, message: '주소를 입력해주세요.' }]}
        validateTrigger="onSubmit"
      >
        <Input readOnly placeholder="기본 주소" style={{ marginTop: 8 }} />
      </Form.Item>
      <Form.Item name={detailAddressName} noStyle>
        <Input placeholder="상세 주소" style={{ marginTop: 8 }} />
      </Form.Item>
    </Form.Item>
  );
}
