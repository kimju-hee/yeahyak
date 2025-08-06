// 필요한 antd 컴포넌트 및 React 훅들을 가져옵니다.
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  InputNumber,
  Modal,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Alert,
  Pagination,
} from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';
// API 통신을 위한 axios 인스턴스를 가져옵니다.
import { instance as api } from '../../api/api';
// 전역 상태 관리를 위한 zustand 스토어를 가져옵니다。
import { useAuthStore } from '../../stores/authStore';
// 타입 정의 파일을 가져옵니다。
import type { Pharmacy } from '../../types/profile.type';

const { Text } = Typography;

// --- 타입 정의 ---
// 컴포넌트에서 사용될 데이터의 타입을 정의합니다。

// 상품 정보 타입
interface Product {
  productId: number;
  productName: string;
  productCode: string;
  manufacturer: string;
  unitPrice: number;
}

// 장바구니 아이템 타입
interface CartItem {
  key: React.Key;
  productId: number;
  image: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// 주문 아이템 타입
interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

// 주문 내역 타입
interface OrderHistory {
  orderId: number;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELED';
}

// --- 헬퍼 함수 ---

// 주문 상태에 따라 적절한 UI(Tag)를 반환하는 함수입니다。
const getStatusTag = (status: OrderHistory['status']) => {
  const statusMap = {
    REQUESTED: { color: 'blue', text: '승인 대기' },
    APPROVED: { color: 'green', text: '승인 완료' },
    PROCESSING: { color: 'purple', text: '처리 중' },
    SHIPPING: { color: 'orange', text: '배송 중' },
    COMPLETED: { color: 'gold', text: '완료' },
    CANCELED: { color: 'red', text: '취소' },
  };
  const { color, text } = statusMap[status] || { color: 'default', text: status };
  return <Tag color={color}>{text.toUpperCase()}</Tag>;
};

// --- 컴포넌트 ---

export default function OrderRequestPage() {
  // zustand 스토어의 _hasHydrated 상태를 가져와 스토어의 데이터 로딩 완료 여부를 확인합니다。
  const hasHydrated = useAuthStore.persist.hasHydrated(); // [수정] _hasHydrated 접근 방식 변경

  // --- 상태 및 스토어 ---
  // useAuthStore에서 사용자 정보와 프로필 정보를 가져옵니다。
  const { user, profile } = useAuthStore(); // [수정] useAuth를 useAuthStore로 변경
  // profile 타입을 Pharmacy로 단언하여 pharmacyId에 안전하게 접근합니다。
  const pharmacyProfile = profile as Pharmacy; // [수정] profile 타입을 Pharmacy로 단언
  // 모달 표시 여부를 관리하는 상태입니다.
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  // 장바구니 데이터를 관리하는 상태입니다.
  const [cart, setCart] = useState<CartItem[]>([]);
  // 주문 내역 데이터를 관리하는 상태입니다.
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  // 상품 목록 데이터를 관리하는 상태입니다.
  const [products, setProducts] = useState<Product[]>([]);

  // 사용자가 선택한 주문 내역을 관리하는 상태입니다.
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  // 주문 상세 정보 모달 표시 여부를 관리하는 상태입니다.
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 현재 보유 포인트를 관리하는 상태입니다.
  const [currentBalance, setCurrentBalance] = useState(0);
  // 상품 검색어를 관리하는 상태입니다.
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // 데이터 로딩 및 에러 상태를 관리합니다.
  const [loading, setLoading] = useState({
    orders: false,
    products: false,
    orderAction: false,
  });
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 관련 상태입니다.
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);

  // --- 데이터 계산 ---
  // 장바구니의 총 주문 금액을 계산합니다.
  const totalOrderAmount = cart.reduce((sum, row) => sum + row.total, 0);
  // 주문 후 예상 잔액을 계산합니다.
  const afterOrderBalance = currentBalance - totalOrderAmount;

  // --- 데이터 Fetching ---

  // 서버로부터 주문 내역을 가져오는 함수입니다.
  const fetchOrderHistory = useCallback(async (page = 1) => {
    if (!pharmacyProfile?.pharmacyId) return; // [수정] 타입 단언된 pharmacyProfile 사용
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
      const response = await api.get('/orders/branch/orders', {
        params: {
          pharmacyId: pharmacyProfile.pharmacyId, // [수정] 타입 단언된 pharmacyProfile 사용
          page: page - 1,
          size: 5,
          status: 'REQUESTED', // 예시: 요청 상태만 가져오기 (필요에 따라 변경)
        },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        setOrderTotal(response.data.totalElements);
        setOrderPage(response.data.currentPage + 1);
      } else {
        throw new Error(response.data.message || '주문 내역을 불러오는데 실패했습니다.');
      }
    } catch (e: any) {
      setError(e.message || '서버 오류');
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  }, [pharmacyProfile]); // [수정] 의존성 배열에 pharmacyProfile 사용

  // 서버로부터 상품 목록을 가져오는 함수입니다.
  const fetchProducts = useCallback(async (page = 1, keyword = '') => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const response = await api.get('/products/filter', {
        params: { page: page - 1, size: 5, keyword },
      });
      if (response.data.success) {
        const { content, totalElements, number } = response.data.data.body; // [수정] 응답 데이터 구조 변경에 따라 body 객체 추가
        setProducts(content);
        setProductTotal(totalElements);
        setProductPage(number + 1);
      } else {
        throw new Error(response.data.message || '상품 목록을 불러오는데 실패했습니다.');
      }
    } catch (e: any) {
      setError(e.message || '서버 오류');
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, []);

  // --- useEffect 훅 ---

  // 컴포넌트가 마운트되거나 사용자가 변경될 때, 포인트와 주문 내역을 가져옵니다.
  useEffect(() => {
    if (user) {
      setCurrentBalance(user.point || 0);
    }
    fetchOrderHistory();
  }, [user, fetchOrderHistory]);

  // 상품 검색 모달이 열릴 때마다 상품 목록을 가져옵니다.
  useEffect(() => {
    if (isProductModalOpen) {
      fetchProducts(1, productSearchTerm);
    }
  }, [isProductModalOpen, productSearchTerm, fetchProducts]);

  // --- 핸들러 함수 ---

  // 상품 검색 모달을 여는 함수입니다.
  const showProductModal = () => {
    setProductSearchTerm('');
    setIsProductModalOpen(true);
  };

  // 장바구니의 상품 수량을 변경하는 함수입니다.
  const handleCartChange = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const existingItemIndex = newCart.findIndex((item) => item.productId === product.productId);

      if (quantity <= 0) {
        // 수량이 0 이하이면 장바구니에서 해당 상품을 제거합니다.
        if (existingItemIndex > -1) newCart.splice(existingItemIndex, 1);
      } else {
        // 수량이 0보다 크면, 상품을 추가하거나 기존 상품의 수량을 업데이트합니다.
        const newItem: CartItem = {
          key: product.productId,
          productId: product.productId,
          image: `/images/Taron.jpg`, // 임시 이미지
          code: product.productCode,
          name: product.productName,
          price: product.unitPrice,
          quantity: quantity,
          total: product.unitPrice * quantity,
        };
        if (existingItemIndex > -1) {
          newCart[existingItemIndex] = newItem;
        } else {
          newCart.push(newItem);
        }
      }
      return newCart;
    });
  };

  // 장바구니에 담긴 상품들을 주문하는 함수입니다.
  const handleOrder = async () => {
    if (cart.length === 0) {
      Modal.warning({ title: '주문할 항목이 없습니다.' });
      return;
    }
    if (!pharmacyProfile?.pharmacyId) { // [수정] 타입 단언된 pharmacyProfile 사용
      Modal.error({ title: '오류', content: '약국 정보를 찾을 수 없습니다.' });
      return;
    }

    setLoading((prev) => ({ ...prev, orderAction: true }));

    const orderData = {
      pharmacyId: pharmacyProfile.pharmacyId, // [수정] 타입 단언된 pharmacyProfile 사용
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    try {
      const response = await api.post('/orders', orderData);
      if (response.data.success) {
        Modal.success({ title: '발주 요청이 완료되었습니다.' });
        setCart([]);
        fetchOrderHistory(); // 주문 완료 후 주문 내역을 다시 불러옵니다.
        // TODO: 포인트 갱신 로직 추가 필요 (예: fetchUser())
      } else {
        throw new Error(response.data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (e: any) {
      Modal.error({ title: '발주 요청 중 오류 발생', content: e.message });
    } finally {
      setLoading((prev) => ({ ...prev, orderAction: false }));
    }
  };

  // 상품 검색을 처리하는 함수입니다.
  const handleProductSearch = (value: string) => {
    setProductSearchTerm(value);
    fetchProducts(1, value);
  };

  // --- 테이블 컬럼 정의 ---

  // 장바구니 테이블의 컬럼을 정의합니다.
  const cartColumns: ColumnsType<CartItem> = [
    {
      title: '이미지',
      dataIndex: 'image',
      render: (src: string) => <img src={src} alt="제품" width={50} />,
    },
    { title: '품목코드', dataIndex: 'code' },
    { title: '품명', dataIndex: 'name', ellipsis: true },
    { title: '단가', dataIndex: 'price', render: (v) => `${v.toLocaleString()}원` },
    {
      title: '수량',
      dataIndex: 'quantity',
      width: 120,
      render: (qty: number, record: CartItem) => (
        <InputNumber
          min={0}
          value={qty}
          onChange={(value) => {
            const product = products.find((p) => p.productId === record.productId);
            if (product && value !== null) handleCartChange(product, value);
          }}
          style={{ width: 70 }}
        />
      ),
    },
    { title: '합계', dataIndex: 'total', render: (v) => `${v.toLocaleString()}원` },
    {
      title: '삭제',
      render: (_, record: CartItem) => (
        <Button
          type="link"
          danger
          onClick={() => {
            const product = products.find((p) => p.productId === record.productId);
            if (product) handleCartChange(product, 0);
          }}
        >
          삭제
        </Button>
      ),
    },
  ];

  // 주문 내역 테이블의 컬럼을 정의합니다.
  const orderHistoryColumns: ColumnsType<OrderHistory> = [
    { title: '주문번호', dataIndex: 'orderId' },
    { title: '주문일자', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString() },
    { title: '품목 수', dataIndex: 'items', render: (items: OrderItem[]) => `${items.length}건` },
    { title: '결제 금액', dataIndex: 'totalPrice', render: (v) => `${v.toLocaleString()}원` },
    { title: '상태', dataIndex: 'status', render: getStatusTag },
  ];

  // --- 렌더링 ---

  // 에러가 발생한 경우 에러 메시지를 표시합니다.
  // 스토어의 상태가 아직 로드되지 않았다면 로딩 스피너를 표시합니다.
  if (!hasHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="데이터 로딩 중..." />
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지를 표시합니다。
  // 스토어의 상태가 아직 로드되지 않았다면 로딩 스피너를 표시합니다。
  if (!hasHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="데이터 로딩 중..." />
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지를 표시합니다。
  if (error) {
    return <Alert message="오류" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* 페이지 제목 */}
      <Row style={{ marginBottom: 32 }}>
        <Col>
          <Text strong style={{ fontSize: 30 }}>
            발주 요청
          </Text>
        </Col>
      </Row>
      <Row justify="center">
        <Col span={22}>
          <Row gutter={[0, 32]}>
            {/* 주문 정보 섹션 */}
            <Col span={24}>
              <Row>
                <Text strong style={{ fontSize: 20, marginBottom: '20px' }}>
                  주문 정보
                </Text>
              </Row>
              <Row gutter={20} align="middle">
                <Col span={5}>
                  <Card variant="borderless">
                    <Statistic title="현재 포인트 잔액" value={currentBalance} suffix="원" />
                  </Card>
                </Col>
                <Col>
                  <Text style={{ fontSize: 40 }}>-</Text>
                </Col>
                <Col span={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="품목 수 / 결제 금액"
                      value={`${cart.length}건 / ${totalOrderAmount.toLocaleString()}원`}
                    />
                  </Card>
                </Col>
                <Col>
                  <Text style={{ fontSize: 40 }}>=</Text>
                </Col>
                <Col span={5}>
                  <Card variant="borderless">
                    <Statistic
                      title="주문 후 잔액"
                      value={afterOrderBalance}
                      suffix="원"
                      valueStyle={{ color: afterOrderBalance < 0 ? '#da4040ff' : '#3f8600' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* 장바구니 섹션 */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Text strong style={{ fontSize: 20 }}>
                    장바구니
                  </Text>
                </Col>
                <Col style={{ display: 'flex', gap: 8 }}>
                  <Button type="primary" onClick={showProductModal} size="large">
                    품목 검색
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    danger
                    onClick={handleOrder}
                    disabled={cart.length === 0 || loading.orderAction}
                    loading={loading.orderAction}
                  >
                    선택 항목 발주
                  </Button>
                </Col>
              </Row>
              <Table<CartItem>
                columns={cartColumns}
                dataSource={cart}
                pagination={{ pageSize: 5, position: ['bottomCenter'] }}
                rowKey="key"
              />
            </Col>
          </Row>

          {/* 주문 내역 섹션 */}
          <Row style={{ marginTop: 40, marginBottom: 100 }}>
            <Col span={24}>
              <Text strong style={{ fontSize: 20, marginBottom: 12, display: 'block' }}>
                주문 내역
              </Text>
              <Spin spinning={loading.orders}>
                <Table<OrderHistory>
                  columns={orderHistoryColumns}
                  dataSource={orders}
                  rowKey="orderId"
                  pagination={false}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedOrder(record);
                      setIsDetailModalOpen(true);
                    },
                  })}
                />
                <Pagination
                  current={orderPage}
                  total={orderTotal}
                  pageSize={5}
                  onChange={(page) => fetchOrderHistory(page)}
                  style={{ textAlign: 'center', marginTop: 16 }}
                />
              </Spin>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 품목 검색 모달 */}
      <Modal
        title="품목 검색"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={800}
      >
        <Input.Search
          placeholder="제품명으로 검색"
          allowClear
          enterButton
          onSearch={handleProductSearch}
          style={{ marginBottom: 16 }}
        />
        <Spin spinning={loading.products}>
          <Table<Product>
            columns={[
              { title: '품명', dataIndex: 'productName' },
              { title: '제조사', dataIndex: 'manufacturer' },
              { title: '단가', dataIndex: 'unitPrice', render: (v) => `${v.toLocaleString()}원` },
              {
                title: '수량',
                width: 120,
                render: (_, record) => (
                  <InputNumber
                    min={0}
                    value={cart.find((item) => item.productId === record.productId)?.quantity || 0}
                    onChange={(value) => handleCartChange(record, value!)}
                    style={{ width: 70 }}
                  />
                ),
              },
            ]}
            dataSource={products}
            rowKey="productId"
            pagination={false}
          />
          <Pagination
            current={productPage}
            total={productTotal}
            pageSize={5}
            onChange={(page) => fetchProducts(page, productSearchTerm)}
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </Spin>
      </Modal>

      {/* 주문 상세 모달 */}
      <Modal
        open={isDetailModalOpen}
        title="주문 상세 내역"
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="주문번호">{selectedOrder.orderId}</Descriptions.Item>
            <Descriptions.Item label="주문일자">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="총 금액">
              {selectedOrder.totalPrice.toLocaleString()}원
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              {getStatusTag(selectedOrder.status)}
            </Descriptions.Item>
            <Descriptions.Item label="품목 목록">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {selectedOrder.items.map((item) => (
                  <li key={item.productId}>
                    {item.productName} - {item.quantity}개 ({item.subtotalPrice.toLocaleString()}
                    원)
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
