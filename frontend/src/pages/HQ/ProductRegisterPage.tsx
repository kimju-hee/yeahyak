import { UploadOutlined } from '@ant-design/icons';
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
  Modal,
  Select,
  Space,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI, productAPI } from '../../api';
import { getProductSubCategoryOptions, MAIN_CATEGORY_OPTIONS } from '../../constants';
import type { MainCategory, ProductCreateRequest } from '../../types';

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function ProductRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [imgFileList, setImgFileList] = useState<UploadFile[]>([]);
  const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const watchedMainCategory = Form.useWatch('mainCategory', form);

  const handleImgChange: UploadProps['onChange'] = async ({ fileList }) => {
    setImgFileList(fileList);
    if (fileList[0].originFileObj) {
      const base64 = await getBase64(fileList[0].originFileObj as File);
      form.setFieldsValue({ productImgUrl: base64 });
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setIsPreviewOpen(true);
  };

  const handleImgRemove = () => {
    setImgFileList([]);
    form.setFieldsValue({ productImgUrl: '' });
  };

  const handlePdfChange: UploadProps['onChange'] = ({ fileList }) => setPdfFileList(fileList);

  const handlePdfRemove = () => setPdfFileList([]);

  // TODO: AI가 문서를 요약하는 동안 로딩 상태 표시!
  const handleAiSummarize = async () => {
    if (pdfFileList.length === 0 || !pdfFileList[0].originFileObj) {
      messageApi.warning('PDF 파일을 먼저 업로드해주세요.');
      return;
    }

    setAiLoading(true);
    try {
      const file = pdfFileList[0].originFileObj as File;
      const res = await aiAPI.summarizeNewProduct({ file });

      if (res.success) {
        form.setFieldsValue({ details: res.data.summary });
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (e: any) {
      console.error('AI 문서 요약 실패:', e);
      messageApi.error(e.response?.data?.message || 'AI 문서 요약 중 오류가 발생했습니다.');
      form.setFieldsValue({ details: '' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: ProductCreateRequest) => {
    try {
      const payload = {
        productName: values.productName,
        productCode: values.insuranceCode,
        mainCategory: values.mainCategory,
        subCategory: values.subCategory,
        manufacturer: values.manufacturer,
        unit: values.unit,
        unitPrice: values.unitPrice,
        details: values.details || '',
        productImgUrl: values.productImgUrl || '',
        stock: values.stockQty,
      };
      const res = await productAPI.createProduct(payload);

      if (res.success) {
        const id = res.data.productId;
        navigate(`/hq/products/${id}`);
      }
    } catch (e: any) {
      console.error('제품 등록 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 등록 중 오류가 발생했습니다.');
    }
  };

  const handleFormValuesChange = () => setIsEdited(true);

  // BUG: 뒤로가기 씹히는 문제
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEdited) e.preventDefault();
    };

    const handlePopState = () => {
      if (isEdited) {
        window.history.pushState(null, '', window.location.href);

        modal.confirm({
          title: '페이지를 나가시겠습니까?',
          content: '작성 중인 내용이 사라집니다.',
          okText: '나가기',
          cancelText: '취소',
          onOk: () => {
            setIsEdited(false);
            navigate('/hq/products');
          },
          onCancel: () => {},
          centered: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEdited, modal, navigate]);

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        제품 등록
      </Typography.Title>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Form
          form={form}
          name="product-register"
          layout="vertical"
          onValuesChange={handleFormValuesChange}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex wrap justify="space-between" gap={36}>
            <Flex vertical flex={1} justify="center" align="center">
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={imgFileList}
                beforeUpload={() => false}
                onChange={handleImgChange}
                onPreview={handlePreview}
                onRemove={handleImgRemove}
                maxCount={1}
              >
                {imgFileList.length >= 1 ? null : '이미지 업로드'}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{ display: 'none' }}
                  preview={{
                    visible: isPreviewOpen,
                    onVisibleChange: (visible) => setIsPreviewOpen(visible),
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

          <Flex wrap justify="space-between" gap={36}>
            <Flex vertical flex={1}>
              <Form.Item
                name="mainCategory"
                label="대분류"
                rules={[{ required: true, message: '대분류를 입력하세요.' }]}
              >
                <Select options={[...MAIN_CATEGORY_OPTIONS]} placeholder="선택" />
              </Form.Item>
              <Form.Item
                name="subCategory"
                label="소분류"
                rules={[{ required: true, message: '소분류를 입력하세요.' }]}
              >
                <Select
                  options={
                    watchedMainCategory
                      ? getProductSubCategoryOptions(watchedMainCategory as MainCategory)
                      : []
                  }
                  placeholder="선택"
                  disabled={!watchedMainCategory}
                />
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
                <InputNumber
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'}
                  parser={(value) => value?.replace(/[원,]/g, '') as unknown as number}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="stock"
                label="재고"
                rules={[{ required: true, message: '재고를 입력하세요.' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
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
                fileList={pdfFileList}
                beforeUpload={() => false}
                onChange={handlePdfChange}
                onRemove={handlePdfRemove}
                maxCount={1}
              >
                {pdfFileList.length >= 1 ? null : <Button icon={<UploadOutlined />}>업로드</Button>}
              </Upload>
              <Tooltip title={pdfFileList.length === 0 ? 'PDF 파일을 업로드하세요.' : ''}>
                <Button
                  type="primary"
                  disabled={pdfFileList.length === 0}
                  onClick={handleAiSummarize}
                  loading={aiLoading}
                >
                  AI 요약
                </Button>
              </Tooltip>
            </Space>
          </Flex>

          <Form.Item name="details" style={{ marginTop: '16px' }}>
            <Input.TextArea rows={8} />
          </Form.Item>

          <Flex justify="center">
            <Button type="primary" htmlType="submit">
              등록
            </Button>
          </Flex>
        </Form>
      </Card>
    </>
  );
}
