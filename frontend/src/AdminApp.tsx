import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import TracksPage from "./pages/admin/TracksPage";
import DocsPage from "./pages/admin/DocsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotFound from "./pages/NotFound";

function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tracks" element={<TracksPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default AdminApp;
