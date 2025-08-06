import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
const { Content, Footer } = Layout;

export default function PublicLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '48px',
          padding: '48px',
        }}
      >
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>© 2025 Team yeahyak</Footer>
    </Layout>
  );
}
