import { Card, Col, List, message, Row, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { instance } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import type { Announcement } from '../../types/announcement.type';
import type { OrderItemListResponse } from '../../types/order.type';
import type { Pharmacy, User } from '../../types/profile.type';

export default function BranchDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.pharmacyId;

  const [latestNotices, setLatestNotices] = useState<Announcement[]>([]);
  const [recentOrderItems, setRecentOrderItems] = useState<OrderItemListResponse[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: 쿼리 파라미터 확인
        const noticeRes = await instance.get('/announcements?page=0&size=5');
        // LOG: 테스트용 로그
        console.log('✨ 최근 공지사항 로딩 응답:', noticeRes.data);
        if (noticeRes.data.success) {
          setLatestNotices(noticeRes.data.data || []);
        }

        // TODO: 쿼리 파라미터 확인
        const orderRes = await instance.get(
          `/orders/branch/orders?page=0&size=1&pharmacyId=${pharmacyId}`,
        );
        // LOG: 테스트용 로그
        console.log('✨ 최근 발주 상세 로딩 응답:', orderRes.data);
        if (orderRes.data.success && orderRes.data.data.length > 0) {
          setRecentOrderItems(orderRes.data.data[0].items || []);
        }
      } catch (e: any) {
        console.error('대시보드 데이터 로드 실패:', e);
        messageApi.error(
          e.response?.data?.message || '대시보드 데이터 로딩 중 오류가 발생했습니다.',
        );
        setLatestNotices([]);
        setRecentOrderItems([]);
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
                <List.Item>
                  <Link to={`/branch/notices/${item.announcementId}`}>{item.title}</Link>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row wrap gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="최근 발주 상세" variant="borderless">
            <Table
              dataSource={recentOrderItems}
              columns={recentOrderItemsColumns}
              pagination={false}
              rowKey={(_, idx) => `item-${idx}`}
              size="small"
            />
          </Card>
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
