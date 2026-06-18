import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NetworkStatusProvider } from "./context/NetworkStatusContext";
import { AuthProvider } from "./context/AuthContext";
import { SkeletonTheme } from "react-loading-skeleton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import AdminApp from "./AdminApp.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

const isAdminRoute = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdminRoute ? (
      <AdminApp />
    ) : (
      <NetworkStatusProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            <SkeletonTheme baseColor="#f5f5f5" highlightColor="#fafafa">
              <App />
            </SkeletonTheme>
          </AuthProvider>
        </GoogleOAuthProvider>
      </NetworkStatusProvider>
    )}
  </StrictMode>,
);
