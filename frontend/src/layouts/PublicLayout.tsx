import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { landingbg } from '../assets';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <Layout
      style={{
        position: 'relative',
        minHeight: '100vh',
        minWidth: '100%',
        backgroundImage: `url(${landingbg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Layout.Content
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 24px 94px 24px',
        }}
      >
        <Outlet />
      </Layout.Content>

      {/* Footer를 배경 이미지 위에 올림 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Footer color="#ffffff" />
      </div>
    </Layout>
  );
}
