import { Card, Col, Image, Row } from 'antd';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLE, type ProductList, type User } from '../types';
import { getProductImgSrc, PLACEHOLDER } from '../utils';

interface ProductCardGridProps {
  products: ProductList[];
}

const ProductCard = memo(function ProductCard({
  product,
  onNavigate,
}: {
  product: ProductList;
  onNavigate: (productId: number) => void;
}) {
  const imageSrc = getProductImgSrc(product.productImgUrl);

  return (
    <Col span={6}>
      <Card
        hoverable
        onClick={() => onNavigate(product.productId)}
        cover={
          <Image
            preview={false}
            src={imageSrc}
            alt={product.productName || '제품 이미지'}
            style={{ height: '160px', objectFit: 'contain' }}
            fallback={PLACEHOLDER}
          />
        }
      >
        <Card.Meta
          title={product.productName}
          description={
            <>
              <div>{product.manufacturer}</div>
              <div>{`${product.unitPrice.toLocaleString()}원`}</div>
            </>
          }
        />
      </Card>
    </Col>
  );
});

export default function ProductCardGrid({ products }: ProductCardGridProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.PHARMACY ? '/branch' : '/hq';
  const handleNavigate = useCallback(
    (productId: number) => navigate(`${basePath}/products/${productId}`),
    [navigate, basePath],
  );

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} onNavigate={handleNavigate} />
      ))}
    </Row>
  );
}
