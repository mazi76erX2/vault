import * as React from "react";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import t, { useToaster } from "react-hot-toast";
import router from "./routes/Routes";
import { useAppDispatch } from "./store/hooks";
import { hydrateSession } from "./store/slices/authSlice";
import { ThemeProvider } from "./theme/ThemeContext";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  const [toastLimit] = React.useState(3);
  const { toasts } = useToaster();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateSession());
  }, [dispatch]);

  React.useEffect(() => {
    toasts
      .filter((tt) => tt.visible)
      .filter((_, i) => i >= toastLimit)
      .forEach((tt) => t.dismiss(tt.id));
  }, [toastLimit, toasts]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
