import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { AppContextProvider } from './context/AppContext.tsx'
import WSProvider from './context/WSContext.tsx'
import { FailVideoCall, IncomingVideoCall, RequestedVideoCall } from './Components/subComponents/Calling.tsx'
import { CallNotification, Notification } from './Components/subComponents/Mails.tsx'


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter >
      <WSProvider >
          <AppContextProvider>
            <Notification />
            <CallNotification />
            <App />
            <RequestedVideoCall />
            <IncomingVideoCall />
            <FailVideoCall />
          </AppContextProvider>
      </WSProvider>
    </BrowserRouter>
  </Provider>
)
