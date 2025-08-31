import {
  BellOutlined,
  KeyOutlined,
  LogoutOutlined,
  NotificationOutlined,
  ProductOutlined,
  RollbackOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Flex, Layout, Menu, Typography, type MenuProps } from 'antd';
import { useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { logo } from '../assets';
import { Chatbot } from '../components';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLE, type Pharmacy, type User } from '../types';
import Footer from './Footer';
const { Sider, Header, Content } = Layout;

// 사이드 메뉴 아이템
const siderMenuItems: MenuProps['items'] = [
  {
    label: <Link to="/branch/notices">공지사항</Link>,
    key: 'notices',
    icon: <NotificationOutlined />,
  },
  {
    label: <Link to="/branch/products">제품 목록</Link>,
    key: 'products',
    icon: <ProductOutlined />,
  },
  {
    label: <Link to="/branch/orders">발주 요청</Link>,
    key: 'orders',
    icon: <ShoppingCartOutlined />,
  },
  {
    label: <Link to="/branch/returns">반품 요청</Link>,
    key: 'returns',
    icon: <RollbackOutlined />,
  },
];

export default function BranchLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile);
  const pharmacy = user.role === USER_ROLE.PHARMACY ? (profile as Pharmacy) : null;

  const handleLogoClick = () => {
    setSelectedKeys([]); // 로고 클릭 시 선택 해제
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
        label: <Link to="/logout">로그아웃</Link>,
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/branch" onClick={handleLogoClick}>
          <img src={logo} alt="로고" style={{ height: 28, marginLeft: 18 }} />
        </Link>
        <Flex align="center" gap={24}>
          <Typography.Text style={{ color: '#ffffff' }}>{pharmacy?.pharmacyName}</Typography.Text>
          <BellOutlined style={{ fontSize: 24, color: '#ffffff' }} />
          <Dropdown
            trigger={['click']}
            menu={avatarMenuItems}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
          >
            <UserOutlined style={{ fontSize: 24, color: '#ffffff' }} />
          </Dropdown>
        </Flex>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
          }}
          width={232}
        >
          <Menu
            theme="dark"
            mode="inline"
            items={siderMenuItems}
            selectedKeys={selectedKeys}
            onSelect={({ selectedKeys }) => setSelectedKeys(selectedKeys)}
            style={{ margin: '16px 0' }}
          />
        </Sider>

        <Layout>
          <div
            ref={contentRef}
            style={{
              position: 'relative',
              flex: 1,
              minHeight: 0,
              padding: 24,
              margin: 24,
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
