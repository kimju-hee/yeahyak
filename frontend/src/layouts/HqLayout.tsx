import {
  ApartmentOutlined,
  BarcodeOutlined,
  BellOutlined,
  EditOutlined,
  KeyOutlined,
  LogoutOutlined,
  MinusSquareOutlined,
  MoneyCollectOutlined,
  NotificationOutlined,
  PlusSquareOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Flex, Layout, Menu, Typography, type MenuProps } from 'antd';
import { useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { logo } from '../assets';
import { Chatbot } from '../components';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLE, type Admin, type User } from '../types';
import Footer from './Footer';
const { Sider, Header, Content } = Layout;

// 사이드 메뉴 아이템
const siderMenuItems: MenuProps['items'] = [
  {
    key: 'notices',
    label: <Link to="/hq/notices">공지사항</Link>,
    icon: <NotificationOutlined />,
  },
  {
    key: 'branches',
    label: '가맹점 관리',
    icon: <ApartmentOutlined />,
    children: [
      {
        key: 'requests',
        label: <Link to="/hq/branches">등록 요청 관리</Link>,
        icon: <SafetyCertificateOutlined />,
      },
      {
        key: 'credits',
        label: <Link to="/hq/credits">정산 관리</Link>,
        icon: <MoneyCollectOutlined />,
      },
    ],
  },
  {
    key: 'orders',
    label: <Link to="/hq/orders">발주 요청 관리</Link>,
    icon: <PlusSquareOutlined />,
  },
  {
    key: 'returns',
    label: <Link to="/hq/returns">반품 요청 관리</Link>,
    icon: <MinusSquareOutlined />,
  },
  {
    key: 'products',
    label: <Link to="/hq/products">제품 목록</Link>,
    icon: <ProductOutlined />,
  },
  {
    key: 'inventory',
    label: <Link to="/hq/inventory">재고 관리</Link>,
    icon: <BarcodeOutlined />,
  },
];

export default function HqLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const user = useAuthStore((state) => state.user) as User;
  const profile = useAuthStore((state) => state.profile);
  const admin = user.role === USER_ROLE.ADMIN ? (profile as Admin) : null;

  const handleLogoClick = () => {
    setSelectedKeys([]); // 로고 클릭 시 선택 해제
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
        <Link to="/hq" onClick={handleLogoClick}>
          <img src={logo} alt="로고" style={{ height: 28, marginLeft: 18 }} />
        </Link>
        <Flex align="center" gap={24}>
          <Typography.Text style={{ color: '#ffffff' }}>
            {admin?.adminName.slice(0, -1) + '*'}
          </Typography.Text>
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
          />
        </Sider>
        <Layout>
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
    </Layout>
  );
}
