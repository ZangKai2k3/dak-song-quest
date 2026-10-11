import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Tự động bỏ qua lỗi gọi login tự động từ zmp-sdk khi chạy trên trình duyệt laptop / test network
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const r = event.reason;
    if (r && (r.api === "login" || r.code === -2000)) {
      event.preventDefault();
    }
  });
}

function mount() {
  let rootElement = document.getElementById("root") || document.getElementById("app");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}