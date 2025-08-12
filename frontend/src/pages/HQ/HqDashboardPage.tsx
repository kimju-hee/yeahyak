import { Card, Col, List, message, Row, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { instance } from '../../api/api';
import type { Announcement } from '../../types/announcement.type';
import { ANNOUNCEMENT_TYPE } from '../../types/announcement.type';
import type { OrderListResponse } from '../../types/order.type';

// FIXME: 베스트셀러 하드코딩 해놓음
const bestSeller = [
  { key: 1, productName: '타이레놀정500mg', manufacturer: '한국존슨앤드존슨판매', quantity: 22292 },
  { key: 2, productName: '까스활명수큐액', manufacturer: '동화약품', quantity: 10440 },
  { key: 3, productName: '탁센연질캡슐', manufacturer: '녹십자', quantity: 9596 },
  { key: 4, productName: '텐텐츄정', manufacturer: '한미약품', quantity: 8343 },
];

export default function HqDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [latestNotices, setLatestNotices] = useState<Announcement[]>([]);
  const [requestedOrders, setRequestedOrders] = useState<OrderListResponse[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const noticeRes = await instance.get('/announcements?page=0&size=5');
        // LOG: 테스트용 로그
        console.log('✨ 최근 공지사항 로딩 응답:', noticeRes.data);
        if (noticeRes.data.success && noticeRes.data.data.length > 0) {
          setLatestNotices(noticeRes.data.data);
        }

        const orderRes = await instance.get(`/orders/admin/orders?status=REQUESTED&page=0&size=5`);
        // LOG: 테스트용 로그
        console.log('✨ 발주 요청 현황 로딩 응답:', orderRes.data);
        if (orderRes.data.success && orderRes.data.data.length > 0) {
          setRequestedOrders(orderRes.data.data);
        }
      } catch (e: any) {
        console.error('대시보드 데이터 로드 실패:', e);
        messageApi.error(e.message || '대시보드 데이터 로딩 중 오류가 발생했습니다.');
        setLatestNotices([]);
        setRequestedOrders([]);
      }
    };

    fetchDashboardData();
  }, []);

  const bestSellerColumns = [
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: '판매 수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number) => val.toLocaleString(),
    },
  ];

  const requestedOrdersColumns = [
    {
      title: '지점',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
    },
    {
      title: '발주 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => dayjs(val).format('YYYY/MM/DD HH:mm'),
    },
    {
      title: '총액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (val: number) => `${val.toLocaleString()}원`,
    },
  ];

  return (
    <>
      {contextHolder}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="최근 공지사항" variant="borderless">
            <List
              dataSource={latestNotices}
              renderItem={(item) => (
                <List.Item key={item.announcementId}>
                  <List.Item.Meta
                    title={<Link to={`/hq/notices/${item.announcementId}`}>{item.title}</Link>}
                    description={ANNOUNCEMENT_TYPE[item.type]}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="최고 매출 제품" variant="borderless">
            <Table
              dataSource={bestSeller}
              columns={bestSellerColumns}
              pagination={false}
              rowKey="key"
              size="small"
            ></Table>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={`발주 요청 현황 (${dayjs().format('YYYY.MM.DD. HH:mm')} 기준)`}
            variant="borderless"
          >
            <Table
              dataSource={requestedOrders}
              columns={requestedOrdersColumns}
              pagination={false}
              rowKey="orderId"
              size="small"
            ></Table>
          </Card>
        </Col>
      </Row>
    </>
  );
}
