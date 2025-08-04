import {
  ApartmentOutlined,
  AreaChartOutlined,
  BellOutlined,
  BulbFilled,
  EditOutlined,
  KeyOutlined,
  LogoutOutlined,
  MinusSquareFilled,
  NotificationFilled,
  PlusSquareFilled,
  ProductFilled,
  TagsFilled,
  UserOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Dropdown, Flex, Layout, Menu, message, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Admin } from '../types/admin';

const { Sider, Header, Content, Footer } = Layout;

// Design Token
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

// 사이드 메뉴 아이템
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
    label: <Link to="/hq/orders">발주 요청 관리</Link>,
    icon: <PlusSquareFilled />,
  },
  {
    key: 'returns',
    label: <Link to="/hq/returns">반품 요청 관리</Link>,
    icon: <MinusSquareFilled />,
  },
  {
    key: 'monitoring',
    label: <Link to="/hq/monitoring">가맹점 모니터링</Link>,
    icon: <AreaChartOutlined />,
  },
  {
    key: 'forecast',
    label: <Link to="/hq/forecast">수요 예측</Link>,
    icon: <BulbFilled />,
  },
  {
    key: 'stock',
    label: <Link to="/hq/stock">재고 관리</Link>,
    icon: <ProductFilled />,
  },
  {
    key: 'products',
    label: <Link to="/hq/products">제품 목록</Link>,
    icon: <TagsFilled />,
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

  // 아바타 메뉴 아이템
  const avatarMenuItems = {
    items: [
      {
        key: 'profile-edit',
        label: <Link to="/hq/profile-edit">내 정보 수정</Link>,
        icon: <EditOutlined />,
      },
      {
        key: 'password-change',
        label: <Link to="/hq/password-change">비밀번호 변경</Link>,
        icon: <KeyOutlined />,
      },
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
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            position: 'sticky',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/hq">예약</Link>
          <Flex align="center" gap={'24px'}>
            <Typography.Text style={{ color: '#ffffff' }}>
              {/*{admin.adminName.slice(0, -1) + '*'}*/}
            </Typography.Text>
            <BellOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            <Dropdown
              trigger={['click']}
              menu={avatarMenuItems}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <UserOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </Dropdown>
          </Flex>
        </Header>
        <Layout>
          <Sider
            style={{
              position: 'sticky',
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
