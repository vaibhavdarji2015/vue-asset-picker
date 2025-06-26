import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchConversionRate as apiFetchConversionRate,
  fetchSupportedFiatCurrencies as apiFetchSupportedFiatCurrencies,
} from '../../services/cryptoApi'
import type { ConversionRate, Crypto } from '../types'

interface CachedConversionRate extends ConversionRate {
  cachedAt: number // Timestamp when it was cached
}

export const useConversionStore = defineStore('conversion', () => {
  const conversionRate = ref<ConversionRate | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const availableFiatCurrencies = ref<string[]>([])
  const isLoadingFiatCurrencies = ref(false)
  const fiatCurrenciesError = ref<string | null>(null)

  const conversionRateCache = new Map<string, CachedConversionRate>()
  const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes cache duration

  /**
   * Fetches and sets the conversion rate between a cryptocurrency and a target currency.
   * @param fromCrypto The Crypto object (includes ID for API call, and ticker for internal logic).
   * @param toCurrency The ticker of the target currency (e.g., 'USD', 'EUR').
   * @returns The fetched ConversionRate object or null.
   */
  async function fetchAndSetConversionRate(
    fromCrypto: Crypto,
    toCurrency: string,
  ): Promise<ConversionRate | null> {
    isLoading.value = true
    error.value = null
    conversionRate.value = null // Clear previous rate

    const cacheKey = `${fromCrypto.id}-${toCurrency.toLowerCase()}`
    const cached = conversionRateCache.get(cacheKey)

    // Check if a valid, unexpired rate is in cache
    if (cached && Date.now() - cached.cachedAt < CACHE_DURATION_MS) {
      console.log(`Using cached rate for ${fromCrypto.id} to ${toCurrency}`)
      conversionRate.value = cached
      isLoading.value = false
      return cached
    }

    if (fromCrypto.ticker.toUpperCase() === toCurrency.toUpperCase()) {
      const directRate: ConversionRate = {
        from: fromCrypto.ticker,
        to: toCurrency,
        rate: 1,
        timestamp: Date.now(),
      }
      conversionRate.value = directRate
      conversionRateCache.set(cacheKey, { ...directRate, cachedAt: Date.now() })
      isLoading.value = false
      return conversionRate.value
    }

    try {
      const rate = await apiFetchConversionRate(fromCrypto.id, toCurrency)
      conversionRate.value = rate
      // Store the new rate in cache
      if (rate) {
        conversionRateCache.set(cacheKey, { ...rate, cachedAt: Date.now() })
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch conversion rate due to an unknown error.'
      }
      console.error('Conversion Store Error:', err)
    } finally {
      isLoading.value = false
    }
    return conversionRate.value
  }

  /**
   * Fetches the list of supported fiat currencies.
   */
  async function fetchAvailableFiatCurrencies() {
    isLoadingFiatCurrencies.value = true
    fiatCurrenciesError.value = null

    try {
      availableFiatCurrencies.value = await apiFetchSupportedFiatCurrencies()
    } catch (err: unknown) {
      if (err instanceof Error) {
        fiatCurrenciesError.value = err.message
      } else {
        fiatCurrenciesError.value = 'Failed to fetch fiat currencies due to an unknown error.'
      }
      console.error('Conversion Store (Fiat Currencies) Error:', err)
      availableFiatCurrencies.value = ['USD', 'EUR', 'INR']
    } finally {
      isLoadingFiatCurrencies.value = false
    }
  }

  if (availableFiatCurrencies.value.length === 0 && !isLoadingFiatCurrencies.value) {
    fetchAvailableFiatCurrencies()
  }

  return {
    conversionRate,
    isLoading,
    error,
    availableFiatCurrencies,
    isLoadingFiatCurrencies,
    fiatCurrenciesError,
    fetchAndSetConversionRate,
    fetchAvailableFiatCurrencies,
  }
})
