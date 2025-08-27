import { Divider, Layout, message, Typography } from 'antd';
import DOMPurify from 'dompurify';
import { useLocation } from 'react-router-dom';

import privacyHtml from '../assets/privacy.html?raw';
import termsHtml from '../assets/terms.html?raw';

export default function Footer() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const openHtmlInNewWindow = (html: string) => {
    const sanitizedHtml = DOMPurify.sanitize(html);
    const bom = '\uFEFF';
    const blob = new Blob([bom + sanitizedHtml], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(
      url,
      '_blank',
      'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes',
    );

    if (newWindow && 'addEventListener' in newWindow) {
      newWindow.addEventListener('beforeunload', () => URL.revokeObjectURL(url), { once: true });
    } else {
      URL.revokeObjectURL(url);
      message.warning('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  return (
    <Layout.Footer
      style={{
        textAlign: 'center',
        backgroundColor: isLoginPage ? 'transparent' : undefined,
        borderTop: isLoginPage ? 'none' : undefined,
      }}
    >
      <Typography.Text style={{ color: '#000000E0' }}>© 2025 Team yeahyak</Typography.Text>
      <Divider type="vertical" />
      <Typography.Link
        onClick={() => openHtmlInNewWindow(termsHtml)}
        style={{ color: '#000000E0' }}
      >
        이용약관
      </Typography.Link>
      <Divider type="vertical" />
      <Typography.Link
        onClick={() => openHtmlInNewWindow(privacyHtml)}
        style={{ color: '#000000E0' }}
      >
        개인정보처리방침
      </Typography.Link>
    </Layout.Footer>
  );
}
