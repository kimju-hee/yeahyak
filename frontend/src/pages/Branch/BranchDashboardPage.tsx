import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Flex,
  List,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Typography,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api';
import { NOTICE_TYPE_TEXT } from '../../constants';
import { useLatestNotices } from '../../hooks/useNotices';
import { useAuthStore } from '../../stores/authStore';
import type { Pharmacy } from '../../types';
import { calculateCreditInfo } from '../../utils';

export default function BranchDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.pharmacyId;

  // 최근 공지사항 5개 조회
  const {
    data: latestNotices = [],
    error: noticesError,
    isLoading: noticesLoading,
  } = useLatestNotices();

  // 최근 발주 1건 상세 조회
  const {
    data: recentOrderData,
    error: orderError,
    isLoading: orderLoading,
  } = useQuery({
    queryKey: ['recentOrder', pharmacyId],
    queryFn: async () => {
      const list = await orderAPI.getOrdersBranch({
        pharmacyId,
        page: 0,
        size: 1,
      });

      if (list.success && list.data.length > 0) {
        const order = list.data[0];
        const detail = await orderAPI.getOrder(order.orderId);
        if (detail.success) {
          return {
            order: detail.data,
            items: detail.data.items ?? [],
          };
        }
        throw new Error('발주 상세 정보를 불러올 수 없습니다.');
      }

      return { order: undefined, items: [] };
    },
    enabled: !!pharmacyId,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 에러 처리
  if (noticesError) {
    messageApi.error('최근 공지사항 로딩 중 오류가 발생했습니다.');
  }

  if (orderError) {
    messageApi.error('최근 발주 상세 로딩 중 오류가 발생했습니다.');
  }

  const recentOrder = recentOrderData?.order;
  const recentOrderItems = recentOrderData?.items || [];

  const recentOrderItemsColumns: TableProps['columns'] = [
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
      align: 'center',
      width: '25%',
    },
    {
      title: '제조사',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      align: 'center',
      width: '25%',
    },
    { title: '수량', dataIndex: 'quantity', key: 'quantity', align: 'center', width: '15%' },
    {
      title: <div style={{ textAlign: 'center' }}>단가</div>,
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'right',
      width: '15%',
    },
    {
      title: <div style={{ textAlign: 'center' }}>소계</div>,
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'right',
      width: '20%',
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
                          to={`/branch/notices/${item.noticeId}`}
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

        <Row wrap gutter={16}>
          <Col span={12}>
            <Card
              title={
                recentOrder?.createdAt
                  ? `최근 발주 상세 (${
                      dayjs().diff(dayjs(recentOrder.createdAt), 'day') === 0
                        ? '오늘'
                        : `${dayjs().diff(dayjs(recentOrder.createdAt), 'day')}일 전`
                    })`
                  : '최근 발주 상세 (최근 발주 없음)'
              }
              variant="borderless"
              loading={orderLoading}
            >
              <Table
                dataSource={recentOrderItems}
                columns={recentOrderItemsColumns}
                pagination={false}
                rowKey="productId"
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="여신 한도 현황" variant="borderless">
              <Space direction="vertical" style={{ width: '100%' }}>
                {(() => {
                  const creditInfo = calculateCreditInfo(profile.balance);
                  return (
                    <>
                      <Statistic
                        title="남은 금액"
                        value={creditInfo.remainingAmount}
                        formatter={(value) => `${Number(value).toLocaleString()}원`}
                      />
                      <Progress
                        percent={creditInfo.remainingPercent}
                        showInfo={false}
                        strokeColor={creditInfo.strokeColor}
                        size={['100%', 16]}
                      />
                      <Typography.Text type="secondary">
                        사용 금액: {creditInfo.usedAmount.toLocaleString()}원
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        총 한도: {creditInfo.totalLimit.toLocaleString()}원
                      </Typography.Text>
                    </>
                  );
                })()}
              </Space>
            </Card>
          </Col>
        </Row>
      </Flex>
    </>
  );
}
