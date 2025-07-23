import { Navigate, Route, Routes } from 'react-router-dom';

import BranchLayout from './layouts/BranchLayout';
import HqLayout from './layouts/HqLayout';
import PublicLayout from './layouts/PublicLayout';
import BranchDashboardPage from './pages/Branch/BranchDashboardPage';
import BranchProfileEditPage from './pages/Branch/BranchProfileEditPage';
import BranchStockPage from './pages/Branch/BranchStockPage';
import OrderRequestPage from './pages/Branch/OrderRequestPage';
import ReturnRequestPage from './pages/Branch/ReturnRequestPage';
import AdminLoginPage from './pages/Common/Auth/AdminLoginPage';
import AdminRegisterPage from './pages/Common/Auth/AdminRegisterPage';
import LoginPage from './pages/Common/Auth/LoginPage';
import LogoutPage from './pages/Common/Auth/LogoutPage';
import RegisterPage from './pages/Common/Auth/RegisterPage';
import ForbiddenPage from './pages/Common/Error/ForbiddenPage';
import NotFoundPage from './pages/Common/Error/NotFoundPage';
import ServerErrorPage from './pages/Common/Error/ServerErrorPage';
import NoticeDetailPage from './pages/Common/Notice/NoticeDetailPage';
import NoticeListPage from './pages/Common/Notice/NoticeListPage';
import ProductDetailPage from './pages/Common/Product/ProductDetailPage';
import ProductListPage from './pages/Common/Product/ProductListPage';
import BranchManagementPage from './pages/HQ/BranchManagementPage';
import BranchMonitoringPage from './pages/HQ/BranchMonitoringPage';
import DemandForecastPage from './pages/HQ/DemandForecastPage';
import HqDashboardPage from './pages/HQ/HqDashboardPage';
import HqNoticeEditPage from './pages/HQ/HqNoticeEditPage';
import HqNoticeRegisterPage from './pages/HQ/HqNoticeRegisterPage';
import HqProductEditPage from './pages/HQ/HqProductEditPage';
import HqProductRegisterPage from './pages/HQ/HqProductRegisterPage';
import HqStockPage from './pages/HQ/HqStockPage';
import OrderManagementPage from './pages/HQ/OrderManagementPage';
import ReturnManagementPage from './pages/HQ/ReturnManagementPage';

export default function App() {
  return (
    <Routes>
      {/* 공통 */}
      <Route path="/" element={<PublicLayout />}>
        {/* 기본 접근 시 로그인 페이지로 리다이렉트*/}
        <Route index element={<Navigate to="/login" replace />} />
        {/* 인증 */}
        <Route path="login" element={<LoginPage />} />
        <Route path="admin-login" element={<AdminLoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="admin-register" element={<AdminRegisterPage />} />
        <Route path="logout" element={<LogoutPage />} />
        {/* 에러 */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 본사 */}
      <Route path="/hq" element={<HqLayout />}>
        <Route index element={<HqDashboardPage />} />
        <Route path="notices" element={<NoticeListPage />} />
        <Route path="notices/:id" element={<NoticeDetailPage />} />
        <Route path="notices/new" element={<HqNoticeRegisterPage />} />
        <Route path="notices/:id/edit" element={<HqNoticeEditPage />} />
        <Route path="branches" element={<BranchManagementPage />} />
        <Route path="orders" element={<OrderManagementPage />} />
        <Route path="returns" element={<ReturnManagementPage />} />
        <Route path="monitoring" element={<BranchMonitoringPage />} />
        <Route path="forecast" element={<DemandForecastPage />} />
        <Route path="stock" element={<HqStockPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/new" element={<HqProductRegisterPage />} />
        <Route path="products/:id/edit" element={<HqProductEditPage />} />
      </Route>

      {/* 가맹점 */}
      <Route path="/branch" element={<BranchLayout />}>
        <Route index element={<BranchDashboardPage />} />
        <Route path="profile-edit" element={<BranchProfileEditPage />} />
        <Route path="notices" element={<NoticeListPage />} />
        <Route path="notices/:id" element={<NoticeDetailPage />} />
        <Route path="order-request" element={<OrderRequestPage />} />
        <Route path="return-request" element={<ReturnRequestPage />} />
        <Route path="stock" element={<BranchStockPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
      </Route>
    </Routes>
  );
}
