import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
  ],
  
  esbuild: {
    jsx: 'automatic',
  },
  
  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },

  preview: {
    port: 1420,
    strictPort: true,
  },

  css: {
    devSourcemap: true,
    minify: true,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1890ff',
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 核心
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          // Ant Design - 拆分
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
            if (id.includes('antd/es/locale')) return 'antd-locale'
            if (id.includes('antd/es/date-picker') || id.includes('antd/es/calendar')) return 'antd-date'
            if (id.includes('antd/es/table')) return 'antd-table'
            if (id.includes('antd/es/form')) return 'antd-form'
            if (id.includes('antd/es/select') || id.includes('antd/es/tree-select')) return 'antd-select'
            if (id.includes('antd/es/modal') || id.includes('antd/es/drawer')) return 'antd-overlay'
            if (id.includes('antd/es/upload')) return 'antd-upload'
            return 'antd-core'
          }
          // 工具库
          if (id.includes('node_modules/axios') || id.includes('node_modules/uuid')) {
            return 'utils-vendor'
          }
          // 路由
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor'
          }
          // 国际化
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n-vendor'
          }
          // html2canvas
          if (id.includes('html2canvas')) {
            return 'html2canvas'
          }
        },
      },
    },
  },
})
