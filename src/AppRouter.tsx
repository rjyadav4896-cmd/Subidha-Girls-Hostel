import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import { AdminLoginPage } from './hms/pages/admin/AdminLoginPage';
import { AdminLayout } from './hms/pages/admin/AdminLayout';
import { AdminApplicationsPage } from './hms/pages/admin/AdminApplicationsPage';
import { AdminStudentsPage } from './hms/pages/admin/AdminStudentsPage';
import { AdminLeavePage } from './hms/pages/admin/AdminLeavePage';
import { AdminSettingsPage } from './hms/pages/admin/AdminSettingsPage';
import { AdminPaymentsPage } from './hms/pages/admin/AdminPaymentsPage';
import { StudentLoginPage } from './hms/pages/student/StudentLoginPage';
import { StudentDashboardPage } from './hms/pages/student/StudentDashboardPage';
import { RequireAdmin, RequireStudent } from './hms/routes/RequireAuth';
import { PaymentVerifyPage } from './hms/pages/payment/PaymentVerifyPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="applications" replace />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="leave" element={<AdminLeavePage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="/student/login" element={<StudentLoginPage />} />
        <Route
          path="/student"
          element={
            <RequireStudent>
              <StudentDashboardPage />
            </RequireStudent>
          }
        />
        <Route path="/payment/verify" element={<PaymentVerifyPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
