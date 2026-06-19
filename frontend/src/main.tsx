import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NetworkStatusProvider } from "./context/NetworkStatusContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SkeletonTheme } from "react-loading-skeleton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import AdminApp from "./AdminApp.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./index.css";
import "react-loading-skeleton/dist/skeleton.css";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/" element={
            <NetworkStatusProvider>
              <AuthProvider>
                <SkeletonTheme baseColor="#f5f5f5" highlightColor="#fafafa">
                  <App />
                </SkeletonTheme>
              </AuthProvider>
            </NetworkStatusProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
