import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vault-ui-theme">
        <App />
        <Toaster position="bottom-left" richColors closeButton />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
