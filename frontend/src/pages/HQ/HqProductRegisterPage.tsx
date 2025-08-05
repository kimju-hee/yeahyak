import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Typography,
  Upload,
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

  const typeOptions = Object.keys(PRODUCT_MAIN_CATEGORY).map((type) => ({
    value: type,
    label: PRODUCT_MAIN_CATEGORY[type as ProductMainCategory],
  }));
  const watchedType = Form.useWatch('mainCategory', form);
  const subCategoryOptions =
    watchedType && PRODUCT_SUB_CATEGORY[watchedType as ProductMainCategory]
      ? PRODUCT_SUB_CATEGORY[watchedType as ProductMainCategory].map((label) => ({
          value: label,
          label,
        }))
      : [];

  useEffect(() => {
    form.setFieldsValue({ subCategory: undefined });
  }, [watchedType]);

  // TODO: 이미지 업로드 기능 테스트
  const handleImgChange: UploadProps['onChange'] = async ({ fileList }) => {
    setImgList(fileList);
    const img = fileList[0];

    if (!img) {
      form.setFieldsValue({ productImgUrl: '' });
      return;
    }
    if (img.originFileObj) {
      const base64 = await getBase64(img.originFileObj as File);
      form.setFieldsValue({ productImgUrl: base64 });
    } else if (img.url) {
      form.setFieldsValue({ productImgUrl: img.url });
    }
  };

  const handlePreview = async (img: UploadFile) => {
    if (!img.url && !img.preview) {
      img.preview = await getBase64(img.originFileObj as File);
    }
    setPreviewImage(img.url || (img.preview as string));
    setPreviewOpen(true);
  };

  // TODO: PDF 업로드 기능 테스트
  const handlePdfChange: UploadProps['onChange'] = async ({ fileList }) => {
    setPdfList(fileList);
  };

  // TODO: AI 요약 기능 테스트
  const handleAiSummarize = async () => {
    if (pdfList.length === 0) {
      messageApi.warning('PDF 파일을 먼저 업로드해 주세요.');
      return;
    }

    try {
      // TODO: API 연동 확인
      const res = await instance.post('summarize/new-drug', {
        file: pdfList[0].originFileObj,
      });
      // LOG: 테스트용 로그
      console.log('✨ AI 요약 응답:', res.data);
      if (res.data.success) {
        form.setFieldsValue({ details: res.data.summary });
        messageApi.success('AI가 제품 정보를 요약했습니다.');
      }
    } catch (e: any) {
      console.error('제품 정보 요약 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 정보 요약 중 오류가 발생했습니다.');
    }
  };

  // TODO: API 연동 확인
  const handleSubmit = async () => {
    try {
      const payload = await form.getFieldsValue();
      const res = await instance.post('/products', payload);
      // LOG: 테스트용 로그
      console.log('✨ 제품 등록 응답:', res.data);
      if (res.data.success) {
        navigate(`/hq/products/${res.data.data.productId}`);
      }
    } catch (e: any) {
      console.error('제품 등록 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      {/* TODO: 뒤로가기 버튼을 눌렀을 때 편집 여부에 따른 window.confirm 추가 */}
      <Space size="large" align="baseline">
        <Button
          type="link"
          size="large"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          제품 등록
        </Typography.Title>
      </Space>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Form
          form={form}
          name="product-register"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex wrap justify="space-between" gap={24}>
            <Flex vertical flex={1} justify="center" align="center">
              {/* TODO: 인증된 사용자만 파일 업로드 가능하도록 제한 + 파일 용량 제한 + 파일 형식 제한 */}
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
              {previewImage && (
                <Image
                  wrapperStyle={{ display: 'none' }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                  }}
                  src={previewImage}
                />
              )}
              <Form.Item name="productImgUrl" noStyle>
                <Input type="hidden" />
              </Form.Item>
            </Flex>

            <Flex vertical flex={1}>
              <Form.Item
                name="productName"
                label="제품명"
                rules={[{ required: true, message: '제품명을 입력하세요.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="manufacturer"
                label="제조사"
                rules={[{ required: true, message: '제조사를 입력하세요.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="productCode"
                label="보험코드"
                rules={[{ required: true, message: '보험코드를 입력하세요.' }]}
              >
                <Input />
              </Form.Item>
            </Flex>
          </Flex>

          <Divider />

          <Flex wrap justify="space-between" gap={24}>
            <Flex vertical flex={1}>
              <Form.Item
                name="type"
                label="유형"
                rules={[{ required: true, message: '유형을 선택하세요.' }]}
              >
                <Select placeholder="선택" options={typeOptions} />
              </Form.Item>
              <Form.Item
                name="subCategory"
                label="구분"
                rules={[{ required: true, message: '구분을 선택하세요.' }]}
              >
                <Select placeholder="선택" options={subCategoryOptions} disabled={!watchedType} />
              </Form.Item>
            </Flex>

            <Flex vertical flex={1}>
              <Form.Item
                name="unit"
                label="단위"
                rules={[{ required: true, message: '단위를 입력하세요.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="unitPrice"
                label="판매가"
                rules={[{ required: true, message: '판매가를 입력하세요.' }]}
              >
                {/* FIXME: 가격 입력 시 천 단위 콤마 추가해서 보여주되 저장 시에는 숫자만 저장되게 해주세요 */}
                <InputNumber
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'}
                  parser={(value) => value?.replace(/[원,]/g, '') as unknown as number}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Flex>
          </Flex>

          <Divider />

          <Flex wrap justify="space-between" gap={24}>
            <Typography.Title level={4}>제품 상세 정보</Typography.Title>
            <Space wrap>
              {/* TODO: 인증된 사용자만 파일 업로드 가능하도록 제한 + 파일 용량 제한 + 파일 형식 제한 */}
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

          <Form.Item name="details" style={{ marginTop: '16px' }}>
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
