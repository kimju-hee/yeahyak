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
  Tooltip,
  Typography,
  type DescriptionsProps,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../../../api';
import { ProductDetailSkeleton } from '../../../components/skeletons';
import { useAuthStore } from '../../../stores/authStore';
import { useOrderCartStore } from '../../../stores/orderCartStore';
import { USER_ROLE, type OrderCartItem, type Product, type User } from '../../../types';
import { getProductImgSrc, PLACEHOLDER } from '../../../utils';

export default function ProductDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user) as User;
  const addItem = useOrderCartStore((state) => state.addItem);
  const basePath = user.role === USER_ROLE.BRANCH ? '/branch' : '/hq';
  const returnTo = location.state?.returnTo;

  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProduct(Number(id));

      if (res.success) {
        setProduct(res.data[0]);
      }
    } catch (e: any) {
      console.error('제품 정보 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '제품 정보 로딩 중 오류가 발생했습니다.');
      setProduct(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <ProductDetailSkeleton userRole={user.role} />;
  if (!product) return <Typography.Text>해당 제품을 찾을 수 없습니다.</Typography.Text>;

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const res = await productAPI.deleteProduct(Number(id));

        if (res.success) {
          messageApi.success('제품이 삭제되었습니다.');
          if (returnTo) {
            const params = new URLSearchParams();
            params.set('main', returnTo.main);
            params.set('sub', returnTo.sub);
            if (returnTo.page > 1) params.set('page', returnTo.page.toString());
            if (returnTo.keyword) params.set('keyword', returnTo.keyword);
            navigate(`${basePath}/products?${params.toString()}`);
          } else {
            navigate(`${basePath}/products`);
          }
        }
      } catch (e: any) {
        console.error('제품 삭제 실패:', e);
        messageApi.error(e.response?.data?.message || '제품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
    { key: 'manufacturer', label: '제조사', children: product.manufacturer },
    { key: 'productCode', label: '보험코드', children: product.productCode },
    { key: 'subCategory', label: '소분류', children: product.subCategory },
    { key: 'unit', label: '단위', children: product.unit },
    {
      key: 'unitPrice',
      label: '판매가',
      children: `${product.unitPrice.toLocaleString()}원`,
    },
  ];

  // TODO: 목록으로 돌아가기 버튼 추가
  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        제품 상세
      </Typography.Title>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Flex wrap justify="space-between" gap={36}>
          <div style={{ flex: 1 }}>
            <Image
              preview={false}
              src={getProductImgSrc(product.productImgUrl)}
              alt={product.productName || '제품 이미지'}
              style={{ objectFit: 'contain' }}
              fallback={PLACEHOLDER}
            />
          </div>

          <Flex vertical flex={1}>
            <Flex wrap justify="space-between" align="start">
              <Typography.Title level={3}>{product.productName}</Typography.Title>
              <Tag
                color={
                  product.mainCategory === '전문의약품'
                    ? 'geekblue'
                    : product.mainCategory === '일반의약품'
                      ? 'magenta'
                      : 'purple'
                }
              >
                {product.mainCategory}
              </Tag>
            </Flex>

            <Descriptions column={1} items={descriptionsItems} style={{ margin: '24px 0' }} />

            <Flex justify="flex-end">
              {user.role === USER_ROLE.ADMIN ? (
                <Space wrap>
                  <Button
                    type="primary"
                    onClick={() => navigate(`${basePath}/products/${id}/edit`)}
                  >
                    수정
                  </Button>
                  <Button type="text" danger onClick={handleDelete}>
                    삭제
                  </Button>
                </Space>
              ) : (
                <Tooltip title={`재고 수량: ${product.stock}개`}>
                  <Button
                    type="primary"
                    onClick={() => {
                      const newItem: OrderCartItem = {
                        productId: product.productId,
                        productName: product.productName,
                        manufacturer: product.manufacturer,
                        quantity: 1,
                        unitPrice: product.unitPrice,
                        subtotalPrice: product.unitPrice,
                        productImgUrl: product.productImgUrl ? product.productImgUrl : PLACEHOLDER,
                      };
                      addItem(newItem);
                      messageApi.success(`${product.productName}을(를) 장바구니에 추가했습니다.`);
                    }}
                  >
                    담기
                  </Button>
                </Tooltip>
              )}
            </Flex>
          </Flex>
        </Flex>

        <Divider />

        <Typography.Title level={4}>제품 상세 정보</Typography.Title>
        <Typography>
          <div dangerouslySetInnerHTML={{ __html: product.details ?? '' }} />
        </Typography>
      </Card>
    </>
  );
}
