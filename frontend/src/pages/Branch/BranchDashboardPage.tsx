import { Card, Col, List, message, Progress, Row, Space, Statistic, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeAPI, orderAPI } from '../../api';
import { NOTICE_TYPE_TEXT } from '../../constants';
import { useAuthStore } from '../../stores/authStore';
import type { NoticeListRes, OrderListRes, Pharmacy, User } from '../../types';
import { calculateCreditInfo } from '../../utils';

export default function BranchDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.pharmacyId;

  const [latestAnnouncements, setLatestAnnouncements] = useState<NoticeListRes[]>([]);
  const [recentOrder, setRecentOrder] = useState<OrderListRes[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const noticeResponse = await noticeAPI.getNotices({ page: 0, size: 5 });

        if (noticeResponse.success && noticeResponse.data.length > 0) {
          setLatestAnnouncements(noticeResponse.data);
        } else {
          setLatestAnnouncements([]);
        }

        const orderResponse = await orderAPI.getBranchOrders({ pharmacyId, page: 0, size: 1 });

        if (orderResponse.success && orderResponse.data.length > 0) {
          setRecentOrder(orderResponse.data);
        } else {
          setRecentOrder([]);
        }
      } catch (e: any) {
        console.error('대시보드 데이터 로드 실패:', e);
        messageApi.error(
          e.response?.data?.message || '대시보드 데이터 로딩 중 오류가 발생했습니다.',
        );
        setLatestAnnouncements([]);
        setRecentOrder([]);
      }
    };

    fetchDashboardData();
  }, [pharmacyId]);

  const recentOrderItemsColumns = [
    { title: '제품명', dataIndex: 'productName', key: 'productName' },
    { title: '수량', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
    },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (value: number) => `${value.toLocaleString()}원`,
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
          {recentOrder.length > 0 ? (
            <Card
              title={`최근 발주 상세 (${(() => {
                const orderDate = dayjs(recentOrder[0].createdAt);
                const today = dayjs();
                const diffDays = today.diff(orderDate, 'day');
                return diffDays === 0 ? '오늘' : `${diffDays}일 전`;
              })()})`}
              variant="borderless"
            >
              <Table
                dataSource={recentOrder[0].items}
                columns={recentOrderItemsColumns}
                pagination={false}
                rowKey="productName"
                size="small"
              />
            </Card>
          ) : (
            <Card title={`최근 발주 상세`} variant="borderless">
              <Table
                dataSource={[]}
                columns={recentOrderItemsColumns}
                pagination={false}
                rowKey="productName"
                size="small"
              />
            </Card>
          )}
        </Col>
        <Col span={12}>
          <Card title="크레딧 현황" variant="borderless">
            <Space direction="vertical" style={{ width: '100%' }}>
              {(() => {
                const creditInfo = calculateCreditInfo(user.point);
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
