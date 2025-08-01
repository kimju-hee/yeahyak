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
} from 'antd';
import React, { useState } from 'react';

import type { ColumnsType } from 'antd/es/table';
import type { TableProps } from 'antd';

const { Content } = Layout;
const { Text } = Typography;

interface OrderTable {
  // 장바구니
  key: React.Key;
  image: string;
  code: string;
  name: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderHistory {
  // 발주 목록
  id: string; // 발주 고유번호
  items: OrderTable[]; // 발주 신청된 항목들
  totalAmount: number; // 발주품목 금액 총합
  date: string; // 주문일자 (예: new Date().toISOString())
  tags: string[];
}

const columns: ColumnsType<OrderTable> = [
  {
    title: '이미지',
    dataIndex: 'image',
    key: 'image',
    render: (src: string) => <img src={src} alt="제품 이미지" width={50} />,
  },
  { title: '품목코드', dataIndex: 'code', key: 'code', render: (text: string) => <a>{text}</a> },
  { title: '품명', dataIndex: 'name', key: 'name' },
  { title: '등록일', dataIndex: 'date', key: 'date' },
  {
    title: '단가',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => `${value.toLocaleString()}원`,
  },
  { title: '수량', dataIndex: 'quantity', key: 'quantity' },
  {
    title: '합계 금액',
    dataIndex: 'total',
    key: 'total',
    render: (value: number) => `${value.toLocaleString()}원`,
  },
];

const rawData: Omit<OrderTable, 'total'>[] = [
  // 약품 구매 더미데이터
  {
    key: '1',
    image: '/images/SoknCool.jpg',
    code: 'TYR-5001',
    name: '타이레놀 정 500mg',
    date: '2025-07-01',
    quantity: 10,
    price: 300,
  },
  {
    key: '2',
    image: '/images/semiron.jpg',
    code: 'PNZ-1101',
    name: '펜잘큐정',
    date: '2025-07-03',
    quantity: 15,
    price: 250,
  },
  {
    key: '3',
    image: '/images/S_marin.png',
    code: 'BEZ-2204',
    name: '베아제정',
    date: '2025-07-05',
    quantity: 20,
    price: 200,
  },
  {
    key: '4',
    image: '/images/Maken_Q.jpg',
    code: 'GLF-3302',
    name: '겔포스엠 현탁액',
    date: '2025-07-07',
    quantity: 8,
    price: 500,
  },
  {
    key: '5',
    image: '/images/lierstop.jpg',
    code: 'GVC-4403',
    name: '개비스콘 더블액션',
    date: '2025-07-10',
    quantity: 12,
    price: 550,
  },
  {
    key: '6',
    image: '/images/GelforceAm_Suspension.jpg',
    code: 'GAS-5507',
    name: '까스활명수',
    date: '2025-07-12',
    quantity: 25,
    price: 180,
  },
  {
    key: '7',
    image: '/images/FestalPlusTablets.jpg',
    code: 'SSP-6609',
    name: '신신파스 아렉스',
    date: '2025-07-15',
    quantity: 5,
    price: 1200,
  },
  {
    key: '8',
    image: '/images/DulcolaxEsjangyongjeong.jpg',
    code: 'HMS-7712',
    name: '활명수 정',
    date: '2025-07-18',
    quantity: 18,
    price: 220,
  },
  {
    key: '9',
    image: '/images/Cass_active_water.jpg',
    code: 'EZ6-8820',
    name: '이지엔6 이브',
    date: '2025-07-21',
    quantity: 9,
    price: 450,
  },
  {
    key: '10',
    image: 'https://via.placeholder.com/50',
    code: 'FSD-9911',
    name: '후시딘 연고',
    date: '2025-07-25',
    quantity: 6,
    price: 700,
  },
];

// total 자동 계산
const orderData: OrderTable[] = rawData.map((item) => ({
  ...item,
  total: item.quantity * item.price,
}));

const orderHistoryColumns: ColumnsType<OrderHistory> = [
  {
    title: '주문번호',
    dataIndex: 'id',
    key: 'id',
    render: (id) => id.slice(0, 8), // 간략히 표시
  },
  {
    title: '주문일자',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '품목 수',
    dataIndex: 'items',
    key: 'items',
    render: (items: OrderTable[]) => `${items.length}건`,
  },
  {
    title: '결제 금액',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (val: number) => `${val.toLocaleString()}원`,
  },
  {
    title: '상태',
    dataIndex: 'tags',
    key: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
];

export default function OrderRequestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false); // modal 상태 저장( 제품 검색 )
  const [tableData, setTableData] = useState(orderData); // 더미 데이터
  const [selectedRows, setSelectedRows] = useState<OrderTable[]>([]); // 장바구니
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]); // 주문 내역

  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null); // 주문내역 행 선택
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // modal 상태 저장 ( 주문 상세 내역 )

  const [currentBalance, setCurrentBalance] = useState(250000); // 포인트 잔액

  const totalOrderAmount = selectedRows.reduce((sum, row) => sum + row.total, 0); // 총 결제 금액
  const afterOrderBalance = currentBalance - totalOrderAmount;

  const rowSelection: TableProps<OrderTable>['rowSelection'] = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows); // ✅ 선택된 행 상태 저장
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handelOk = () => {
    setIsModalOpen(false);
  };

  const handleCancle = () => {
    setIsModalOpen(false);
  };

  const handleOrder = () => {
    if (selectedRows.length === 0) {
      Modal.warning({ title: '주문할 항목이 없습니다.' });
      return;
    }

    const totalAmount = selectedRows.reduce((sum, row) => sum + row.total, 0);

    // 1. 주문 내역에 추가
    const newOrder: OrderHistory = {
      id: Math.random().toString(36).slice(2),
      items: selectedRows,
      totalAmount,
      date: new Date().toLocaleDateString(),
      tags: ['발주 완료'],
    };
    setOrderHistory((prev) => [...prev, newOrder]);

    // 2. 잔액에서 차감
    setCurrentBalance((prev) => prev - totalAmount);

    // 3. 테이블에서 항목 제거
    const selectedKeys = selectedRows.map((row) => row.key);
    setTableData((prev) => prev.filter((row) => !selectedKeys.includes(row.key)));

    // 4. 선택 초기화
    setSelectedRows([]);
  };

  return (
    <div style={{ paddingBottom: 250, minHeight: '100%' }}>
      {/* 🔹 상단: 발주 요청 제목 (왼쪽 정렬) */}
      <Row style={{ marginBottom: 32 }}>
        {' '}
        {/* 발주 요청 */}
        <Col>
          <Text strong style={{ fontSize: 30 }}>
            발주 요청
          </Text>
        </Col>
      </Row>
      <Row justify="center">
        {/* 내부 섹션 정렬용 Row */}
        <Col span={22}>
          <Row gutter={[0, 32]}>
            {/* 가로 여백 0, 세로 여백 32 */}
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
                      precision={2}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 'bold',
                    }}
                  >
                    -
                  </div>
                </Col>
                <Col span={6}>
                  <Card variant="borderless">
                    <Statistic
                      title="품목 수 / 결제 금액"
                      value={`${selectedRows.length}건 / ${totalOrderAmount.toLocaleString()}원`}
                      precision={2}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 'bold',
                    }}
                  >
                    =
                  </div>
                </Col>
                <Col span={5}>
                  <Card variant="borderless">
                    <Statistic
                      title="주문 후 잔액"
                      value={afterOrderBalance}
                      formatter={(value) => `${Number(value).toLocaleString()}원`}
                      precision={2}
                      valueStyle={{ color: '#da4040ff' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            {/* 🔸 요청 상세 내역 헤더 + 버튼 */}
            <Col span={24}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Text strong style={{ fontSize: 20 }}>
                    장바구니
                  </Text>
                </Col>
                <Col style={{ marginLeft: 1000, display: 'flex', gap: 8 }}>
                  <Button
                    type="primary"
                    onClick={showModal}
                    style={{ marginRight: 8 }}
                    size="large"
                  >
                    품목 검색
                  </Button>
                  <Modal
                    title="품목 검색"
                    closable={{ 'aria-label': 'Custom Close Button' }}
                    open={isModalOpen}
                    onOk={handelOk}
                    onCancel={handleCancle}
                  >
                    추후 품목 검색 페이지 구현 예정
                  </Modal>
                  <Button type="primary" size="large">
                    전체 품목 리스트
                  </Button>
                </Col>
                <Col>
                  <Button type="primary"  size="large" danger onClick={handleOrder}>
                    선택 항목 발주
                  </Button>
                </Col>
              </Row>

              {/* 🔸 요청 상세 테이블 */}
              <Row>
                <Col span={24}>
                  <Table<OrderTable>
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={tableData}
                    pagination={{ pageSize: 6, position: ['bottomCenter'] }}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: 20, marginBottom: 100 }}>
            <Col span={24}>
              <Text strong style={{ fontSize: 20, marginBottom: 12, display: 'block' }}>
                주문 내역
              </Text>
              <Table<OrderHistory>
                columns={orderHistoryColumns}
                dataSource={orderHistory}
                rowKey="id"
                pagination={false}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedOrder(record);
                    setIsDetailModalOpen(true);
                  },
                })}
              />
              <Modal
                open={isDetailModalOpen}
                title="주문 상세 내역"
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
              >
                {selectedOrder && (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="주문번호">{selectedOrder.id}</Descriptions.Item>
                    <Descriptions.Item label="주문일자">{selectedOrder.date}</Descriptions.Item>
                    <Descriptions.Item label="총 금액">
                      {selectedOrder.totalAmount.toLocaleString()}원
                    </Descriptions.Item>
                    <Descriptions.Item label="품목 목록">
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {selectedOrder.items.map((item) => (
                          <li key={item.key}>
                            {item.name} - {item.quantity}개 ({item.total.toLocaleString()}원)
                          </li>
                        ))}
                      </ul>
                    </Descriptions.Item>
                    <Descriptions.Item label="상태">{selectedOrder.tags}</Descriptions.Item>
                  </Descriptions>
                )}
              </Modal>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
