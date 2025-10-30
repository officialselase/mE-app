import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// HelmetProvider not needed with react-helmet
import App from "./App.jsx";
import { queryClient } from "./utils/queryClient.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Temporarily disable StrictMode to fix auth context issues
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  // </React.StrictMode>
);
