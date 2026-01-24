import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./components/theme/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="vault-ui-theme">
        <App />
        <Toaster position="bottom-left" richColors closeButton />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
