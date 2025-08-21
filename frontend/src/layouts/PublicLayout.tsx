import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Outlet />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
