import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      global: 'window',
      'process.env': {},
    },
    resolve: {
      alias: {
        '@creit.tech/stellar-wallets-kit': '@creit-tech/stellar-wallets-kit',
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['payarmove.com', 'www.payarmove.com', 'api.payarmove.com', '173.214.172.222', 'localhost', '127.0.0.1'],
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_PROXY_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
        '/media': {
          target: env.VITE_BACKEND_PROXY_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
