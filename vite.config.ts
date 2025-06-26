import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueAssetPicker',
      fileName: (format) => {
        if (format === 'es') {
          return `vue-asset-picker.es.js`
        }
        if (format === 'umd') {
          return `vue-asset-picker.umd.js`
        }
        return `vue-asset-picker.${format}.js` // Fallback for other formats
      },
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || ''
        },
      },
    },
  },
})
