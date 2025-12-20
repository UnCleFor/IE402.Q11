import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes/index';
import DefaultComponent from './components/DefaultComponent/DefaultComponent';
import { AuthProvider } from './contexts/AuthContext';
import { TokenAlertProvider, useTokenAlert } from './contexts/TokenAlertContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import TokenAlertModal from './components/TokenAlertModal/TokenAlertModal';
import authService from './services/authService';

// Component để khởi động monitoring token
const TokenMonitor = () => {
  const { startTokenMonitoring } = useTokenAlert();

  useEffect(() => {
    const cleanup = startTokenMonitoring();
    return cleanup;
  }, [startTokenMonitoring]);

  return null;
};

function App() {
  // Xử lý khởi tạo token
  useEffect(() => {
    // 1. Khởi tạo token từ localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const currentTime = Date.now();

        if (currentTime < expiry) {
          authService.setToken(token);
        } else {
          authService.removeToken();
          localStorage.removeItem('user');
        }
      } catch (error) {
        authService.removeToken();
        localStorage.removeItem('user');
      }
    } else {
    }
  }, []);

  return (
    <AuthProvider>
      <TokenAlertProvider>
        <Router>
          {/* Thêm TokenMonitor - sẽ tự động bắt đầu monitoring khi có token */}
          <TokenMonitor />

          <Routes>
            {routes.map((route) => {
              const Page = route.page;
              const Layout = route.isShowHeader ? DefaultComponent : Fragment;

              const layoutProps = route.isShowHeader ? {
                isShowFooter: route.isShowFooter !== false
              } : {};

              if (route.isPublic) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Layout {...layoutProps}>
                        <Page />
                      </Layout>
                    }
                  />
                );
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute requiredRole={route.requiredRole}>
                      <Layout {...layoutProps}>
                        <Page />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              );
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Thêm TokenAlertModal để hiển thị thông báo */}
          <TokenAlertModal />
        </Router>
      </TokenAlertProvider>
    </AuthProvider>
  );
}

export default App;