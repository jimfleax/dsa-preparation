import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { SkeletonTheme } from "react-loading-skeleton";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // With autoUpdate, this usually won't be called, but we can hook in if we switch to prompt later.
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SkeletonTheme baseColor="#f5f5f5" highlightColor="#fafafa">
        <App />
      </SkeletonTheme>
    </AuthProvider>
  </StrictMode>,
);
