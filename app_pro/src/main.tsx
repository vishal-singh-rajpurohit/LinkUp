import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { AppContextProvider } from './context/AppContext.tsx'
import WSProvider from './context/WSContext.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <WSProvider >
      <AppContextProvider>
        <BrowserRouter >
          <App />
        </BrowserRouter>
      </AppContextProvider>
    </WSProvider>
  </Provider>
)
