import type { App } from 'vue'
import CryptoSelector from './components/CryptoSelector.vue'
import './style.css'

export { CryptoSelector }

export default {
  install: (app: App) => {
    app.component('CryptoSelector', CryptoSelector)
  },
}
