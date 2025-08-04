import { Card, Col, Image, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product';

interface ProductCardGridProps {
  products: Product[];
}

export default function ProductCardGrid({ products }: ProductCardGridProps) {
  const navigate = useNavigate();

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col key={product.id} span={6}>
          <Card
            hoverable
            onClick={() => navigate(`/hq/products/${product.id}`)}
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
