import { Button, Flex, Form, Input } from 'antd';
import { useEffect } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressInputProps {
  postcodeName: string;
  addressName: string;
  detailAddressName: string;
  label: string;
  required: boolean;
}

export default function AddressInput({
  postcodeName = '',
  addressName = '',
  detailAddressName = '',
  label = '주소',
  required = true,
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
        form.setFieldsValue({
          [postcodeName]: postcode,
          [addressName]: address,
          [detailAddressName]: '',
        });
      },
    }).open();
  };

  return (
    <Form.Item label={label} required={required}>
      <Flex vertical gap={8}>
        <Flex gap={8}>
          <Form.Item
            name={postcodeName}
            noStyle
            rules={[{ required: true, message: '우편번호를 입력해주세요.' }]}
          >
            <Input readOnly placeholder="우편번호" />
          </Form.Item>
          <Button onClick={handleSearchAddress}>주소 검색</Button>
        </Flex>
      </Flex>
      <Form.Item
        name={addressName}
        noStyle
        rules={[{ required: true, message: '주소를 입력해주세요.' }]}
      >
        <Input readOnly placeholder="기본 주소" style={{ marginTop: 8 }} />
      </Form.Item>
      <Form.Item
        name={detailAddressName}
        noStyle
        rules={[{ required: true, message: '상세 주소를 입력해주세요.' }]}
      >
        <Input placeholder="상세 주소" style={{ marginTop: 8 }} />
      </Form.Item>
    </Form.Item>
  );
}
