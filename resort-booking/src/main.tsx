import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotifyHost from './components/NotifyHost'
import './index.css'
import App from './App.tsx'
import { SiteDataProvider } from './context/SiteDataContext'

// Always use light mode (clear any saved dark preference)
document.documentElement.classList.remove('dark')
localStorage.removeItem('theme')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SiteDataProvider>
        <App />
        <NotifyHost />
      </SiteDataProvider>
    </QueryClientProvider>
  </StrictMode>,
)
