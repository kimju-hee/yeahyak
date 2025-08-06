import { Navigate, Route, Routes } from 'react-router-dom';

import BranchLayout from './layouts/BranchLayout';
import HqLayout from './layouts/HqLayout';
import PublicLayout from './layouts/PublicLayout';
import BranchDashboardPage from './pages/branch/BranchDashboardPage';
import BranchProfileEditPage from './pages/branch/BranchProfileEditPage';
import OrderRequestPage from './pages/branch/OrderRequestPage';
import ReturnRequestPage from './pages/branch/ReturnRequestPage';
import HqRegisterPage from './pages/common/auth/HqRegisterPage';
import LoginPage from './pages/common/auth/LoginPage';
import LogoutPage from './pages/common/auth/LogoutPage';
import PasswordChangePage from './pages/common/auth/PasswordChangePage';
import RegisterPage from './pages/common/auth/RegisterPage';
import ForbiddenPage from './pages/common/error/ForbiddenPage';
import NotFoundPage from './pages/common/error/NotFoundPage';
import ServerErrorPage from './pages/common/error/ServerErrorPage';
import NoticeDetailPage from './pages/common/notice/NoticeDetailPage';
import NoticeListPage from './pages/common/notice/NoticeListPage';
import ProductDetailPage from './pages/common/product/ProductDetailPage';
import ProductListPage from './pages/common/product/ProductListPage';
import BranchManagementPage from './pages/hq/BranchManagementPage';
import BranchMonitoringPage from './pages/hq/BranchMonitoringPage';
import DemandForecastPage from './pages/hq/DemandForecastPage';
import HqDashboardPage from './pages/hq/HqDashboardPage';
import HqNoticeEditPage from './pages/hq/HqNoticeEditPage';
import HqNoticeRegisterPage from './pages/hq/HqNoticeRegisterPage';
import HqProductEditPage from './pages/hq/HqProductEditPage';
import HqProductRegisterPage from './pages/hq/HqProductRegisterPage';
import HqProfileEditPage from './pages/hq/HqProfileEditPage';
import HqStockPage from './pages/hq/HqStockPage';
import OrderManagementPage from './pages/hq/OrderManagementPage';
import ReturnManagementPage from './pages/hq/ReturnManagementPage';

export default function App() {
  return (
    <Routes>
      {/* 공통 */}
      <Route path="/" element={<PublicLayout />}>
        {/* 기본 접근 시 로그인 페이지로 리다이렉트*/}
        <Route index element={<Navigate to="/login" replace />} />
        {/* 인증 */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="hq-register" element={<HqRegisterPage />} />
        <Route path="logout" element={<LogoutPage />} />
        {/* 에러 */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="500" element={<ServerErrorPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>

      {/* 본사 */}
      {/*<Route element={<ProtectedRoute allowedRoles={['HQ']} />}>*/}
      <Route path="/hq" element={<HqLayout />}>
        <Route index element={<HqDashboardPage />} />
        <Route path="profile-edit" element={<HqProfileEditPage />} />
        <Route path="password-change" element={<PasswordChangePage />} />
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
      {/* </Route> */}

      {/* 가맹점 */}
      {/*<Route element={<ProtectedRoute allowedRoles={['BRANCH']} />}>*/}
      <Route path="/branch" element={<BranchLayout />}>
        <Route index element={<BranchDashboardPage />} />
        <Route path="password-change" element={<PasswordChangePage />} />
        <Route path="profile-edit" element={<BranchProfileEditPage />} />
        <Route path="notices" element={<NoticeListPage />} />
        <Route path="notices/:id" element={<NoticeDetailPage />} />
        <Route path="order-request" element={<OrderRequestPage />} />
        <Route path="return-request" element={<ReturnRequestPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
      </Route>
      {/* </Route> */}
    </Routes>
  );
}
