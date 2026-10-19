import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  if (mode !== 'development') {
    const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
    if (!VITE_API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL es obligatoria para compilar en producción')
    }

    let apiUrl
    try {
      apiUrl = new URL(VITE_API_BASE_URL, 'https://deployment.invalid')
    } catch {
      throw new Error('VITE_API_BASE_URL debe ser una URL válida')
    }

    const hostname = apiUrl.hostname.replace(/\.$/, '')
    if (
      apiUrl.protocol !== 'https:' ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '[::1]' ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname) ||
      apiUrl.username ||
      apiUrl.password ||
      apiUrl.search ||
      apiUrl.hash
    ) {
      throw new Error('VITE_API_BASE_URL debe usar HTTPS y no puede apuntar a localhost')
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
    },
  }
})
