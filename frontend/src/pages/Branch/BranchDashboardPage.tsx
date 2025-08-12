import { Card, Col, List, message, Row, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { instance } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import { ANNOUNCEMENT_TYPE, type Announcement } from '../../types/announcement.type';
import type { OrderListResponse } from '../../types/order.type';
import type { Pharmacy, User } from '../../types/profile.type';

export default function BranchDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.pharmacyId;

  const [latestNotices, setLatestNotices] = useState<Announcement[]>([]);
  const [recentOrder, setRecentOrder] = useState<OrderListResponse[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const noticeRes = await instance.get('/announcements?page=0&size=5');
        // LOG: 테스트용 로그
        console.log('✨ 최근 공지사항 로딩 응답:', noticeRes.data);
        if (noticeRes.data.success && noticeRes.data.data.length > 0) {
          setLatestNotices(noticeRes.data.data);
        }

        const orderRes = await instance.get(
          `/orders/branch/orders?pharmacyId=${pharmacyId}&page=0&size=1`,
        );
        // LOG: 테스트용 로그
        console.log('✨ 최근 발주 상세 로딩 응답:', orderRes.data);
        if (orderRes.data.success && orderRes.data.data.length > 0) {
          setRecentOrder(orderRes.data.data);
        }
      } catch (e: any) {
        console.error('대시보드 데이터 로드 실패:', e);
        messageApi.error(e.message || '대시보드 데이터 로딩 중 오류가 발생했습니다.');
        setLatestNotices([]);
        setRecentOrder([]);
      }
    };

    fetchDashboardData();
  }, [pharmacyId]);

  const recentOrderItemsColumns = [
    {
      title: '제품명',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (val: number) => `${val.toLocaleString()}원`,
    },
    {
      title: '소계',
      dataIndex: 'subtotalPrice',
      key: 'subtotalPrice',
      render: (val: number) => `${val.toLocaleString()}원`,
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
                <List.Item key={item.announcementId}>
                  <List.Item.Meta
                    title={<Link to={`/branch/notices/${item.announcementId}`}>{item.title}</Link>}
                    description={ANNOUNCEMENT_TYPE[item.type]}
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
                locale={{ emptyText: '최근 발주 내역이 없습니다.' }}
              />
            </Card>
          )}
        </Col>
        <Col span={12}>
          <Card title="잔액 현황" variant="borderless">
            {user.point.toLocaleString()}원
          </Card>
        </Col>
      </Row>
    </>
  );
}
