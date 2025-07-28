import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title } = Typography;

interface ReturnItem {
  key: string;
  image: string;
  name: string;
  code: string;
  manufacturer: string;
  quantity: number;
  price: number;
  reason: string;
}

interface ReturnProgressItem {
  key: string;
  date: string;
  orderNumber: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
  reason: string;
  status: string;
  processedAt?: string;
}

const dummyProducts = [
  {
    code: 'P001',
    name: '타이레놀',
    manufacturer: '한미약품',
    price: 7000,
    image: 'https://via.placeholder.com/40',
  },
  {
    code: 'P002',
    name: '마데카솔',
    manufacturer: '동아제약',
    price: 8000,
    image: 'https://via.placeholder.com/40',
  },
];

export default function ReturnRequestPage() {
  const [form] = Form.useForm();
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleAddItem = () => {
    form
      .validateFields(['product', 'quantity', 'reason'])
      .then((values) => {
        const product = dummyProducts.find((p) => p.code === values.product);
        if (!product) return;
        const newItem: ReturnItem = {
          key: Date.now().toString(),
          image: product.image,
          name: product.name,
          code: product.code,
          manufacturer: product.manufacturer,
          quantity: values.quantity,
          price: product.price,
          reason: values.reason,
        };
        setItems([...items, newItem]);
        form.resetFields(['product', 'quantity', 'reason']);
      });
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const columns: ColumnsType<ReturnItem> = [
    {
      title: '이미지',
      dataIndex: 'image',
      render: (src) => <img src={src} alt="product" style={{ width: 40 }} />, 
    },
    {
      title: '제품명',
      dataIndex: 'name',
    },
    {
      title: '제품번호',
      dataIndex: 'code',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
    },
    {
      title: '반품 수량',
      dataIndex: 'quantity',
    },
    {
      title: '단가',
      dataIndex: 'price',
      render: (value) => `${value.toLocaleString()}원`,
    },
    {
      title: '반품 금액',
      render: (_, record) => `${(record.quantity * record.price).toLocaleString()}원`,
    },
    {
      title: '반품 사유',
      dataIndex: 'reason',
    },
    {
      title: '관리',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveItem(record.key)}>
          삭제
        </Button>
      ),
    },
  ];

  const progressData: ReturnProgressItem[] = [
    {
      key: '1',
      date: '2025-07-21',
      orderNumber: 'P1234',
      name: '타이레놀',
      quantity: 5,
      price: 7000,
      amount: 35000,
      reason: '파손',
      status: '승인 대기',
    },
    {
      key: '2',
      date: '2025-07-18',
      orderNumber: 'P5678',
      name: '판콜에스',
      quantity: 3,
      price: 6000,
      amount: 18000,
      reason: '유통기한 임박',
      status: '반려',
      processedAt: '2025-07-20',
    },
  ];

  const progressColumns: ColumnsType<ReturnProgressItem> = [
    { title: '신청일', dataIndex: 'date' },
    { title: '주문번호', dataIndex: 'orderNumber' },
    { title: '제품명', dataIndex: 'name' },
    { title: '반품 수량', dataIndex: 'quantity' },
    {
      title: '단가',
      dataIndex: 'price',
      render: (value) => `${value.toLocaleString()}원`,
    },
    {
      title: '반품 금액',
      dataIndex: 'amount',
      render: (value) => `${value.toLocaleString()}원`,
    },
    { title: '반품 사유', dataIndex: 'reason' },
    { title: '상태', dataIndex: 'status' },
    { title: '처리일', dataIndex: 'processedAt' },
  ];

  return (
    <div>
      <Title level={2}>반품 요청</Title>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="date" label="요청일자" rules={[{ required: true }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="orderNumber" label="주문번호" rules={[{ required: true }]}> <Input placeholder="예: P123456" /> </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} align="bottom">
          <Col span={4}>
            <Form.Item name="product" label="제품명" rules={[{ required: true }]}> <Select placeholder="제품 선택"> {dummyProducts.map((p) => (<Option key={p.code} value={p.code}>{p.name}</Option>))} </Select> </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="quantity" label="반품 수량" rules={[{ required: true }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="단가"> <Input value={selectedProduct?.price ? `${selectedProduct.price}원` : ''} disabled /> </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="reason" label="반품 사유" rules={[{ required: true }]}> <Input placeholder="예: 파손" /> </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              <Button type="primary" onClick={handleAddItem} style={{ marginTop: 30 }}>항목 추가</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        style={{ marginTop: 24 }}
        columns={columns}
        dataSource={items}
        pagination={false}
      />
      <div style={{ textAlign: 'right', marginTop: 12 }}>총 반품 금액: <strong>{totalAmount.toLocaleString()}원</strong></div>
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <Button type="primary">반품 신청</Button>
      </div>

      {/* 반품 진행 현황 */}
      <Card title="반품 진행 현황" style={{ marginTop: 48 }}>
        <Table columns={progressColumns} dataSource={progressData} pagination={false} />
      </Card>
    </div>
  );
}
