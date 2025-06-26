## 📸 Demo

![Crypto Selector Demo](./assets/crypto-selector-demo.gif)

### **Part 1: Introduction, Features, and Installation**

# vue-asset-picker

A reusable Vue 3 component library providing a customizable cryptocurrency asset selector with integrated currency conversion capabilities. Built with Vite, Vue 3 Composition API, Pinia for state management, and TypeScript for type safety.

---

## ✨ Features

- **Asset Selection**: Easily select from a comprehensive list of cryptocurrencies.
- **Search Functionality**: Quickly find assets by name or ticker symbol.
- **Integrated Conversion**: Convert selected crypto amounts to various fiat currencies (USD, EUR, INR, JPY, etc.).
- **Theming**: Highly customizable look and feel using CSS variables.
- **State Management**: Leverages Pinia for efficient and predictable state handling.
- **Type-Safe**: Developed with TypeScript for robust and maintainable code.

---

## 🚀 Installation

To integrate `vue-asset-picker` into your Vue 3 project:

1.  **Install the package:**

    ```bash
    npm install vue-asset-picker
    # OR
    yarn add vue-asset-picker
    ```

2.  **Import and register the plugin in your `main.ts` (or `main.js`):**

    ```typescript
    // main.ts
    import { createApp } from 'vue'
    import { createPinia } from 'pinia'
    import App from './App.vue'
    import VueAssetPicker from 'vue-asset-picker' // Import the plugin
    import 'vue-asset-picker/style.css' // Import the default styles

    const app = createApp(App)

    app.use(createPinia()) // Pinia is required for state management
    app.use(VueAssetPicker) // Register the component plugin

    app.mount('#app')
    ```

### **Part 2: Usage - Basic Example**

---

## 💡 Usage

The `vue-asset-picker` package primarily exposes the `<CryptoSelector />` component.

### Basic Example

```vue
<template>
  <div id="app-container">
    <h1>My Crypto App</h1>
    <CryptoSelector
      v-model="selectedCrypto"
      :availableFiatCurrencies="['USD', 'EUR', 'GBP']"
      @convertedAmount="handleConvertedAmount"
      class="my-custom-picker-theme"
    />

    <div v-if="selectedCrypto">
      <h2>Selected: {{ selectedCrypto.name }} ({{ selectedCrypto.ticker }})</h2>
      <p>ID: {{ selectedCrypto.id }}</p>
    </div>
    <div v-if="convertedAmount !== null">
      <p>Converted amount: {{ convertedAmount.toFixed(4) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Crypto } from 'vue-asset-picker/types' // Import the Crypto type for type safety

const selectedCrypto = ref<Crypto | null>(null)
const convertedAmount = ref<number | null>(null)

const handleConvertedAmount = (amount: number) => {
  console.log('Received converted amount:', amount)
  convertedAmount.value = amount
}
</script>

<style>
/* Basic styling for the container */
#app-container {
  font-family: 'Arial', sans-serif;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
```

### **Part 3: Component Props, Emits, and Types**

### Component Props

The `<CryptoSelector />` component accepts the following props:

| Prop Name                 | Type                  | Default     | Description                                                                           |
| :------------------------ | :-------------------- | :---------- | :------------------------------------------------------------------------------------ |
| `v-model`                 | `Crypto \| null`      | `null`      | Binds the currently selected `Crypto` object.                                         |
| `showConversion`          | `boolean`             | `true`      | Controls the visibility of the integrated currency conversion section.                |
| `availableFiatCurrencies` | `string[]`            | `[]`        | An array of fiat currency symbols (e.g., `['USD', 'EUR']`) to display for conversion. |
| `initialSelectedCryptoId` | `string \| undefined` | `undefined` | The CoinGecko ID of a cryptocurrency to pre-select on mount.                          |

### Component Emits

The `<CryptoSelector />` component emits the following events:

| Event Name          | Payload Type | Description                                                    |
| :------------------ | :----------- | :------------------------------------------------------------- |
| `update:modelValue` | `Crypto`     | Emitted when a new cryptocurrency is selected (for `v-model`). |
| `convertedAmount`   | `number`     | Emitted when the converted amount is calculated.               |

### Types

The `Crypto` type used throughout the package is defined as:

```typescript
export interface Crypto {
  id: string // CoinGecko ID (e.g., 'bitcoin')
  symbol: string // Crypto symbol (e.g., 'btc')
  ticker: string // Primary ticker (e.g., 'BTC')
  name: string // Full name (e.g., 'Bitcoin')
  icon: string // URL to the crypto icon
  rank: number // Market Cap Rank
  priceUsd: number // Price in USD
  changePercent24Hr: number // 24hr price change percentage
  marketCapUsd: number // Market capitalization in USD
  // Add other properties as needed if expanded
}

export interface ConversionRate {
  from: string // Source currency/crypto ticker
  to: string // Target currency/crypto ticker
  rate: number // Conversion rate
  timestamp: number // Timestamp of the rate
}

export interface CryptoSelectorProps {
  modelValue?: Crypto | null // For v-model
  showConversion?: boolean
  availableFiatCurrencies?: string[]
  initialSelectedCryptoId?: string
}

import type { Crypto, CryptoSelectorProps } from 'vue-asset-picker/types'

### **Part 4: Styling and Theming**

Copy the following text and append it directly after the previous part:

```

---

## 🎨 Styling and Theming

The component is designed to be highly customizable using CSS Variables (Custom Properties). All styling is scoped to the `crypto-selector-wrapper` class, and you can override default values by defining these variables on a parent element or directly on the component instance.

### Available CSS Variables

| Variable Name                     | Description                                 | Default Value (light theme example) |
| :-------------------------------- | :------------------------------------------ | :---------------------------------- |
| `--v-ap-bg-primary`               | Main background color                       | `#f8f8f8`                           |
| `--v-ap-bg-secondary`             | Section background color                    | `#ffffff`                           |
| `--v-ap-bg-tertiary`              | Input fields, dropdown background           | `#e0e0e0`                           |
| `--v-ap-bg-quaternary`            | Conversion result background                | `#f0f0f0`                           |
| `--v-ap-bg-hover`                 | Hover state background                      | `#d0d0d0`                           |
| `--v-ap-text-color`               | General text color                          | `#333333`                           |
| `--v-ap-text-title`               | Section title color                         | `#941b1b`                           |
| `--v-ap-text-light`               | Lighter text color                          | `#666666`                           |
| `--v-ap-text-placeholder`         | Placeholder text color                      | `#999999`                           |
| `--v-ap-text-success`             | Success state text (e.g., converted amount) | `#4b35c4`                           |
| `--v-ap-text-error`               | Error message text                          | `#dc3545`                           |
| `--v-ap-border-color-dark`        | Darker border lines                         | `#cccccc`                           |
| `--v-ap-border-color-medium`      | Medium border lines                         | `#dddddd`                           |
| `--v-ap-border-color-light`       | Lighter border lines                        | `#eeeeee`                           |
| `--v-ap-box-shadow`               | Component box shadow                        | `0 4px 10px rgba(0, 0, 0, 0.1)`     |
| `--v-ap-border-radius-base`       | Base border radius                          | `8px`                               |
| `--v-ap-border-radius-sm`         | Small border radius                         | `4px`                               |
| `--v-ap-border-radius-circle`     | Circle border radius                        | `50%`                               |
| `--v-ap-dropdown-arrow-color`     | Dropdown arrow color                        | `#666`                              |
| `--v-ap-scrollbar-track-bg`       | Scrollbar track background                  | `#f0f0f0`                           |
| `--v-ap-scrollbar-thumb-bg`       | Scrollbar thumb background                  | `#bbbbbb`                           |
| `--v-ap-scrollbar-thumb-hover-bg` | Scrollbar thumb hover background            | `#999999`                           |

### Example: Applying a Custom Theme

You can apply a custom theme by defining these CSS variables in your own stylesheet, ideally targeting the component's root element or a wrapper:

```css
/* In your global CSS file or a scoped style in a parent component */
.my-custom-picker-theme {
  --v-ap-bg-primary: #2c3e50; /* Darker blue background */
  --v-ap-bg-secondary: #34495e;
  --v-ap-bg-tertiary: #212b36;
  --v-ap-bg-quaternary: #1c252e;
  --v-ap-bg-hover: #4e6074;

  --v-ap-text-color: #ecf0f1; /* Lighter text */
  --v-ap-text-title: #ffffff;
  --v-ap-text-light: #bdc3c7;
  --v-ap-text-placeholder: #828a96;
  --v-ap-text-success: #1abc9c; /* Teal success */
  --v-ap-text-error: #e74c3c;

  --v-ap-border-color-dark: #405161;
  --v-ap-border-color-medium: #4e6074;
  --v-ap-border-color-light: #5f7488;

  --v-ap-box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  --v-ap-dropdown-arrow-color: #ecf0f1;
  --v-ap-scrollbar-track-bg: #2c3e50;
  --v-ap-scrollbar-thumb-bg: #4e6074;
  --v-ap-scrollbar-thumb-hover-bg: #63778a;
}
```

### **Part 5: Project Setup and Commands**

---

## 🛠 Project Setup

This project uses Vite for its build tooling.

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Commands

```sh
# Install dependencies
npm install

# Compile and Hot-Reload for Development
npm run dev

# Type-Check, Compile and Minify for Production
npm run build

# Lint with ESLint
npm run lint
```

### **Part 6: Contributing, License, and Acknowledgements (Footer)**

---

## 🤝 Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to contribute code, please check the [issues page](https://github.com/YOUR_USERNAME/vue-asset-picker/issues) or submit a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Built with [Vue 3](https://vuejs.org/) and [Vite](https://vitejs.dev/).
- State management powered by [Pinia](https://pinia.vuejs.org/).
- Cryptocurrency data provided by [CoinGecko API](https://www.coingecko.com/api).

---
