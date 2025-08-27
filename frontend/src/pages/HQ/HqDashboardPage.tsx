import { Card, Col, List, message, Row, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeAPI, orderAPI } from '../../api';
import { DATE_FORMAT, NOTICE_TYPE_OPTIONS } from '../../constants';
import { type NoticeList, type OrderList } from '../../types';

// FIXME: 베스트셀러 하드코딩 해놓음
const bestSeller = [
  { key: 1, productName: '타이레놀정500mg', manufacturer: '한국존슨앤드존슨판매', quantity: 22292 },
  { key: 2, productName: '까스활명수큐액', manufacturer: '동화약품', quantity: 10440 },
  { key: 3, productName: '탁센연질캡슐', manufacturer: '녹십자', quantity: 9596 },
  { key: 4, productName: '텐텐츄정', manufacturer: '한미약품', quantity: 8343 },
];

export default function HqDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [latestNotices, setLatestNotices] = useState<NoticeList>([]);
  const [requestedOrders, setRequestedOrders] = useState<OrderList>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const noticeRes = await noticeAPI.getLatestNotices();

        if (noticeRes.success && noticeRes.data.length > 0) {
          setLatestNotices(noticeRes.data);
        } else {
          setLatestNotices([]);
        }

        const orderRes = await orderAPI.getOrdersHq({
          status: 'REQUESTED',
          page: 0,
          size: 5,
        });

        if (orderRes.success && orderRes.data.length > 0) {
          setRequestedOrders(orderRes.data);
        } else {
          setRequestedOrders([]);
        }
      } catch (e: any) {
        console.error('대시보드 데이터 로드 실패:', e);
        messageApi.error(
          e.response?.data?.message || '대시보드 데이터 로딩 중 오류가 발생했습니다.',
        );
        setLatestNotices([]);
        setRequestedOrders([]);
      }
    };

    fetchDashboardData();
  }, []);

  const bestSellerColumns = [
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    {
      title: '판매 수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number) => value.toLocaleString(),
    },
  ];

  const requestedOrdersColumns = [
    { title: '지점', dataIndex: 'pharmacyName', key: 'pharmacyName' },
    {
      title: '발주 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format(DATE_FORMAT.DEFAULT),
    },
    {
      title: '금액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
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
                <List.Item key={item.noticeId}>
                  <List.Item.Meta
                    title={
                      <Typography.Link
                        onClick={() => {
                          navigate(`/hq/notices/${item.noticeId}`, {
                            state: { returnTo: { type: item.type, page: 1, keyword: '' } },
                          });
                        }}
                      >
                        {`[${NOTICE_TYPE_OPTIONS[item.type]}] ${item.title}`}
                      </Typography.Link>
                    }
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
            title={`발주 요청 현황 (${dayjs().format(DATE_FORMAT.DEFAULT)} 기준)`}
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
