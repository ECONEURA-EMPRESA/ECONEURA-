import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    // ⚡ IMPROVEMENT: Gzip Compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'charts-vendor': ['recharts']
        }
      }
    },
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    sourcemap: false,
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, './src/__tests__/setup.ts'),
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    env: {
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_NEURA_GW_URL: 'http://localhost:3000',
      VITE_NEURA_GW_KEY: 'test-key'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  },
}));
