import {
  Card,
  Col,
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeAPI, orderAPI } from '../../api';
import { NOTICE_TYPE_TEXT } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import type { NoticeList, OrderDetail, OrderDetailItem, Pharmacy } from '../../types';
import { calculateCreditInfo } from '../../utils';

export default function BranchDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.pharmacyId;

  const [latestNotices, setLatestNotices] = useState<NoticeList[]>([]);
  const [recentOrder, setRecentOrder] = useState<OrderDetail | undefined>(undefined);
  const [recentOrderItems, setRecentOrderItems] = useState<OrderDetailItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 최근 공지사항 5개
      try {
        const latest = await noticeAPI.getLatestNotices();
        if (latest.success && latest.data.length > 0) {
          setLatestNotices(latest.data);
        } else {
          setLatestNotices([]);
        }
      } catch (e: any) {
        console.error('최근 공지사항 로드 실패:', e);
        messageApi.error(e.response?.data?.message || '최근 공지사항 로딩 중 오류가 발생했습니다.');
        setLatestNotices([]);
      }
      // 최근 발주 1건 상세
      try {
        const list = await orderAPI.getOrdersBranch({ pharmacyId, page: 0, size: 1 });

        if (list.success && list.data.length > 0) {
          const order = list.data[0];
          const detail = await orderAPI.getOrder(order.orderId);
          if (detail.success) {
            setRecentOrder(detail.data);
            setRecentOrderItems(detail.data.items ?? []);
          }
        }
      } catch (e: any) {
        console.error('최근 발주 상세 로드 실패:', e);
        messageApi.error(
          e.response?.data?.message || '최근 발주 상세 로딩 중 오류가 발생했습니다.',
        );
        setRecentOrder(undefined);
        setRecentOrderItems([]);
      }
    };

    fetchDashboardData();
  }, [pharmacyId]);

  const recentOrderItemsColumns: TableProps['columns'] = [
    { title: '제품명', dataIndex: 'productName', key: 'productName', align: 'center' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center' },
    { title: '수량', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'center',
    },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'center',
    },
  ];

  return (
    <>
      {contextHolder}
      <Row wrap gutter={16}>
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
                          navigate(`/branch/notices/${item.noticeId}`, {
                            state: { returnTo: { type: item.type, page: 1, keyword: '' } },
                          });
                        }}
                      >
                        {`[${NOTICE_TYPE_TEXT[item.type]}] ${item.title}`}
                      </Typography.Link>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row wrap gutter={16} style={{ marginTop: '16px' }}>
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
          <Card title="크레딧 현황" variant="borderless">
            <Space direction="vertical" style={{ width: '100%' }}>
              {(() => {
                const creditInfo = calculateCreditInfo(profile.outstandingBalance);
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
    </>
  );
}
