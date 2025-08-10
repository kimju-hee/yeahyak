import { Card, Col, Image, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types/product.type';
import { USER_ROLE } from '../types/profile.type';

interface ProductCardGridProps {
  products: Product[];
}

const PLACEHOLDER =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

// 빈 문자열/순수 base64/일반 URL 모두 안전하게 처리
function getSafeImgSrc(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  const src = raw.trim();
  if (src === '') return PLACEHOLDER;
  if (src.startsWith('data:')) return src; // 이미 data:면 그대로
  // 순수 base64 본문만 내려오는 경우를 대비
  if (/^[A-Za-z0-9+/=]+$/.test(src)) return `data:image/*;base64,${src}`;
  return src; // 일반 URL
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
                src={getSafeImgSrc(product.productImgUrl)}
                alt={product.productName || '제품 이미지'}
                style={{ height: '150px', objectFit: 'contain' }}
                onError={(e) => {
                  // 이미지 로딩 실패 시 placeholder로 교체
                  (e.target as HTMLImageElement).setAttribute('src', PLACEHOLDER);
                }}
              />
            }
          >
            <Card.Meta
              title={product.productName}
              description={
                <>
                  <div>{product.manufacturer}</div>
                  <div>
                    {product.unitPrice != null ? `${product.unitPrice.toLocaleString()}원` : ''}
                  </div>
                </>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
