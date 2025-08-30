import {
  BellOutlined,
  FrownFilled,
  KeyOutlined,
  LogoutOutlined,
  NotificationFilled,
  ShopOutlined,
  ShoppingFilled,
  TagsFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Flex, Layout, Menu, Typography } from 'antd';
import { useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { logo } from '../assets';
import Chatbot from '../components/Chatbot';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLE, type Pharmacy, type User } from '../types';
import Footer from './Footer';
const { Sider, Header, Content } = Layout;

// 사이드 메뉴 아이템
const siderMenuItems = [
  {
    key: 'notices',
    label: <Link to="/branch/notices">공지사항</Link>,
    icon: <NotificationFilled />,
  },
  {
    key: 'products',
    label: <Link to="/branch/products">제품 목록</Link>,
    icon: <TagsFilled />,
  },
  {
    key: 'order-request',
    label: <Link to="/branch/orders">발주 요청</Link>,
    icon: <ShoppingFilled />,
  },
  {
    key: 'return-request',
    label: <Link to="/branch/returns">반품 요청</Link>,
    icon: <FrownFilled />,
  },
];

export default function BranchLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile);
  const pharmacy = user.role === USER_ROLE.PHARMACY ? (profile as Pharmacy) : null;

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
        <Link to="/branch">
          <img src={logo} alt="로고" style={{ height: '32px' }} />
        </Link>
        <Flex align="center" gap={'24px'}>
          <Typography.Text style={{ color: '#ffffff' }}>{pharmacy?.pharmacyName}</Typography.Text>
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
          <Footer color="#262626" />
        </Layout>
      </Layout>
    </Layout>
  );
}
