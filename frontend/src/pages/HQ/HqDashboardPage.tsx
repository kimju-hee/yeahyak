import { useQuery } from '@tanstack/react-query';
import { Card, Col, Flex, List, message, Row, Table, type TableProps } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api';
import { DATE_FORMAT, NOTICE_TYPE_TEXT } from '../../constants';
import { useLatestNotices } from '../../hooks/useNotices';
import { useAuthStore } from '../../stores/authStore';
import { type Admin } from '../../types';

// FIXME: 베스트셀러 하드코딩 해놓음
const bestSeller = [
  { key: 1, productName: '타이레놀정500mg', manufacturer: '한국존슨앤드존슨판매', quantity: 22292 },
  { key: 2, productName: '까스활명수큐액', manufacturer: '동화약품', quantity: 10440 },
  { key: 3, productName: '탁센연질캡슐', manufacturer: '녹십자', quantity: 9596 },
  { key: 4, productName: '텐텐츄정', manufacturer: '한미약품', quantity: 8343 },
];

export default function HqDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const profile = useAuthStore((state) => state.profile) as Admin;
  const adminId = profile.adminId;

  // 최근 공지사항 5개 조회
  const {
    data: latestNotices = [],
    error: noticesError,
    isLoading: noticesLoading,
  } = useLatestNotices();

  // 최근 발주 요청 5건 조회
  const {
    data: requestedOrders = [],
    error: ordersError,
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ['requestedOrders', adminId],
    queryFn: async () => {
      const response = await orderAPI.getOrdersHq({
        status: 'REQUESTED',
        page: 0,
        size: 5,
      });

      if (response.success) {
        return response.data;
      }
      throw new Error('발주 요청을 불러올 수 없습니다.');
    },
    enabled: !!adminId,
    staleTime: 3 * 60 * 1000, // 3분간 캐시 유지
  });

  // 에러 처리
  if (noticesError) {
    messageApi.error('최근 공지사항 로딩 중 오류가 발생했습니다.');
  }

  if (ordersError) {
    messageApi.error('최근 발주 요청 로딩 중 오류가 발생했습니다.');
  }

  const bestSellerColumns: TableProps['columns'] = [
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
      align: 'center',
      width: '40%',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      align: 'center',
      width: '40%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>판매 수량</div>,
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number) => value.toLocaleString(),
      align: 'right',
      width: '20%',
    },
  ];

  const requestedOrdersColumns: TableProps['columns'] = [
    {
      title: '약국',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      align: 'center',
      width: '20%',
    },
    {
      title: '발주 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format(DATE_FORMAT.DEFAULT),
      align: 'center',
      width: '30%',
    },
    { title: '발주 요약', dataIndex: 'summary', key: 'summary', align: 'center', width: '25%' },
    {
      title: '금액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'center',
      width: '25%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Flex vertical gap={16}>
        <Row wrap gutter={16}>
          <Col span={24}>
            <Card title="최근 공지사항" variant="borderless" loading={noticesLoading}>
              <List
                dataSource={latestNotices}
                renderItem={(item) => (
                  <List.Item key={item.noticeId}>
                    <List.Item.Meta
                      title={
                        <Link
                          to={`/hq/notices/${item.noticeId}`}
                          state={{ returnTo: { type: item.type, page: 1, keyword: '' } }}
                        >
                          {`[${NOTICE_TYPE_TEXT[item.type]}] ${item.title}`}
                        </Link>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="최고 매출 제품" variant="borderless">
              <Table
                dataSource={bestSeller}
                columns={bestSellerColumns}
                pagination={false}
                rowKey="key"
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`발주 요청 현황 (${dayjs().format(DATE_FORMAT.DEFAULT)} 기준)`}
              variant="borderless"
              loading={ordersLoading}
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
      </Flex>
    </>
  );
}
