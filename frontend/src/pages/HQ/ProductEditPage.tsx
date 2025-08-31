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
  Select,
  Space,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductEditSkeleton } from '../../components';
import { DATE_FORMAT, getProductSubCategoryOptions, MAIN_CATEGORY_OPTIONS } from '../../constants';
import { useAiProductSummarize, useProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { MainCategory, ProductUpdateRequest } from '../../types';

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function ProductEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const noticeId = useMemo(() => Number(id), [id]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [imgFileList, setImgFileList] = useState<UploadFile[]>([]);
  const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);

  const watchedMainCategory = Form.useWatch('mainCategory', form);

  const { data: product, isLoading: loading, error } = useProduct(noticeId);

  const updateProductMutation = useUpdateProduct(noticeId);
  const aiSummarizeMutation = useAiProductSummarize();

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        details: product.details || '',
        productImgUrl: product.productImgUrl || '',
      });

      if (product.productImgUrl) {
        const isBase64 = product.productImgUrl.startsWith('data:image/');
        setImgFileList([
          {
            uid: '-1',
            name: isBase64
              ? '제품 이미지'
              : product.productImgUrl.split('/').pop() || '제품 이미지',
            status: 'done',
            url: product.productImgUrl,
            ...(isBase64 && { thumbUrl: product.productImgUrl }),
          } as UploadFile,
        ]);
      } else {
        setImgFileList([]);
      }
    }
  }, [product, form]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error('제품 정보 로딩 실패:', error);
      messageApi.error('제품 정보 로딩 중 오류가 발생했습니다.');
    }
  }, [error, messageApi]);

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

  const handleAiSummarize = async () => {
    if (pdfFileList.length === 0 || !pdfFileList[0].originFileObj) {
      messageApi.warning('PDF 파일을 먼저 업로드해주세요');
      return;
    }

    try {
      const file = pdfFileList[0].originFileObj as File;
      const res = await aiSummarizeMutation.mutateAsync({ file });

      if (res.success) {
        form.setFieldsValue({ details: res.data.summary });
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'AI 문서 요약 중 오류가 발생했습니다.');
      form.setFieldsValue({ details: '' });
    }
  };

  const handleSubmit = async (values: ProductUpdateRequest) => {
    try {
      const payload: ProductUpdateRequest = {
        productName: values.productName,
        insuranceCode: values.insuranceCode,
        mainCategory: values.mainCategory,
        subCategory: values.subCategory,
        manufacturer: values.manufacturer,
        unit: values.unit,
        unitPrice: values.unitPrice,
        details: values.details ? DOMPurify.sanitize(values.details) : '',
        productImgUrl: values.productImgUrl || '',
      };
      await updateProductMutation.mutateAsync(payload);

      messageApi.success('수정이 완료되었습니다.');
      navigate(`/hq/products/${id}`);
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || '제품 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24, textAlign: 'center', width: '100%' }}>
        제품 정보 수정
      </Typography.Title>

      {loading ? (
        <ProductEditSkeleton />
      ) : (
        <Card style={{ width: '80%', padding: 16, margin: '0 auto', borderRadius: 24 }}>
          <Form
            form={form}
            name="product-edit"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            validateMessages={{ required: '${label}을(를) 입력해주세요' }}
          >
            <Flex wrap justify="space-between" gap={36}>
              <Typography.Text type="secondary">
                ID: {form.getFieldValue('productId')}
              </Typography.Text>
              <Typography.Text type="secondary">
                등록일: {dayjs(form.getFieldValue('createdAt')).format(DATE_FORMAT.DATE)}
              </Typography.Text>
            </Flex>

            <Divider />

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
                  style={{ padding: 16 }}
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
                <Form.Item name="productName" label="제품명" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="manufacturer" label="제조사" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Flex>

              <Flex vertical flex={1}>
                <Form.Item name="insuranceCode" label="보험코드" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="unitPrice"
                  label="판매가"
                  rules={[
                    { required: true },
                    { type: 'number', min: 1, message: '판매가는 1 이상이어야 합니다' },
                  ]}
                >
                  <InputNumber
                    min={1}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'}
                    parser={(value) => Number(value?.replace(/[원,]/g, '') || 0) as any}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Flex>
            </Flex>

            <Divider />

            <Flex wrap justify="space-between" gap={36}>
              <Flex vertical flex={1}>
                <Form.Item name="mainCategory" label="대분류" rules={[{ required: true }]}>
                  <Select options={[...MAIN_CATEGORY_OPTIONS]} placeholder="선택" />
                </Form.Item>
                <Form.Item name="subCategory" label="소분류" rules={[{ required: true }]}>
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
                <Form.Item name="unit" label="단위" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="inventoryQty" label="재고">
                  <InputNumber
                    disabled
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                  />
                </Form.Item>
              </Flex>
            </Flex>

            <Divider />

            <Flex wrap justify="space-between" gap={36}>
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
                  {pdfFileList.length >= 1 ? null : (
                    <Button icon={<UploadOutlined />}>업로드</Button>
                  )}
                </Upload>
                <Tooltip title={pdfFileList.length === 0 ? 'PDF 파일을 업로드해주세요' : ''}>
                  <Button
                    type="primary"
                    disabled={pdfFileList.length === 0}
                    onClick={handleAiSummarize}
                    loading={aiSummarizeMutation.isPending}
                  >
                    AI 요약
                  </Button>
                </Tooltip>
              </Space>
            </Flex>

            <Form.Item name="details" style={{ marginTop: 16 }}>
              <Input.TextArea rows={16} />
            </Form.Item>

            <Flex justify="center">
              <Button type="primary" htmlType="submit">
                저장
              </Button>
            </Flex>
          </Form>
        </Card>
      )}
    </>
  );
}
