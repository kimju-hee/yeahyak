import {
  BellOutlined,
  CheckCircleTwoTone,
  FrownFilled,
  KeyOutlined,
  LogoutOutlined,
  MinusCircleTwoTone,
  NotificationFilled,
  ProductFilled,
  ShopOutlined,
  ShoppingFilled,
  UserOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Dropdown, Flex, Layout, Menu, message, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Pharmacy } from '../mocks/types';
import { useAuthStore } from '../stores/authStore';

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
    label: <Link to="/branch/notices">공지사항</Link>,
    icon: <NotificationFilled />,
  },
  {
    key: 'stock',
    label: <Link to="/branch/stock">재고 관리</Link>,
    icon: <ProductFilled />,
  },
  {
    key: 'order-request',
    label: <Link to="/branch/order-request">발주 요청</Link>,
    icon: <ShoppingFilled />,
  },
  {
    key: 'return-request',
    label: <Link to="/branch/return-request">반품 요청</Link>,
    icon: <FrownFilled />,
  },
];

export default function BranchLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const pharmacy = profile as Pharmacy;
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
        label: <Link to="/branch/profile-edit">약국 정보 수정</Link>,
        icon: <ShopOutlined />,
      },
      {
        key: 'password-change',
        label: <Link to="/branch/password-change">비밀번호 변경</Link>,
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
          <Link to="/branch">예약</Link>
          <Flex align="center" gap={'24px'}>
            <Flex>
              <Typography.Text style={{ color: '#ffffff' }}>
                {/*{pharmacy.pharmacyName}*/}
              </Typography.Text>
              {/*pharmacy.status === 'APPROVED'*/}
              {true ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />
              ) : (
                <MinusCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: '16px' }} />
              )}
            </Flex>
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
