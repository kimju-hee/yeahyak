import { Layout } from 'antd';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { background02, background03 } from '../assets';
import Footer from './Footer';

export default function PublicLayout() {
  // 배경 이미지 후보 배열
  const backgroundImages = [background02, background03];

  // 랜덤하게 배경 이미지 선택 (컴포넌트 마운트 시 한 번만)
  const randomBackground = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
  }, []);

  return (
    <Layout
      style={{
        position: 'relative',
        minHeight: '100vh',
        minWidth: '100%',
        backgroundImage: `url(${randomBackground})`,
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
          padding: '70px 70px 140px 70px',
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
