import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button, Card, Divider, Flex, Form, Image, Input, InputNumber,
  message, Select, Space, Typography, Upload
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../api/api';
import {
  PRODUCT_MAIN_CATEGORY,
  PRODUCT_SUB_CATEGORY,
  type ProductMainCategory,
} from '../../types/product.type';

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function HqProductRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [imgList, setImgList] = useState<UploadFile[]>([]);
  const [pdfList, setPdfList] = useState<UploadFile[]>([]);

  const watchedType = Form.useWatch('mainCategory', form);

  const typeOptions = Object.keys(PRODUCT_MAIN_CATEGORY).map((key) => ({
    value: key,
    label: PRODUCT_MAIN_CATEGORY[key as ProductMainCategory],
  }));

  const subCategoryOptions =
  watchedType && PRODUCT_SUB_CATEGORY[watchedType as ProductMainCategory]
    ? PRODUCT_SUB_CATEGORY[watchedType as ProductMainCategory].map((item) =>
        typeof item === 'string'
          ? {
              value: item, // 예: "COLD_MEDICINE"
              label: item.replace(/_/g, ' '), // 예: "COLD MEDICINE"
            }
          : {
              value: (item as { value: string; label: string }).value,
              label: (item as { value: string; label: string }).label,
            }
      )
    : [];




  useEffect(() => {
    form.setFieldsValue({ subCategory: undefined });
  }, [watchedType]);

  const handleImgChange: UploadProps['onChange'] = async ({ fileList }) => {
    setImgList(fileList);
    const file = fileList[0];
    if (!file) {
      form.setFieldsValue({ productImgUrl: '' });
      return;
    }
    const base64 = await getBase64(file.originFileObj as File);
    form.setFieldsValue({ productImgUrl: base64 });
  };

  const handlePreview = async (img: UploadFile) => {
    if (!img.url && !img.preview) {
      img.preview = await getBase64(img.originFileObj as File);
    }
    setPreviewImage(img.url || (img.preview as string));
    setPreviewOpen(true);
  };

  const handlePdfChange: UploadProps['onChange'] = ({ fileList }) => {
    setPdfList(fileList);
    const file = fileList[0];
    if (file) {
      const fallbackPath = file.name; // 파일 경로 대신 이름만 넘김
      form.setFieldsValue({ pdfPath: fallbackPath });
    } else {
      form.setFieldsValue({ pdfPath: '' }); // 업로드 안 하면 빈값
    }
  };

  const handleAiSummarize = async () => {
    if (pdfList.length === 0) {
      messageApi.warning('PDF 파일을 먼저 업로드해 주세요.');
      return;
    }

    try {
      // AI 요약 실제 호출 X (임시 더미처리)
      messageApi.info('AI 요약 기능은 현재 비활성화되어 있습니다.');
    } catch (e) {
      console.error('요약 실패:', e);
    }
  };

  const handleSubmit = async () => {
  try {
    const payload = await form.getFieldsValue();
    
    const res = await instance.post('/products', payload);
    // LOG: 테스트용 로그
    console.log('✨ 제품 등록 응답:', res.data);
    if (res.data.success) {
      const productId = res.data.data[0]; // ✅ productId 추출
      navigate(`/hq/products/${productId}`); // ✅ 상세페이지로 이동
    }
  } catch (e: any) {
    console.error('제품 등록 실패:', e);
    messageApi.error(e.response?.data?.message || '제품 등록 중 오류가 발생했습니다.');
  }
};


  return (
    <>
      {contextHolder}
      <Space size="large" align="baseline">
        <Button type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <Typography.Title level={3}>제품 등록</Typography.Title>
      </Space>

      <Card style={{ width: '80%', margin: '0 auto', borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex gap={24} wrap justify="space-between">
            <Flex vertical flex={1} align="center">
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={imgList}
                beforeUpload={() => false}
                onChange={handleImgChange}
                onPreview={handlePreview}
                maxCount={1}
              >
                {imgList.length >= 1 ? null : '이미지 업로드'}
              </Upload>
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: setPreviewOpen,
                  afterOpenChange: (v) => !v && setPreviewImage(''),
                }}
                src={previewImage || undefined} // ✅ 빈 문자열이면 undefined
              />

              <Form.Item name="productImgUrl" noStyle>
                <Input type="hidden" />
              </Form.Item>
            </Flex>

            <Flex vertical flex={1}>
              <Form.Item name="productName" label="제품명" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="manufacturer" label="제조사" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="productCode" label="보험코드" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Flex>
          </Flex>

          <Divider />

          <Flex wrap gap={24} justify="space-between">
            <Flex vertical flex={1}>
              <Form.Item name="mainCategory" label="유형" rules={[{ required: true }]}>
                <Select options={typeOptions} placeholder="선택" />
              </Form.Item>
              <Form.Item name="subCategory" label="구분" rules={[{ required: true }]}>
                <Select options={subCategoryOptions} placeholder="선택" disabled={!watchedType} />
              </Form.Item>
            </Flex>

            <Flex vertical flex={1}>
              <Form.Item name="unit" label="단위" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="unitPrice" label="판매가" rules={[{ required: true }]}>
                <InputNumber
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'}
                  parser={(v) => v?.replace(/[원,]/g, '') as unknown as number}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Flex>
          </Flex>

          <Divider />

          <Flex wrap justify="space-between" gap={24}>
            <Typography.Title level={4}>제품 상세 정보</Typography.Title>
            <Space wrap>
              <Upload
                accept=".pdf"
                listType="text"
                fileList={pdfList}
                beforeUpload={() => false}
                onChange={handlePdfChange}
                maxCount={1}
              >
                {pdfList.length >= 1 ? null : <Button icon={<UploadOutlined />}>업로드</Button>}
              </Upload>
              <Button type="primary" onClick={handleAiSummarize}>
                AI 요약
              </Button>
            </Space>
          </Flex>

          <Form.Item name="pdfPath" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item name="details" style={{ marginTop: 16 }}>
            <Input.TextArea rows={8} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" htmlType="submit">
              등록
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
