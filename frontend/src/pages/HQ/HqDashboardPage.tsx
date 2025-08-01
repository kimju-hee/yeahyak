import { Card, Col, List, Row, Table } from 'antd';
import { Link } from 'react-router-dom';
import { mockPharmacies } from '../../mocks/auth.mock';
import { mockNotices } from '../../mocks/notice.mock';
import { mockOrders } from '../../mocks/order.mock';

const bestSeller = [
  { key: 1, productName: '타이레놀정500mg', manufacturer: '한국존슨앤드존슨판매', quantity: 22292 },
  { key: 2, productName: '까스활명수큐액', manufacturer: '동화약품', quantity: 10440 },
  { key: 3, productName: '탁센연질캡슐', manufacturer: '녹십자', quantity: 9596 },
  { key: 4, productName: '텐텐츄정', manufacturer: '한미약품', quantity: 8343 },
];

export default function HqDashboardPage() {
  const latestNotices = [...mockNotices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number) => val.toLocaleString(),
    },
  ];

  const requestedOrders = mockOrders
    .filter((order) => order.status === 'REQUESTED')
    .map((order) => {
      const pharmacy = mockPharmacies.find((pharmacy) => pharmacy.id === order.pharmacyId);
      return {
        ...order,
        pharmacyName: pharmacy?.pharmacyName,
      };
    });

  const requestedOrdersColumns = [
    {
      title: '지점',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
    },
    {
      title: '발주일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleDateString(),
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
      <Row gutter={16}>
        <Col span={24}>
          <Card title="최근 공지사항" variant="borderless">
            <List
              dataSource={latestNotices}
              renderItem={(item) => (
                <List.Item>
                  <Link to={`/hq/notices/${item.id}`}>{item.title}</Link>
                </List.Item>
              )}
            ></List>
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
            title={`발주 요청 현황 (${new Date().toLocaleDateString()} 기준)`}
            variant="borderless"
          >
            <Table
              dataSource={requestedOrders}
              columns={requestedOrdersColumns}
              pagination={false}
              rowKey="id"
              size="small"
            ></Table>
          </Card>
        </Col>
      </Row>
    </>
  );
}
