import { Layout } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { landing01, landing02, landing03, landing04 } from '../assets';
import Footer from './Footer';

export default function LoginLayout() {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // 배경 이미지 배열
  const backgroundImages = [landing01, landing02, landing03, landing04];

  // 배경 이미지 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIdx((prevIdx) => (prevIdx + 1) % backgroundImages.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <Layout
      style={{
        position: 'relative',
        minHeight: '100vh',
        minWidth: '1080px',
        backgroundImage: `url(${backgroundImages[currentImgIdx]})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.1s ease-in-out',
      }}
    >
      <Layout.Content
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: '0',
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
