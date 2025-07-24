import { Button, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

const HomePage = () => (
  <div>
    <h1>환영합니다! 약국 관리 시스템</h1>
    <p>여기는 메인 페이지입니다.</p>
    <nav>
      <ul>
        <li><Link to="/dashboard">대시보드</Link></li>
        <li><Link to="/inventory">재고 관리</Link></li>
        <li><Link to="/orders">발주 관리</Link></li>
      </ul>
    </nav>
    <br />
    {/* Ant Design 버튼 추가 */}
    <Space> {/* Ant Design 컴포넌트 간 간격을 위한 Space 컴포넌트 */}
      <Button type="primary">기본 버튼</Button>
      <Button>보조 버튼</Button>
      <Button type="dashed">점선 버튼</Button>
      <Button type="link">링크 버튼</Button>
    </Space>
    <br /><br />
    {/* Ant Design 입력 필드 추가 */}
    <Input placeholder="이름을 입력하세요" style={{ width: 200 }} />
    <br /><br />
    <Typography.Text type="success">Ant Design 텍스트 예시입니다.</Typography.Text>
  </div>
);

const DashboardPage = () => <h2>대시보드 페이지</h2>;
const InventoryPage = () => <h2>재고 관리 페이지</h2>;
const OrdersPage = () => <h2>발주 관리 페이지</h2>;
const NotFoundPage = () => <h2>페이지를 찾을 수 없습니다 (404)</h2>;

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* <--- 여기부터 라우팅 설정 시작 */}
      <hr /> {/* 구분선 */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<NotFoundPage />} /> {/* 일치하는 경로가 없을 때 */}
      </Routes>
      {/* <--- 라우팅 설정 끝 */}
    </>
  )
}

export default App
