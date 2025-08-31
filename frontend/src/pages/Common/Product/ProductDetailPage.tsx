import { RightOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
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
  type BreadcrumbProps,
  type DescriptionsProps,
} from 'antd';
import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProductDetailSkeleton } from '../../../components';
import { SUB_CATEGORY_TEXT } from '../../../constants';
import { useDeleteProduct, useProduct } from '../../../hooks/useProducts';
import { useAuthStore } from '../../../stores/authStore';
import { useOrderCartStore } from '../../../stores/orderCartStore';
import { USER_ROLE, type OrderCartItem, type User } from '../../../types';
import { getProductImgSrc, PLACEHOLDER } from '../../../utils';

export default function ProductDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user) as User;
  const addItem = useOrderCartStore((state) => state.addItem);
  const basePath = user.role === USER_ROLE.ADMIN ? '/hq' : '/branch';
  const returnTo = location.state?.returnTo;

  const noticeId = useMemo(() => Number(id), [id]);

  const { data: product, isLoading: loading, error } = useProduct(noticeId);

  const deleteProductMutation = useDeleteProduct();

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error('제품 정보 로딩 실패:', error);
      messageApi.error('제품 정보 로딩 중 오류가 발생했습니다.');
    }
  }, [error, messageApi]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteProductMutation.mutateAsync(Number(id));
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
      } catch (error: any) {
        messageApi.error(error.response?.data?.message || '제품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const breadcrumbItems: BreadcrumbProps['items'] = [
    {
      title: (
        <Link to={`${basePath}/products?main=${product?.mainCategory}`}>
          {product?.mainCategory || '카테고리'}
        </Link>
      ),
    },
    {
      title: (
        <Link to={`${basePath}/products?main=${product?.mainCategory}&sub=${product?.subCategory}`}>
          {product ? SUB_CATEGORY_TEXT[product.subCategory] : '소분류'}
        </Link>
      ),
    },
    {
      title: product?.productName || '제품 상세',
    },
  ];

  const descriptionsItems: DescriptionsProps['items'] = [
    { key: 'manufacturer', label: '제조사', children: product?.manufacturer },
    { key: 'productCode', label: '보험코드', children: product?.insuranceCode },
    {
      key: 'subCategory',
      label: '소분류',
      children: product ? SUB_CATEGORY_TEXT[product.subCategory] : '',
    },
    { key: 'unit', label: '단위', children: product?.unit },
    { key: 'unitPrice', label: '판매가', children: `${product?.unitPrice.toLocaleString()}원` },
  ];

  return (
    <>
      {contextHolder}
      {loading ? (
        <ProductDetailSkeleton userRole={user.role} />
      ) : !product ? (
        <Typography.Text>해당 제품을 찾을 수 없습니다.</Typography.Text>
      ) : (
        <>
          <Breadcrumb
            separator={<RightOutlined style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14 }} />}
            items={breadcrumbItems}
            style={{ width: '80%', margin: '0 auto 16px auto' }}
          />
          <Card style={{ width: '80%', padding: 16, margin: '0 auto', borderRadius: 24 }}>
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
                <Flex wrap justify="space-between" align="start" style={{ marginTop: 8 }}>
                  <Typography.Title level={2}>{product.productName}</Typography.Title>
                  <Tag
                    color={
                      product.mainCategory === '전문의약품'
                        ? 'geekblue'
                        : product.mainCategory === '일반의약품'
                          ? 'magenta'
                          : 'purple'
                    }
                    style={{ height: 28, fontSize: 14, padding: '2px 8px' }}
                  >
                    {product.mainCategory}
                  </Tag>
                </Flex>
                <Descriptions
                  column={1}
                  items={descriptionsItems}
                  style={{ margin: '8px 0' }}
                  styles={{
                    label: { width: 80 },
                    content: { textAlign: 'left' },
                  }}
                />
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
                    <Tooltip title={`재고 수량: ${product.inventoryQty}개`}>
                      <Button
                        type="primary"
                        onClick={() => {
                          const newItem: OrderCartItem = {
                            productId: product.productId,
                            productName: product.productName,
                            manufacturer: product.manufacturer,
                            productImgUrl: product.productImgUrl || PLACEHOLDER,
                            quantity: 1,
                            unitPrice: product.unitPrice,
                            subtotalPrice: product.unitPrice,
                          };
                          addItem(newItem);
                          messageApi.success(
                            `${product.productName}을(를) 장바구니에 추가했습니다!`,
                          );
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
      )}
    </>
  );
}
