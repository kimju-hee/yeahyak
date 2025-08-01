import { Card, Col, List, Row, Table } from 'antd';
import { Link } from 'react-router-dom';
import { mockNotices } from '../../mocks/notice.mock';
import { mockOrderItems, mockOrders } from '../../mocks/order.mock';
import { mockProducts } from '../../mocks/product.mock';
import type { Pharmacy, User } from '../../mocks/types';
import { useAuthStore } from '../../stores/authStore';

export default function BranchDashboardPage() {
  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile) as Pharmacy;
  const pharmacyId = profile.id;

  const latestNotices = [...mockNotices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentOrder = [...mockOrders]
    .filter((order) => order.pharmacyId === pharmacyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const recentOrderItems = mockOrderItems
    .filter((item) => item.orderId === recentOrder.id)
    .map((item) => {
      const product = mockProducts.find((product) => product.id === item.productId);
      return {
        ...item,
        productName: product?.productName,
      };
    });

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
      <Row gutter={16}>
        <Col span={24}>
          <Card title="최근 공지사항" variant="borderless">
            <List
              dataSource={latestNotices}
              renderItem={(item) => (
                <List.Item>
                  <Link to={`/branch/notices/${item.id}`}>{item.title}</Link>
                </List.Item>
              )}
            ></List>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="최근 발주 상세" variant="borderless">
            <Table
              dataSource={recentOrderItems}
              columns={recentOrderItemsColumns}
              pagination={false}
              rowKey="id"
              size="small"
            ></Table>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="잔액 현황" variant="borderless">
            {user.balance?.toLocaleString()}원
          </Card>
        </Col>
      </Row>
    </>
  );
}
