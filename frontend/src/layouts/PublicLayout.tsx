import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';

export default function PublicLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Layout
      style={{
        minHeight: '100vh',
        minWidth: '1024px',
        backgroundColor: isLoginPage ? 'transparent' : undefined,
        transition: 'background-color 0.3s ease',
        overflow: isLoginPage ? 'auto' : 'hidden', // LoginPage에서는 스크롤 허용
      }}
    >
      <Layout.Content
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isLoginPage ? 'transparent' : undefined,
          transition: 'background-color 0.3s ease',
          padding: isLoginPage ? '0' : '48px 24px 24px 24px',
          margin: isLoginPage ? '0' : '48px 24px 24px 24px',
        }}
      >
        <Outlet />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
