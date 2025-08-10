import LeftOutlined from '@ant-design/icons/lib/icons/LeftOutlined';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Image,
  message,
  Space,
  Tag,
  Typography,
  type DescriptionsProps,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { instance } from '../../../api/api';
import { useAuthStore } from '../../../stores/authStore';
import { PRODUCT_MAIN_CATEGORY, type ProductResponse } from '../../../types/product.type';
import { USER_ROLE } from '../../../types/profile.type';

export default function ProductDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [product, setProduct] = useState<ProductResponse>();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // 🔒 중복 클릭 방지

  // 🔧 개발용: 로그인 없이 ADMIN 버튼 강제 노출
  const DEV_FORCE_ADMIN = true;
  const showAdminButtons = DEV_FORCE_ADMIN || user?.role === USER_ROLE.ADMIN;

  // TODO: API 연동 확인
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/products/${id}`);
      // LOG: 테스트용 로그
      console.log('✨ 제품 정보 로딩 응답:', res.data);

      if (res.data?.success) {
        const data = res.data.data;
        const p = Array.isArray(data) ? (data[0] as ProductResponse) : (data as ProductResponse);
        setProduct(p); // ✅ 상태 반영
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
  }, [id]); // 필요시 [id]로 바꿔도 됨

  const handleDelete = async () => {
    if (deleting) return;
    try {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;

      setDeleting(true);
      const res = await instance.delete(`/products/${id}`);
      // LOG: 테스트용 로그
      console.log('✨ 제품 삭제 응답:', res.data);

      if (res.data?.success) {
        // 명세: data: ["삭제되었습니다."]
        const msg =
          (Array.isArray(res.data.data) && res.data.data[0]) ||
          res.data.message ||
          '삭제되었습니다.';
        messageApi.success(msg);
        navigate('/hq/products'); // ✅ 목록으로 이동
      } else {
        messageApi.error(res.data?.message || '삭제에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('제품 삭제 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      // TODO: 제품 장바구니 추가 API 호출 로직 추가하기 (일단 보류)
      messageApi.success('장바구니에 추가되었습니다.');
    } catch (e: any) {
      console.error('제품 장바구니 추가 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
    { key: 'manufacturer', label: '제조사', children: product?.manufacturer },
    { key: 'productCode', label: '보험코드', children: product?.productCode },
    { key: 'subCategory', label: '구분', children: product?.subCategory },
    { key: 'unit', label: '단위', children: product?.unit },
    {
      key: 'unitPrice',
      label: '판매가',
      children: product?.unitPrice !== undefined ? `${product.unitPrice.toLocaleString()}원` : '',
    },
  ];

  return (
    <>
      {contextHolder}
      <Space size="large" align="baseline">
        <Button
          type="link"
          size="large"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={() => navigate('/hq/products')}
        />
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          제품 목록
        </Typography.Title>
      </Space>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Flex wrap justify="space-between" gap={36}>
          <div style={{ flex: 1 }}>
            {/* TODO: 제품 이미지 확인 */}
            {product?.productImgUrl && product.productImgUrl.trim() !== '' ? (
              <Image
                preview={false}
                src={product.productImgUrl} // ✅ 서버에서 온 base64 사용
                alt={product?.productName || '제품 이미지'}
                style={{ width: '100%', maxHeight: 220, objectFit: 'contain' }}
              />
            ) : (
              <Image
                preview={false}
                src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                alt="이미지 없음"
                style={{ width: '100%', maxHeight: 220, objectFit: 'contain' }}
              />
            )}
          </div>

          <Flex vertical flex={1}>
            <Flex wrap justify="space-between" align="start">
              <Typography.Title level={3}>{product?.productName}</Typography.Title>
              <Tag
                color={
                  product?.mainCategory === PRODUCT_MAIN_CATEGORY.전문의약품
                    ? 'geekblue'
                    : product?.mainCategory === PRODUCT_MAIN_CATEGORY.일반의약품
                    ? 'magenta'
                    : 'purple'
                }
              >
                {product?.mainCategory}
              </Tag>
            </Flex>

            <Descriptions column={1} items={descriptionsItems} style={{ margin: '24px 0' }} />

            {showAdminButtons ? (
              <Space wrap>
                <Button type="primary" onClick={() => navigate(`/hq/products/${id}/edit`)}>
                  수정
                </Button>
                <Button type="text" danger loading={deleting} onClick={handleDelete}>
                  삭제
                </Button>
              </Space>
            ) : (
              <Button type="primary" onClick={handleAddToCart}>
                주문
              </Button>
            )}
          </Flex>
        </Flex>

        <Divider />

        <Typography.Title level={4}>제품 상세 정보</Typography.Title>
        <Typography.Paragraph>{product?.details}</Typography.Paragraph>

        {/* NOTE: 제품 정보 섹션을 쪼개기로 정하면 사용 */}
        {/* {Object.entries(product.details ?? {}).map(([section, content]) => (
          <div key={section} style={{ marginBottom: 24 }}>
            <Title level={5}>{section}</Title>
            <Paragraph>{content}</Paragraph>
          </div>
        ))} */}
      </Card>
    </>
  );
}
