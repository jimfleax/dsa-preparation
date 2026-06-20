import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const TracksPage = lazy(() => import("./pages/admin/TracksPage"));
const DocsPage = lazy(() => import("./pages/admin/DocsPage"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));

function AdminLoading() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
}

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
          <Route 
            index 
            element={
              <Suspense fallback={<AdminLoading />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="users" 
            element={
              <Suspense fallback={<AdminLoading />}>
                <UsersPage />
              </Suspense>
            } 
          />
          <Route 
            path="tracks" 
            element={
              <Suspense fallback={<AdminLoading />}>
                <TracksPage />
              </Suspense>
            } 
          />
          <Route 
            path="docs" 
            element={
              <Suspense fallback={<AdminLoading />}>
                <DocsPage />
              </Suspense>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <Suspense fallback={<AdminLoading />}>
                <AnalyticsPage />
              </Suspense>
            } 
          />
        </Route>
        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default AdminApp;
