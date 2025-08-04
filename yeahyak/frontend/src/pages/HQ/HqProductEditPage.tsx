import { LeftOutlined } from '@ant-design/icons';
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
  type UploadFile,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUB_CATEGORY_MAP, TYPES, type Type } from '../../types/product';
import { mockProducts } from '../../types/product.mock';

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function HqProductEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);

  const typeOptions = TYPES.map((type) => ({ value: type, label: type }));
  const watchedType = Form.useWatch('type', form);
  const subCategoryOptions =
    watchedType && SUB_CATEGORY_MAP[watchedType as Type]
      ? SUB_CATEGORY_MAP[watchedType as Type].map((label) => ({ value: label, label }))
      : [];

  // NOTE: 제품 정보 섹션을 쪼개기로 정하면 사용
  // const watchedType = Form.useWatch('type', form);

  // TODO: 제품 정보 로드 API 호출 로직 추가 + mockProducts 제거
  // const fetchProduct = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await instance.get(`/products/${id}`);
  //     const product = res.data as Product;
  //     form.setFieldsValue(product);
  //   } catch (e: any) {
  //     console.error('제품 정보 로딩 실패:', e);
  //     messageApi.error(e.message || '제품 정보 로딩 중 오류가 발생했습니다.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchProduct();
  // }, []);

  const product = mockProducts.find((p) => p.id === Number(id));

  useEffect(() => {
    if (!product) return;

    form.setFieldsValue(product);

    if (product.productImgUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: product.productImgUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [product]);

  if (!product) {
    return <Typography.Text>해당 제품을 찾을 수 없습니다.</Typography.Text>;
  }

  const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
    setFileList(fileList);
    const file = fileList[0];

    if (!file) {
      form.setFieldsValue({ productImgUrl: '' });
      return;
    }

    if (file.originFileObj) {
      const base64 = await getBase64(file.originFileObj as File);
      form.setFieldsValue({ productImgUrl: base64 });
    } else if (file.url) {
      form.setFieldsValue({ productImgUrl: file.url });
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // TODO: 제품 정보 수정 API 호출 로직 추가
      navigate(`/hq/products/${id}`);
    } catch (e: any) {
      console.error('제품 정보 수정 실패:', e);
      messageApi.error(e.message || '제품 정보 수정 중 오류가 발생했습니다.');
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
          제품 정보 수정
        </Typography.Title>
      </Space>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Flex wrap justify="space-between" gap={24}>
          <Typography.Text type="secondary">ID: {product.id}</Typography.Text>
          <Typography.Text type="secondary">
            등록일: {dayjs(product.createdAt).format('YYYY-MM-DD')}
          </Typography.Text>
        </Flex>

        <Divider />

        <Form
          form={form}
          name="product-edit"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex wrap justify="space-between" gap={36}>
            <Flex vertical flex={1} justify="center" align="center">
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={() => false}
                onChange={handleChange}
                onPreview={handlePreview}
                maxCount={1}
              >
                {fileList.length >= 1 ? null : '이미지 업로드'}
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

          <Flex wrap justify="space-between" gap={36}>
            <Flex vertical flex={1}>
              <Form.Item
                name="type"
                label="유형"
                rules={[{ required: true, message: '유형을 입력하세요.' }]}
              >
                <Select options={typeOptions} />
              </Form.Item>
              <Form.Item
                name="subCategory"
                label="구분"
                rules={[{ required: true, message: '구분을 입력하세요.' }]}
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

          <Typography.Title level={4}>제품 상세 정보</Typography.Title>
          <Form.Item name="details">
            <Input.TextArea rows={8} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
