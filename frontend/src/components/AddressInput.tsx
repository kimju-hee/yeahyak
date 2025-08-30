import { Button, Flex, Form, Input } from 'antd';
import { useEffect } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}

export function AddressInput() {
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
        try {
          const postcode = data.zonecode;
          const address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          const region = data.sido;

          form.setFieldsValue({
            postcode: postcode,
            address: address,
            detailAddress: '',
            region: region,
          });
        } catch (error) {
          console.error('주소 설정 중 오류가 발생했습니다: ', error);
        }
      },
    }).open();
  };

  return (
    <Form.Item label="주소" required>
      <Flex vertical gap={8}>
        <Flex gap={8}>
          <Form.Item
            name="우편번호"
            rules={[{ required: true }]}
            validateTrigger="onSubmit"
            noStyle
          >
            <Input readOnly placeholder="우편번호" style={{ cursor: 'default' }} />
          </Form.Item>
          <Form.Item name="지역" noStyle>
            <Input readOnly placeholder="지역" style={{ cursor: 'default' }} />
          </Form.Item>
          <Button onClick={handleSearchAddress}>주소 검색</Button>
        </Flex>
        <Form.Item name="기본 주소" rules={[{ required: true }]} validateTrigger="onSubmit" noStyle>
          <Input readOnly placeholder="기본 주소" style={{ cursor: 'default' }} />
        </Form.Item>
        <Form.Item name="상세 주소" noStyle>
          <Input placeholder="(선택) 상세 주소" />
        </Form.Item>
      </Flex>
    </Form.Item>
  );
}
