import { Divider, Layout, Typography } from 'antd';
import DOMPurify from 'dompurify';
import { Outlet } from 'react-router-dom';

// HTML 파일들을 텍스트로 import
import privacyHtml from '../assets/privacy.html?raw';
import termsHtml from '../assets/terms.html?raw';

const { Content, Footer } = Layout;

export default function PublicLayout() {
  const openTermsWindow = () => {
    const sanitizedHtml = DOMPurify.sanitize(termsHtml);
    // UTF-8 BOM 추가하여 인코딩 확실히 처리
    const bom = '\uFEFF';
    const blob = new Blob([bom + sanitizedHtml], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(
      url,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes',
    );

    // 메모리 정리를 위해 URL 해제 (창이 닫힐 때)
    if (newWindow) {
      newWindow.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    }
  };

  const openPrivacyWindow = () => {
    const sanitizedHtml = DOMPurify.sanitize(privacyHtml);
    // UTF-8 BOM 추가하여 인코딩 확실히 처리
    const bom = '\uFEFF';
    const blob = new Blob([bom + sanitizedHtml], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(
      url,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes',
    );

    // 메모리 정리를 위해 URL 해제 (창이 닫힐 때)
    if (newWindow) {
      newWindow.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    }
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
