import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/Components/Ui/Index'
import { ToastContainer } from '@/Components/Ui/Toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <ToastContainer />
    </TooltipProvider>
  </StrictMode>,
)
