import {
  ApartmentOutlined,
  AreaChartOutlined,
  BellOutlined,
  BulbFilled,
  ContainerFilled,
  LogoutOutlined,
  MinusSquareFilled,
  NotificationFilled,
  PlusSquareFilled,
  UserOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Dropdown, Layout, Menu, message, Row, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Admin } from '../mocks/types';
import { useAuthStore } from '../stores/authStore';

const { Sider, Header, Content, Footer } = Layout;
const { Text } = Typography;

const theme = {
  components: {
    Menu: {
      itemHeight: 38, // 메뉴 아이템 높이 (default 40)
      itemMarginBlock: 24, // 메뉴 아이템 margin-block (default 4)
      itemMarginInline: 4, // 메뉴 아이템 수평 margin (default 4)
      itemPaddingInline: 16, // 메뉴 아이템 padding-inline (default 16)
    },
    Layout: {
      headerPadding: '0 48px', // 헤더 padding (default 0 50px)
    },
    Dropdown: {
      paddingBlock: 8, // 드롭다운 수직 padding (default 5)
    },
  },
};

const siderMenuItems = [
  {
    key: 'notices',
    label: <Link to="/hq/notices">공지사항</Link>,
    icon: <NotificationFilled />,
  },
  {
    key: 'branches',
    label: <Link to="/hq/branches">가맹점 관리</Link>,
    icon: <ApartmentOutlined />,
  },
  {
    key: 'orders',
    label: <Link to="/hq/orders">발주요청 관리</Link>,
    icon: <PlusSquareFilled />,
  },
  {
    key: 'returns',
    label: <Link to="/hq/returns">반품요청 관리</Link>,
    icon: <MinusSquareFilled />,
  },
  {
    key: 'monitoring',
    label: <Link to="/hq/monitoring">가맹점 모니터링</Link>,
    icon: <AreaChartOutlined />,
  },
  {
    key: 'forecast',
    label: <Link to="/hq/forecast">수요예측</Link>,
    icon: <BulbFilled />,
  },
  {
    key: 'stock',
    label: <Link to="/hq/stock">재고관리</Link>,
    icon: <ContainerFilled />,
  },
];

export default function HqLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const admin = profile as Admin;
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    message.success('로그아웃 되었습니다.');
    navigate('/login', { replace: true });
  };

  const avatarMenuItems = {
    items: [
      {
        key: 'logout',
        label: '로그아웃',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    for (let item of siderMenuItems) {
      if (item.label && item.label.props && item.label.props.to) {
        const itemPath = item.label.props.to;
        if (path === itemPath || path.startsWith(`${itemPath}/`)) {
          return [item.key];
        }
      }
    }
    return [];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ height: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/hq">예약</Link>
          <Row>
            <Text style={{ color: '#ffffff' }}>{admin?.adminName}</Text>
            <BellOutlined style={{ fontSize: '24px', margin: '0 24px', color: '#ffffff' }} />
            <Dropdown
              trigger={['click']}
              menu={avatarMenuItems}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <UserOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </Dropdown>
          </Row>
        </Header>
        <Layout>
          <Sider
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Menu
              theme="dark"
              style={{ width: '100%' }}
              items={siderMenuItems}
              selectedKeys={selectedKeys}
            ></Menu>
          </Sider>
          <Layout>
            <Content style={{ margin: '24px', padding: '24px' }}>
              <Outlet />
            </Content>
            <Footer style={{ textAlign: 'center' }}>© 2025 Team yeahyak</Footer>
          </Layout>
        </Layout>
      </Layout>
      {/*<Chatbot />*/}
    </ConfigProvider>
  );
}
