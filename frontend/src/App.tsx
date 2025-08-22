import { Navigate, Route, Routes } from 'react-router-dom';
import BranchLayout from './layouts/BranchLayout';
import HqLayout from './layouts/HqLayout';
import PublicLayout from './layouts/PublicLayout';
import BranchDashboardPage from './pages/Branch/BranchDashboardPage';
import BranchProfileEditPage from './pages/Branch/BranchProfileEditPage';
import OrderRequestPage from './pages/Branch/OrderRequestPage';
import ReturnRequestPage from './pages/Branch/ReturnRequestPage';
import AnnouncementDetailPage from './pages/Common/Announcement/AnnouncementDetailPage';
import AnnouncementListPage from './pages/Common/Announcement/AnnouncementListPage';
import BranchSignupPage from './pages/Common/Auth/BranchSignupPage';
import HqSignupPage from './pages/Common/Auth/HqSignupPage';
import LoginPage from './pages/Common/Auth/LoginPage';
import LogoutPage from './pages/Common/Auth/LogoutPage';
import PasswordChangePage from './pages/Common/Auth/PasswordChangePage';
import ForbiddenPage from './pages/Common/Error/ForbiddenPage';
import NotFoundPage from './pages/Common/Error/NotFoundPage';
import ServerErrorPage from './pages/Common/Error/ServerErrorPage';
import ProductDetailPage from './pages/Common/Product/ProductDetailPage';
import ProductListPage from './pages/Common/Product/ProductListPage';
import AnnouncementEditPage from './pages/HQ/AnnouncementEditPage';
import AnnouncementRegisterPage from './pages/HQ/AnnouncementRegisterPage';
import BranchManagementPage from './pages/HQ/BranchManagementPage';
import CreditManagementPage from './pages/HQ/CreditManagementPage';
import HqDashboardPage from './pages/HQ/HqDashboardPage';
import HqProfileEditPage from './pages/HQ/HqProfileEditPage';
import OrderManagementPage from './pages/HQ/OrderManagementPage';
import ProductEditPage from './pages/HQ/ProductEditPage';
import ProductRegisterPage from './pages/HQ/ProductRegisterPage';
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
        <Route path="signup-branch" element={<BranchSignupPage />} />
        <Route path="signup-hq" element={<HqSignupPage />} />
        <Route path="logout" element={<LogoutPage />} />
        {/* 에러 */}
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="500" element={<ServerErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
      {/* 가맹점 */}
      {/*<Route element={<ProtectedRoute allowedRoles={['BRANCH']} />}>*/}
      <Route path="/branch" element={<BranchLayout />}>
        <Route index element={<BranchDashboardPage />} />
        <Route path="password-change" element={<PasswordChangePage />} />
        <Route path="profile-edit" element={<BranchProfileEditPage />} />
        <Route path="announcements" element={<AnnouncementListPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="orders" element={<OrderRequestPage />} />
        <Route path="returns" element={<ReturnRequestPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
      </Route>
      {/* 본사 */}
      {/*<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>*/}
      <Route path="/hq" element={<HqLayout />}>
        <Route index element={<HqDashboardPage />} />
        <Route path="password-change" element={<PasswordChangePage />} />
        <Route path="profile-edit" element={<HqProfileEditPage />} />
        <Route path="announcements" element={<AnnouncementListPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="announcements/new" element={<AnnouncementRegisterPage />} />
        <Route path="announcements/:id/edit" element={<AnnouncementEditPage />} />
        <Route path="branches" element={<BranchManagementPage />} />
        <Route path="credits" element={<CreditManagementPage />} />
        <Route path="orders" element={<OrderManagementPage />} />
        <Route path="returns" element={<ReturnManagementPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/new" element={<ProductRegisterPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
      </Route>
    </Routes>
  );
}

// export default function App() {
//   return (
//       {/* 본사 */}
//       <Route path="/hq" element={<HqLayout />}>
//         <Route path="monitoring" element={<BranchMonitoringPage />} />
//         <Route path="forecast" element={<DemandForecastPage />} />
//         <Route path="stock" element={<HqStockPage />} />
//       </Route>
//     </Routes>
//   );
// }