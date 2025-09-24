import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/Components',
      '@/context': '/src/Context',
      '@/hooks': '/src/Hooks',
      '@/pages': '/src/Pages',
      '@/types': '/src/Types',
      '@/utils': '/src/Utils',
      '@/constants': '/src/Constants'
    }
  }
})