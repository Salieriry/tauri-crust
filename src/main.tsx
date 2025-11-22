import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
import App from "./App";
import { Toaster } from "./components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Envolva o App com o ThemeProvider */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
    <Toaster />
  </React.StrictMode>,
);