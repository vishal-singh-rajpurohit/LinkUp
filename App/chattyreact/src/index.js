import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./context/ChatProvider.Provider";
import { SocketProvider } from "./context/SocketContext.context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ChatProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ChatProvider>
  </BrowserRouter>
);
