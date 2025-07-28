import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

interface Product {
  code: string;
  name: string;
  manufacturer: string;
  price: number;
}

interface Order {
  orderNumber: string;
  date: string;
  products: Product[];
}

interface ReturnItem {
  key: string;
  orderNumber: string;
  code: string;
  name: string;
  manufacturer: string;
  quantity: number;
  price: number;
  reason: string;
  returnDate: string;
}

const dummyOrders: Order[] = [
  {
    orderNumber: 'P1234',
    date: '2025-07-21',
    products: [
      { code: 'P001', name: '타이레놀', manufacturer: '한미약품', price: 7000 },
      { code: 'P002', name: '마데카솔', manufacturer: '동아제약', price: 8000 },
      { code: 'P003', name: '콜대원', manufacturer: '경동제약', price: 7500 },
      { code: 'P004', name: '써카페인', manufacturer: '대웅제약', price: 7200 },
      { code: 'P005', name: '겔포스', manufacturer: '보령제약', price: 7900 },
    ],
  },
  {
    orderNumber: 'P5678',
    date: '2025-07-18',
    products: [
      { code: 'P006', name: '판콜에스', manufacturer: '종근당', price: 6000 },
      { code: 'P007', name: '부루펜', manufacturer: '삼진제약', price: 9000 },
      { code: 'P008', name: '인후명정', manufacturer: '한올바이오', price: 6700 },
      { code: 'P009', name: '신일파스', manufacturer: '신일제약', price: 8700 },
      { code: 'P010', name: '후시딘', manufacturer: '동화약품', price: 8800 },
    ],
  },
];

export default function ReturnRequestPage() {
  const [form] = Form.useForm();
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [returnHistory, setReturnHistory] = useState<ReturnItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const handleOrderClick = () => {
    setModalVisible(true);
  };

  const handleOrderSelect = (order: Order) => {
    form.setFieldValue('orderNumber', order.orderNumber);
    setSelectedOrder(order);
    setProductList(order.products);
    setSelectedProduct(null);
    form.resetFields(['product', 'quantity', 'reason']);
    setModalVisible(false);
  };

  const handleProductChange = (code: string) => {
    const product = productList.find((p) => p.code === code) || null;
    setSelectedProduct(product);
  };

  const handleAddItem = () => {
    form.validateFields(['product', 'quantity', 'reason', 'orderNumber']).then((values) => {
      if (!selectedProduct || !selectedOrder) return;
      const newItem: ReturnItem = {
        key: Date.now().toString(),
        orderNumber: selectedOrder.orderNumber,
        code: selectedProduct.code,
        name: selectedProduct.name,
        manufacturer: selectedProduct.manufacturer,
        quantity: values.quantity,
        price: selectedProduct.price,
        reason: values.reason,
        returnDate: today,
      };
      setItems([...items, newItem]);
      form.resetFields(['product', 'quantity', 'reason']);
      setSelectedProduct(null);
    });
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      message.warning('반품 항목이 없습니다.');
      return;
    }
    setReturnHistory([...returnHistory, ...items]);
    setItems([]);
    message.success('반품 요청이 제출되었습니다.');
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const columns: ColumnsType<ReturnItem> = [
    { title: '신청일', dataIndex: 'returnDate' },
    { title: '제품명', dataIndex: 'name' },
    { title: '제품번호', dataIndex: 'code' },
    { title: '제조사', dataIndex: 'manufacturer' },
    { title: '반품 수량', dataIndex: 'quantity' },
    {
      title: '단가',
      dataIndex: 'price',
      render: (val) => `${val.toLocaleString()}원`,
    },
    {
      title: '반품 금액',
      render: (_, record) => `${(record.quantity * record.price).toLocaleString()}원`,
    },
    { title: '반품 사유', dataIndex: 'reason' },
    {
      title: '관리',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveItem(record.key)}>삭제</Button>
      ),
    },
  ];

  const historyColumns: ColumnsType<ReturnItem> = [
    { title: '신청일', dataIndex: 'returnDate' },
    { title: '주문번호', dataIndex: 'orderNumber' },
    { title: '제품명', dataIndex: 'name' },
    { title: '제품번호', dataIndex: 'code' },
    { title: '반품 수량', dataIndex: 'quantity' },
    {
      title: '단가',
      dataIndex: 'price',
      render: (val) => `${val.toLocaleString()}원`,
    },
    {
      title: '반품 금액',
      render: (_, record) => `${(record.quantity * record.price).toLocaleString()}원`,
    },
    { title: '반품 사유', dataIndex: 'reason' },
    {
      title: '상태',
      render: () => <Tag color="blue">승인 대기</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>반품 요청</Title>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="orderNumber"
              label={<span style={{ color: 'red' }}>* 주문번호</span>}
              rules={[{ required: true, message: '주문번호를 선택해주세요.' }]}
            >
              <Input readOnly onClick={handleOrderClick} placeholder="주문번호 선택" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} align="bottom">
          <Col span={4}>
            <Form.Item
              name="product"
              label={<span style={{ color: 'red' }}>* 제품명</span>}
              rules={[{ required: true, message: '제품을 선택해주세요.' }]}
            >
              <Select
                placeholder="제품 선택"
                onChange={handleProductChange}
                disabled={!productList.length}
              >
                {productList.map((p) => (
                  <Option key={p.code} value={p.code}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="quantity"
              label={<span style={{ color: 'red' }}>* 반품 수량</span>}
              rules={[{ required: true, message: '반품 수량 입력' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="단가">
              <Input disabled value={selectedProduct?.price ? `${selectedProduct.price.toLocaleString()}원` : ''} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="reason"
              label={<span style={{ color: 'red' }}>* 반품 사유</span>}
              rules={[{ required: true, message: '반품 사유 입력' }]}
            >
              <Input.TextArea placeholder="반품 사유 입력" autoSize={{ minRows: 1, maxRows: 4 }} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" onClick={handleAddItem} style={{ marginTop: 30 }}>
                항목 추가
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table columns={columns} dataSource={items} pagination={false} style={{ marginTop: 16 }} />
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        총 반품 금액: <strong>{totalAmount.toLocaleString()}원</strong>
      </div>
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <Button type="primary" onClick={handleSubmit}>
          반품 신청
        </Button>
      </div>

      <Card title="반품 진행 현황" style={{ marginTop: 48 }}>
        <Table columns={historyColumns} dataSource={returnHistory} pagination={false} />
      </Card>

      <Modal title="주문번호 선택" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        {dummyOrders.map((order) => (
          <Card
            key={order.orderNumber}
            hoverable
            onClick={() => handleOrderSelect(order)}
            style={{ marginBottom: 16 }}
          >
            <p><strong>주문번호:</strong> {order.orderNumber}</p>
            <p><strong>주문일자:</strong> {order.date}</p>
          </Card>
        ))}
      </Modal>
    </div>
  );
}
