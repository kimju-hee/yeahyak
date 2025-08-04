import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Modal, Row, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';

interface ReturnRequest {
  key: string;
  date: string;
  storeName: string;
  storeCode: string;
  orderNumber: string;
  productName: string;
  productCode: string;
  manufacturer: string;
  quantity: number;
  price: number;
  reason: string;
  status: '승인 대기' | '승인 완료' | '반품 거절';
  rejectReason?: string;
  processedDate?: string;
}

const initialData: ReturnRequest[] = [
  {
    key: '1',
    date: '2025-07-28',
    storeName: '유성점',
    storeCode: 'S001',
    orderNumber: 'P1234',
    productName: '마데카솔',
    productCode: 'P002',
    manufacturer: '동아제약',
    quantity: 11,
    price: 8000,
    reason: '오배송',
    status: '승인 대기',
  },
  {
    key: '2',
    date: '2025-07-28',
    storeName: 'Kt점',
    storeCode: 'S002',
    orderNumber: 'P5678',
    productName: '판콜에스',
    productCode: 'P006',
    manufacturer: '종근당',
    quantity: 20,
    price: 6000,
    reason: '제품 파손',
    status: '승인 대기',
  },
];

export default function ReturnManagementPage() {
  const [data, setData] = useState<ReturnRequest[]>(initialData);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetKey, setRejectTargetKey] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');

  const today = dayjs().format('YYYY-MM-DD');

  const handleApprove = (key: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, status: '승인 완료', processedDate: today } : item,
      ),
    );
  };

  const handleRejectClick = (key: string) => {
    setRejectTargetKey(key);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectTargetKey) return;
    setData((prev) =>
      prev.map((item) =>
        item.key === rejectTargetKey
          ? { ...item, status: '반품 거절', rejectReason, processedDate: today }
          : item,
      ),
    );
    setRejectModalOpen(false);
    setRejectReason('');
    setRejectTargetKey(null);
  };

  const filteredData = data.filter((item) => item.storeName.includes(search));

  const totalAmount = data.reduce(
    (sum, item) => (item.status === '승인 완료' ? sum + item.quantity * item.price : sum),
    0,
  );

  const columns: ColumnsType<ReturnRequest> = [
    { title: '신청일', dataIndex: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
    { title: '가맹점명', dataIndex: 'storeName' },
    { title: '가맹점 코드', dataIndex: 'storeCode' },
    { title: '주문번호', dataIndex: 'orderNumber' },
    { title: '제품명', dataIndex: 'productName' },
    { title: '제품번호', dataIndex: 'productCode' },
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
      title: '상태',
      render: (_, record) => {
        if (record.status === '승인 완료') return <Tag color="green">승인 완료</Tag>;
        if (record.status === '반품 거절')
          return (
            <>
              <Tag color="red">반품 거절</Tag>
              <div style={{ fontSize: 12, color: '#999' }}>사유: {record.rejectReason}</div>
            </>
          );
        return (
          <Tag icon={<span>⏳</span>} color="blue">
            승인 대기
          </Tag>
        );
      },
    },
    {
      title: '처리일',
      dataIndex: 'processedDate',
      render: (_, record) => record.processedDate || '-',
    },
    {
      title: '관리',
      render: (_, record) =>
        record.status === '승인 대기' ? (
          <>
            <Button type="primary" size="small" onClick={() => handleApprove(record.key)}>
              승인
            </Button>
            <Button
              danger
              size="small"
              onClick={() => handleRejectClick(record.key)}
              style={{ marginLeft: 8 }}
            >
              거절
            </Button>
          </>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="총 요청" value={data.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="승인 완료"
              value={data.filter((i) => i.status === '승인 완료').length}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="반품 거절"
              value={data.filter((i) => i.status === '반품 거절').length}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="총 반품 금액" value={totalAmount} suffix="원" />
          </Card>
        </Col>
      </Row>

      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="가맹점명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData.sort((a, b) => b.date.localeCompare(a.date))}
        pagination={{ pageSize: 5 }}
        rowKey="key"
      />

      <Modal
        title="반품 거절 사유 입력"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="거절"
        cancelText="취소"
      >
        <Input.TextArea
          placeholder="거절 사유를 입력하세요"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          autoSize={{ minRows: 3 }}
        />
      </Modal>
    </div>
  );
}
