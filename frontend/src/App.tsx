import { ConfigProvider } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import BranchLayout from './layouts/BranchLayout';
import HqLayout from './layouts/HqLayout';
import LoginLayout from './layouts/LoginLayout';
import PublicLayout from './layouts/PublicLayout';
import BranchDashboardPage from './pages/Branch/BranchDashboardPage';
import BranchProfileEditPage from './pages/Branch/BranchProfileEditPage';
import OrderRequestPage from './pages/Branch/OrderRequestPage';
import ReturnRequestPage from './pages/Branch/ReturnRequestPage';
import BranchSignupPage from './pages/Common/Auth/BranchSignupPage';
import HqSignupPage from './pages/Common/Auth/HqSignupPage';
import LoginPage from './pages/Common/Auth/LoginPage';
import LogoutPage from './pages/Common/Auth/LogoutPage';
import PasswordChangePage from './pages/Common/Auth/PasswordChangePage';
import ForbiddenPage from './pages/Common/Error/ForbiddenPage';
import NotFoundPage from './pages/Common/Error/NotFoundPage';
import ServerErrorPage from './pages/Common/Error/ServerErrorPage';
import NoticeDetailPage from './pages/Common/Notice/NoticeDetailPage';
import NoticeListPage from './pages/Common/Notice/NoticeListPage';
import ProductDetailPage from './pages/Common/Product/ProductDetailPage';
import ProductListPage from './pages/Common/Product/ProductListPage';
import BranchManagementPage from './pages/HQ/BranchManagementPage';
import CreditManagementPage from './pages/HQ/CreditManagementPage';
import HqDashboardPage from './pages/HQ/HqDashboardPage';
import HqProfileEditPage from './pages/HQ/HqProfileEditPage';
import NoticeEditPage from './pages/HQ/NoticeEditPage';
import NoticeRegisterPage from './pages/HQ/NoticeRegisterPage';
import OrderManagementPage from './pages/HQ/OrderManagementPage';
import ProductEditPage from './pages/HQ/ProductEditPage';
import ProductRegisterPage from './pages/HQ/ProductRegisterPage';
import ReturnManagementPage from './pages/HQ/ReturnManagementPage';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 16, // 기본보다 크게
          fontSizeHeading1: 36, // 기본보다 작게
          fontSizeHeading2: 30, // 기본
          fontSizeHeading3: 26, // 기본보다 크게
          fontSizeHeading4: 24, // 기본보다 크게
        },
        components: {
          Layout: {
            headerPadding: '0 36px', // 헤더 padding (default 0 50px)
          },
          Menu: {
            itemHeight: 48,
            itemBorderRadius: 16, // 메뉴 아이템 모서리 둥글게
          },
          Dropdown: {
            paddingBlock: 8, // 드롭다운 수직 padding (default 5)
          },
          Input: {
            inputFontSize: 16,
            inputFontSizeLG: 18,
            inputFontSizeSM: 14,
          },
          InputNumber: {
            inputFontSize: 16,
            inputFontSizeLG: 18,
            inputFontSizeSM: 14,
          },
          Select: {
            optionFontSize: 16,
          },
          Button: {
            contentFontSize: 16,
            contentFontSizeLG: 18,
            contentFontSizeSM: 14,
          },
          Result: {
            titleFontSize: 30,
            subtitleFontSize: 18,
          },
        },
      }}
    >
      <Routes>
        {/* 로그인 */}
        <Route path="/" element={<LoginLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
        {/* 공통 */}
        <Route path="/" element={<PublicLayout />}>
          <Route path="signup-branch" element={<BranchSignupPage />} />
          <Route path="signup-hq" element={<HqSignupPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="403" element={<ForbiddenPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="500" element={<ServerErrorPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
        {/* 가맹점 */}
        {/* <Route element={<ProtectedRoute allowedRoles={['PHARMACY']} />}> */}
        <Route path="/branch" element={<BranchLayout />}>
          <Route index element={<BranchDashboardPage />} />
          <Route path="password-change" element={<PasswordChangePage />} />
          <Route path="profile-edit" element={<BranchProfileEditPage />} />
          <Route path="notices" element={<NoticeListPage />} />
          <Route path="notices/:id" element={<NoticeDetailPage />} />
          <Route path="orders" element={<OrderRequestPage />} />
          <Route path="returns" element={<ReturnRequestPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
        </Route>
        {/* 본사 */}
        {/* <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}> */}
        <Route path="/hq" element={<HqLayout />}>
          <Route index element={<HqDashboardPage />} />
          <Route path="password-change" element={<PasswordChangePage />} />
          <Route path="profile-edit" element={<HqProfileEditPage />} />
          <Route path="notices" element={<NoticeListPage />} />
          <Route path="notices/:id" element={<NoticeDetailPage />} />
          <Route path="notices/new" element={<NoticeRegisterPage />} />
          <Route path="notices/:id/edit" element={<NoticeEditPage />} />
          <Route path="branches" element={<BranchManagementPage />} />
          <Route path="credits" element={<CreditManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="returns" element={<ReturnManagementPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/new" element={<ProductRegisterPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          {/* <Route path="inventory" element={<HqInventoryPage />} /> */}
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

// export default function App() {
//   return (
//       <Route path="/hq" element={<HqLayout />}>
//         <Route path="monitoring" element={<BranchMonitoringPage />} />
//         <Route path="forecast" element={<DemandForecastPage />} />
//       </Route>
//     </Routes>
//   );
// }
