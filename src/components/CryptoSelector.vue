<template>
  <div class="crypto-selector-wrapper">
    <div class="header">
      <div class="title">Select Asset</div>
      <div class="selected-asset-dropdown" @click="toggleDropdown">
        <div v-if="selectedCrypto" class="selected-crypto-display">
          <img :src="selectedCrypto.icon" :alt="selectedCrypto.name" class="selected-crypto-icon" />
          <span class="selected-crypto-ticker">{{ selectedCrypto.ticker }}</span>
          <span class="selected-crypto-name">{{ selectedCrypto.name }}</span>
        </div>
        <div v-else class="placeholder-text">Select a cryptocurrency</div>
        <span class="dropdown-arrow" :class="{ rotate: isOpen }"></span>
      </div>
    </div>

    <div class="dropdown-content" v-show="isOpen">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
        <span class="search-icon">🔍</span>
      </div>

      <div class="list-headers">
        <span>Assets</span>
        <span>Combined Balance</span>
        <span>Source Chain(s) <span class="info-icon">ℹ️</span></span>
      </div>

      <div class="crypto-list-container">
        <div v-if="cryptoStore.isLoading" class="loading-message">Loading cryptocurrencies...</div>
        <div v-else-if="cryptoStore.error" class="error-message">{{ cryptoStore.error }}</div>
        <div v-else-if="filteredCryptos.length === 0" class="no-results-message">
          No cryptocurrencies found for "{{ searchQuery }}"
        </div>
        <div v-else class="crypto-list">
          <CryptoItem
            v-for="crypto in filteredCryptos"
            :key="crypto.id"
            :crypto="crypto"
            :isSelected="selectedCrypto?.id === crypto.id"
            radioGroupName="cryptoSelection"
            @click="selectCrypto(crypto)"
          />
        </div>
      </div>
    </div>

    <div v-if="showConversion && selectedCrypto" class="conversion-section">
      <h3>Convert {{ selectedCrypto.ticker }}</h3>
      <CurrencyInput
        v-model="cryptoAmount"
        :selectedCurrency="targetCurrency"
        :availableCurrencies="finalAvailableFiatCurrencies"
        label="Amount"
        :placeholder="`Enter ${selectedCrypto.ticker} amount`"
        @update:selectedCurrency="handleTargetCurrencyChange"
      />

      <div class="conversion-result">
        <div v-if="conversionStore.isLoading" class="loading-message">Fetching rate...</div>
        <div v-else-if="conversionStore.error" class="error-message">
          {{ conversionStore.error }}
        </div>
        <div v-else-if="convertedAmount !== null">
          <div class="converted-value">
            <span class="amount">{{ formatNumber(convertedAmount) }}</span>
            <span class="currency">{{ targetCurrency }}</span>
          </div>
          <div class="rate-display" v-if="currentRate && selectedCrypto.ticker !== targetCurrency">
            1 {{ selectedCrypto.ticker }} = {{ formatNumber(currentRate) }} {{ targetCurrency }}
          </div>
        </div>
        <div v-else class="conversion-placeholder">Enter amount to see conversion.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCryptoStore } from '../stores/cryptoStore'
import { useConversionStore } from '../stores/conversionStore'
import CryptoItem from './CryptoItem.vue'
import CurrencyInput from './CurrencyInput.vue'
import type { Crypto, CryptoSelectorProps } from '../types'

// Props definition using TypeScript interfaces
const props = withDefaults(defineProps<CryptoSelectorProps>(), {
  showConversion: true,
})

// Emits for v-model and converted amount
const emit = defineEmits(['update:modelValue', 'convertedAmount'])

// Pinia Stores
const cryptoStore = useCryptoStore()
const conversionStore = useConversionStore()

// Reactive state
const isOpen = ref(false)
const searchQuery = ref('')
const selectedCrypto = ref<Crypto | null>(null)
const targetCurrency = ref<string>('USD')
const cryptoAmount = ref<number>(1)

const filteredCryptos = computed(() => {
  if (!searchQuery.value) {
    return cryptoStore.getAllCryptos()
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return cryptoStore
    .getAllCryptos()
    .filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(lowerCaseQuery) ||
        crypto.ticker.toLowerCase().includes(lowerCaseQuery),
    )
})

const finalAvailableFiatCurrencies = computed(() => {
  const storeCurrencies = conversionStore.availableFiatCurrencies
  const propCurrencies = props.availableFiatCurrencies || []
  return [...new Set([...storeCurrencies, ...propCurrencies].map((c) => c.toUpperCase()))]
})

const currentRate = computed(() => {
  return conversionStore.conversionRate?.rate || null
})

const convertedAmount = computed(() => {
  if (selectedCrypto.value && cryptoAmount.value !== null && currentRate.value !== null) {
    return cryptoAmount.value * currentRate.value
  }
  return null
})

let conversionRateFetchTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_DELAY_MS = 300

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectCrypto = (crypto: Crypto) => {
  selectedCrypto.value = crypto
  emit('update:modelValue', crypto)
  isOpen.value = false

  if (props.showConversion) {
    targetCurrency.value = finalAvailableFiatCurrencies.value[0] || ''
  }
}

const handleTargetCurrencyChange = (currency: string) => {
  targetCurrency.value = currency
  if (conversionRateFetchTimeout) {
    clearTimeout(conversionRateFetchTimeout)
    conversionRateFetchTimeout = null
  }
}

const formatNumber = (num: number, decimalPlaces: number = 2) => {
  if (num === null) return ''
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  })
}

// Watchers
watch([selectedCrypto, targetCurrency], ([newCrypto, newTargetCurrency]) => {
  if (conversionRateFetchTimeout) {
    clearTimeout(conversionRateFetchTimeout)
  }
  conversionRateFetchTimeout = setTimeout(() => {
    if (newCrypto && newTargetCurrency) {
      conversionStore.fetchAndSetConversionRate(newCrypto, newTargetCurrency)
    }
  }, DEBOUNCE_DELAY_MS)
})

watch(convertedAmount, (newAmount) => {
  if (newAmount !== null) {
    emit('convertedAmount', newAmount)
  }
})

// Lifecycle Hooks
onMounted(async () => {
  await cryptoStore.fetchCryptocurrencies()

  let initialCryptoToSelect: Crypto | null = null

  if (props.initialSelectedCryptoId) {
    const initialCrypto = cryptoStore.getCryptoById(props.initialSelectedCryptoId)
    if (initialCrypto) {
      initialCryptoToSelect = initialCrypto
    }
  } else if (cryptoStore.getAllCryptos().length > 0) {
    initialCryptoToSelect = cryptoStore.getAllCryptos()[0]
  }

  if (initialCryptoToSelect) {
    selectCrypto(initialCryptoToSelect)
    if (initialCryptoToSelect && targetCurrency.value) {
      await conversionStore.fetchAndSetConversionRate(initialCryptoToSelect, targetCurrency.value)
    }
  }
})

watch(
  finalAvailableFiatCurrencies,
  (newCurrencies) => {
    if (
      newCurrencies.length > 0 &&
      (!targetCurrency.value || !newCurrencies.includes(targetCurrency.value))
    ) {
      targetCurrency.value = newCurrencies[0]
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.crypto-selector-wrapper {
  font-family: 'Inter', sans-serif;
  background-color: var(--v-ap-bg-primary);
  color: var(--v-ap-text-color);
  border-radius: var(--v-ap-border-radius-base);
  box-shadow: var(--v-ap-box-shadow);
  width: 100%;
  max-width: 450px;
  margin: 20px auto;
  overflow: hidden;
  border: 1px solid var(--v-ap-border-color-dark);
}

.header {
  padding: 16px 20px;
  background-color: var(--v-ap-bg-secondary);
  border-bottom: 1px solid var(--v-ap-border-color-dark);
}

.title {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--v-ap-text-title);
  margin-bottom: 12px;
}

.selected-asset-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: var(--v-ap-bg-tertiary);
  border-radius: var(--v-ap-border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid var(--v-ap-border-color-medium);
}

.selected-asset-dropdown:hover {
  background-color: var(--v-ap-bg-hover);
}

.selected-crypto-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-crypto-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--v-ap-border-radius-circle);
}

.selected-crypto-ticker {
  font-weight: 600;
  font-size: 1.1em;
  color: var(--v-ap-text-title);
}

.selected-crypto-name {
  color: var(--v-ap-text-light);
  font-size: 0.9em;
}

.placeholder-text {
  color: var(--v-ap-text-placeholder);
  font-size: 1em;
}

.dropdown-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--v-ap-dropdown-arrow-color);
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-content {
  padding: 15px 20px;
  max-height: 400px;
  overflow-y: auto;
  border-bottom: 1px solid var(--v-ap-border-color-dark);
}

.search-bar {
  position: relative;
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  background-color: var(--v-ap-bg-tertiary);
  border: 1px solid var(--v-ap-border-color-medium);
  border-radius: var(--v-ap-border-radius-sm);
  color: var(--v-ap-text-color);
  font-size: 1em;
  outline: none;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--v-ap-text-placeholder);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--v-ap-text-placeholder);
}

.list-headers {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr;
  gap: 12px;
  font-size: 0.8em;
  color: var(--v-ap-text-placeholder);
  padding: 8px 16px;
  border-bottom: 1px solid var(--v-ap-border-color-light);
  margin-bottom: 5px;
}

.list-headers span:first-child {
  grid-column: 1 / span 1;
  padding-left: 32px;
}

.list-headers span:last-child {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.info-icon {
  font-size: 0.9em;
  cursor: help;
}

.crypto-list-container {
  max-height: 250px;
  overflow-y: auto;
  border-radius: var(--v-ap-border-radius-sm);
  background-color: var(--v-ap-bg-secondary);
}

.crypto-list {
  /* CryptoItem handles its own padding and border-bottom */
}

.loading-message,
.error-message,
.no-results-message,
.conversion-placeholder {
  text-align: center;
  padding: 20px;
  color: var(--v-ap-text-placeholder);
  font-size: 0.95em;
}

.error-message {
  color: var(--v-ap-text-error);
}

.conversion-section {
  padding: 20px;
  background-color: var(--v-ap-bg-secondary);
  border-top: 1px solid var(--v-ap-border-color-dark);
}

.conversion-section h3 {
  font-size: 1.1em;
  color: var(--v-ap-text-title);
  margin-bottom: 15px;
  font-weight: 500;
}

.conversion-result {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--v-ap-bg-quaternary);
  border-radius: var(--v-ap-border-radius-sm);
  border: 1px solid var(--v-ap-border-color-dark);
  text-align: center;
}

.converted-value {
  font-size: 1.8em;
  font-weight: 700;
  color: var(--v-ap-text-success);
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.converted-value .amount {
  /* Specific styling for the number part */
}

.converted-value .currency {
  font-size: 0.6em;
  font-weight: 500;
  color: var(--v-ap-text-color);
}

.rate-display {
  font-size: 0.85em;
  color: var(--v-ap-text-light);
  margin-top: 8px;
}

/* Scrollbar Styles (for Webkit browsers like Chrome/Safari) */
.crypto-list-container::-webkit-scrollbar {
  width: 8px;
  background-color: var(--v-ap-scrollbar-track-bg);
  border-radius: 4px;
}

.crypto-list-container::-webkit-scrollbar-thumb {
  background-color: var(--v-ap-scrollbar-thumb-bg);
  border-radius: 4px;
  border: 1px solid var(--v-ap-scrollbar-track-bg);
}

.crypto-list-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--v-ap-scrollbar-thumb-hover-bg);
}
</style>
