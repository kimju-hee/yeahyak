import { Divider, Layout, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
const { Content, Footer } = Layout;

export default function PublicLayout() {
  const openTermsWindow = () => {
    window.open('/terms.html', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const openPrivacyWindow = () => {
    window.open('/privacy.html', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

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
      <Footer style={{ textAlign: 'center' }}>
        © 2025 Team yeahyak
        <Divider type="vertical" />
        <Typography.Link onClick={openTermsWindow} style={{ color: '#000000' }}>
          이용약관
        </Typography.Link>
        <Divider type="vertical" />
        <Typography.Link onClick={openPrivacyWindow} style={{ color: '#000000' }}>
          개인정보처리방침
        </Typography.Link>
      </Footer>
    </Layout>
  );
}
