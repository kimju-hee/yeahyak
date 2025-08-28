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
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aiAPI, productAPI } from '../../api';
import { ProductEditSkeleton } from '../../components/skeletons';
import { DATE_FORMAT, getProductSubCategoryOptions, MAIN_CATEGORY_OPTIONS } from '../../constants';
import type { MainCategory, ProductCreateRequest, ProductUpdateRequest } from '../../types';

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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [imgFileList, setImgFileList] = useState<UploadFile[]>([]);
  const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const watchedMainCategory = Form.useWatch('mainCategory', form);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProduct(Number(id));

      if (res.success) {
        const product = res.data;
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
    } catch (e: any) {
      console.error('제품 정보 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 정보 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
      const payload: ProductUpdateRequest = {
        productName: values.productName,
        insuranceCode: values.insuranceCode,
        mainCategory: values.mainCategory,
        subCategory: values.subCategory,
        manufacturer: values.manufacturer,
        unit: values.unit,
        unitPrice: values.unitPrice,
        details: values.details || '',
        productImgUrl: values.productImgUrl || '',
      };
      await productAPI.updateProduct(Number(id), payload);
      messageApi.success('수정이 완료되었습니다.');
      navigate(`/hq/products/${id}`);
    } catch (e: any) {
      console.error('제품 정보 수정 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        제품 정보 수정
      </Typography.Title>

      {loading ? (
        <ProductEditSkeleton />
      ) : (
        <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
          <Form
            form={form}
            name="product-edit"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Flex wrap justify="space-between" gap={24}>
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
              </Flex>

              <Flex vertical flex={1}>
                <Form.Item
                  name="insuranceCode"
                  label="보험코드"
                  rules={[{ required: true, message: '보험코드를 입력하세요.' }]}
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
                  <Select options={[...MAIN_CATEGORY_OPTIONS]} />
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
                  name="stockQty"
                  label="재고"
                  rules={[{ required: true, message: '재고를 입력하세요.' }]}
                >
                  <InputNumber disabled style={{ width: '100%' }} />
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
                  {pdfFileList.length >= 1 ? null : (
                    <Button icon={<UploadOutlined />}>업로드</Button>
                  )}
                </Upload>
                <Tooltip title={pdfFileList.length === 0 ? 'PDF 파일을 업로드 해주세요' : ''}>
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
                저장
              </Button>
            </Flex>
          </Form>
        </Card>
      )}
    </>
  );
}
