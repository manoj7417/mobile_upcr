// app.config.ts
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]',
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js'
        }
      }
    },
    css: {
      postcss: './postcss.config.js',
      modules: {
        localsConvention: 'camelCase'
      }
    },
    optimizeDeps: {
      include: ['@tanstack/react-start', 'react', 'react-dom']
    },
    define: {
      // Enable mobile-specific features
      __MOBILE_APP__: process.env.MOBILE_BUILD === 'true'
    }
  },
  // Enable client-only mode for mobile builds
  experimental: {
    clientOnly: process.env.MOBILE_BUILD === 'true'
  }
})