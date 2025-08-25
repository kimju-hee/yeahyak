import {
  ApartmentOutlined,
  BellOutlined,
  EditOutlined,
  KeyOutlined,
  LogoutOutlined,
  MinusSquareFilled,
  MoneyCollectOutlined,
  NotificationFilled,
  PlusSquareFilled,
  ProductFilled,
  TagsFilled,
  UserOutlined,
} from '@ant-design/icons';
import { ConfigProvider, Dropdown, Flex, Layout, Menu, Typography } from 'antd';
import { useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { logo } from '../assets';
import Chatbot from '../components/Chatbot';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLE, type Admin, type User } from '../types';
import Footer from './Footer';
const { Sider, Header, Content } = Layout;

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
    label: <Link to="/hq/announcements">공지사항</Link>,
    icon: <NotificationFilled />,
  },
  {
    key: 'branches',
    label: <Link to="/hq/branches">가맹점 관리</Link>,
    icon: <ApartmentOutlined />,
  },
  {
    key: 'credits',
    label: <Link to="/hq/credits">정산 관리</Link>,
    icon: <MoneyCollectOutlined />,
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
    key: 'products',
    label: <Link to="/hq/products">제품 목록</Link>,
    icon: <TagsFilled />,
  },
  {
    key: 'stock',
    label: <Link to="/hq/stock">재고 관리</Link>,
    icon: <ProductFilled />,
  },
];

export default function HqLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile);
  const admin = user.role === USER_ROLE.ADMIN ? (profile as Admin) : null;

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
        label: <Link to="/logout">로그아웃</Link>,
        icon: <LogoutOutlined />,
        danger: true,
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

  const contentRef = useRef<HTMLDivElement>(null);

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
          <Link to="/hq">
            <img src={logo} alt="로고" style={{ height: '32px' }} />
          </Link>
          <Flex align="center" gap={'24px'}>
            <Typography.Text style={{ color: '#ffffff' }}>
              {admin?.adminName.slice(0, -1) + '*'}
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
            <div
              ref={contentRef}
              style={{
                position: 'relative',
                flex: 1,
                minHeight: 0,
                padding: '24px',
                margin: '24px',
              }}
            >
              <Content>
                <Outlet />
              </Content>
              <Chatbot boundsRef={contentRef} />
            </div>
            <Footer />
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
