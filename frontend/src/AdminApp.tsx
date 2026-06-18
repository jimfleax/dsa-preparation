import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import TracksPage from "./pages/admin/TracksPage";
import DocsPage from "./pages/admin/DocsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";

function AdminApp() {
  return (
    <AdminAuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="tracks" element={<TracksPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AdminAuthProvider>
  );
}

export default AdminApp;
