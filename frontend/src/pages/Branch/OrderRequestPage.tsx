import {
  Row,
  Col,
  Layout,
  Typography,
  Table,
  Button,
  Modal,
  Statistic,
  Card,
  Descriptions,
  Tag,
  InputNumber,
  Input,
} from 'antd';
import React, { useState } from 'react';

import type { ColumnsType } from 'antd/es/table';

// 목 데이터 및 타입 임포트
import { mockProducts } from '../../mocks/product.mock';
import { mockOrders, mockOrderItems } from '../../mocks/order.mock';
import type { Product, Order, OrderItem } from '../../mocks/types';

const { Text } = Typography;

// 장바구니 아이템의 데이터 타입을 정의합니다.
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

// 주문 내역의 데이터 타입을 정의합니다.
interface OrderHistory {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  date: string;
  status: Order['status'];
}

// 주문 상태에 따라 다른 색상의 태그를 반환하는 헬퍼 함수입니다.
const getStatusTag = (status: Order['status']) => {
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

// 주문 내역 테이블의 컬럼 구성을 정의합니다.
const orderHistoryColumns: ColumnsType<OrderHistory> = [
  {
    title: '주문번호',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '주문일자',
    dataIndex: 'date',
    key: 'date',
    render: (date) => new Date(date).toLocaleDateString(),
  },
  {
    title: '품목 수',
    dataIndex: 'items',
    key: 'items',
    render: (items: OrderItem[]) => `${items.length}건`,
  },
  {
    title: '결제 금액',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (val: number) => `${val.toLocaleString()}원`,
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    render: (status: Order['status']) => getStatusTag(status), // getStatusTag 함수 사용
  },
];

// 지점의 발주 요청 페이지 컴포넌트입니다.
export default function OrderRequestPage() {
  // 현재 로그인한 약국 ID를 1로 가정합니다. (데모용)
  const MY_PHARMACY_ID = 1;

  const [isProductModalOpen, setIsProductModalOpen] = useState(false); // 품목 검색 모달 표시 상태
  const [cart, setCart] = useState<CartItem[]>([]); // 장바구니 상태
  const [orders, setOrders] = useState<Order[]>(mockOrders); // 주문 데이터 상태
  const [orderItems, setOrderItems] = useState<OrderItem[]>(mockOrderItems); // 주문 아이템 상태

  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null); // 선택된 주문 내역
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // 주문 상세 모달 표시 상태

  const [currentBalance, setCurrentBalance] = useState(2500000); // 현재 보유 포인트 (데모용)
  const [productSearchTerm, setProductSearchTerm] = useState(''); // 제품 검색어 상태

  // 장바구니의 총 주문 금액을 계산합니다.
  const totalOrderAmount = cart.reduce((sum, row) => sum + row.total, 0);
  // 주문 후 예상 잔액을 계산합니다.
  const afterOrderBalance = currentBalance - totalOrderAmount;

  // 품목 검색 모달을 여는 함수입니다.
  const showProductModal = () => {
    setProductSearchTerm(''); // 모달을 열 때 검색어 초기화
    setIsProductModalOpen(true);
  };

  // 장바구니에 품목을 추가하거나 수량을 변경하는 함수입니다.
  const handleCartChange = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const existingItemIndex = newCart.findIndex((item) => item.productId === product.id);

      if (quantity <= 0) {
        if (existingItemIndex > -1) {
          newCart.splice(existingItemIndex, 1);
        }
      } else {
        const newItem: CartItem = {
          key: product.id,
          productId: product.id,
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

  // 발주 요청을 처리하는 함수입니다.
  const handleOrder = () => {
    if (cart.length === 0) {
      Modal.warning({ title: '주문할 항목이 없습니다.' });
      return;
    }

    const newOrderId = (orders.length > 0 ? Math.max(...orders.map((o) => o.id)) : 0) + 1;
    const newOrderItems: OrderItem[] = cart.map((item, index) => ({
      id: (orderItems.length > 0 ? Math.max(...orderItems.map((oi) => oi.id)) : 0) + 1 + index,
      orderId: newOrderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotalPrice: item.total,
    }));

    const newOrder: Order = {
      id: newOrderId,
      pharmacyId: MY_PHARMACY_ID,
      createdAt: new Date().toISOString(),
      totalPrice: totalOrderAmount,
      status: 'REQUESTED',
    };

    setOrders((prev) => [...prev, newOrder]);
    setOrderItems((prev) => [...prev, ...newOrderItems]);
    setCurrentBalance((prev) => prev - totalOrderAmount);
    setCart([]);

    Modal.success({ title: '발주 요청이 완료되었습니다.' });
  };

  // 장바구니 테이블 컬럼 정의
  const cartColumns: ColumnsType<CartItem> = [
    {
      title: '이미지',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) => <img src={src} alt="제품 이미지" width={50} onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/50')} />,
    },
    { title: '품목코드', dataIndex: 'code', key: 'code' },
    { title: '품명', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '단가',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `${value.toLocaleString()}원`,
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record: CartItem) => {
        const product = mockProducts.find((p) => p.id === record.productId);
        return (
          <InputNumber
            min={0}
            value={quantity}
            onChange={(value) => {
              if (product && value !== null) {
                handleCartChange(product, value);
              }
            }}
            style={{ width: 70 }}
          />
        );
      },
    },
    {
      title: '합계 금액',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `${value.toLocaleString()}원`,
    },
    {
      title: '삭제',
      key: 'action',
      render: (_, record: CartItem) => {
        const product = mockProducts.find((p) => p.id === record.productId);
        return (
          <Button
            type="link"
            danger
            onClick={() => {
              if (product) {
                handleCartChange(product, 0);
              }
            }}
          >
            삭제
          </Button>
        );
      },
    },
  ];

  // 현재 로그인한 약국의 주문 내역만 필터링하여 가져옵니다.
  const myOrderHistory: OrderHistory[] = orders
    .filter((order) => order.pharmacyId === MY_PHARMACY_ID)
    .map((order) => ({
      id: order.id,
      items: orderItems.filter((item) => item.orderId === order.id),
      totalAmount: order.totalPrice,
      date: order.createdAt,
      status: order.status,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 검색어에 따라 제품 목록을 필터링합니다.
  const filteredProducts = mockProducts.filter((product) =>
    product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()),
  );

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
            {/* 주문 정보 (포인트 잔액 등) */}
            <Col span={24}>
              <Row>
                <Text strong style={{ fontSize: 20, marginBottom: '20px' }}>
                  주문 정보
                </Text>
              </Row>
              <Row gutter={20}>
                <Col span={5}>
                  <Card variant="borderless">
                    <Statistic
                      title="현재 포인트 잔액"
                      value={currentBalance}
                      formatter={(value) => `${Number(value).toLocaleString()}원`}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', fontSize: 40 }}>-</div>
                </Col>
                <Col span={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="품목 수 / 결제 금액"
                      value={`${cart.length}건 / ${totalOrderAmount.toLocaleString()}원`}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', fontSize: 40 }}>=</div>
                </Col>
                <Col span={5}>
                  <Card variant="borderless">
                    <Statistic
                      title="주문 후 잔액"
                      value={afterOrderBalance}
                      formatter={(value) => `${Number(value).toLocaleString()}원`}
                      valueStyle={{ color: '#da4040ff' }}
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
                  <Button type="primary" size="large" danger onClick={handleOrder} disabled={cart.length === 0}>
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
              <Table<OrderHistory>
                columns={orderHistoryColumns}
                dataSource={myOrderHistory}
                rowKey="id"
                pagination={{ pageSize: 5, position: ['bottomCenter'] }}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedOrder(record);
                    setIsDetailModalOpen(true);
                  },
                })}
              />
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
          placeholder="제품명으로 검색하세요"
          allowClear
          onSearch={setProductSearchTerm}
          onChange={(e) => setProductSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table<Product>
          columns={[
            { title: '품명', dataIndex: 'productName', key: 'productName' },
            { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
            { title: '단가', dataIndex: 'unitPrice', key: 'unitPrice', render: (v) => `${v.toLocaleString()}원` },
            {
              title: '수량',
              key: 'quantity',
              width: 120,
              render: (_, record) => (
                <InputNumber
                  min={0}
                  value={cart.find((item) => item.productId === record.id)?.quantity || 0}
                  onChange={(value) => handleCartChange(record, value!)}
                  style={{ width: 70 }}
                />
              ),
            },
          ]}
          dataSource={filteredProducts} // 필터링된 제품 목록을 사용합니다.
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* 주문 상세 내역 모달 */}
      <Modal
        open={isDetailModalOpen}
        title="주문 상세 내역"
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="주문번호">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="주문일자">{new Date(selectedOrder.date).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="총 금액">{selectedOrder.totalAmount.toLocaleString()}원</Descriptions.Item>
            <Descriptions.Item label="상태">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="품목 목록">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {selectedOrder.items.map((item) => {
                  const product = mockProducts.find((p) => p.id === item.productId);
                  return (
                    <li key={item.id}>
                      {product?.productName} - {item.quantity}개 ({item.subtotalPrice.toLocaleString()}원)
                    </li>
                  );
                })}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}