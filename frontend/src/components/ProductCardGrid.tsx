import { Card, Col, Image, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types/product.type';
import { USER_ROLE } from '../types/profile.type';

interface ProductCardGridProps {
  products: Product[];
}

export default function ProductCardGrid({ products }: ProductCardGridProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col key={product.productId} span={6}>
          <Card
            hoverable
            onClick={() => {
              const pathPrefix = user?.role === USER_ROLE.BRANCH ? '/hq' : '/branch';
              navigate(`${pathPrefix}/products/${product.productId}`);
            }}
            cover={
              <Image
                preview={false}
                src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                alt="제품명"
                style={{ height: '150px', objectFit: 'contain' }}
              />
            }
          >
            <Card.Meta
              title={product.productName}
              description={
                <>
                  <div>{product.manufacturer}</div>
                  <div>{product.unitPrice.toLocaleString()}원</div>
                </>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
