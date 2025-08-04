import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import store from "./store/store";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./context/ChatProvider.Provider";
import { SocketProvider } from "./context/SocketContext.context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ChatProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ChatProvider>
    </Provider>
  </BrowserRouter>
);
