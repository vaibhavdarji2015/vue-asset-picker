import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { fetchCryptocurrencies as apiFetchCryptocurrencies } from '../../services/cryptoApi'
import type { Crypto } from '../types'

export const useCryptoStore = defineStore('crypto', () => {
  const cryptos = ref<Crypto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetches the list of cryptocurrencies.
   */
  async function fetchCryptocurrencies() {
    isLoading.value = true
    error.value = null // Clear previous errors
    try {
      cryptos.value = await apiFetchCryptocurrencies()
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message // Access message property
      } else {
        error.value = 'Failed to fetch cryptocurrencies due to an unknown error.' // Generic message for unknown error
      }
      console.error('Crypto Store Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    if (cryptos.value.length === 0 && !isLoading.value && !error.value) {
      fetchCryptocurrencies()
    }
  })

  /**
   * Getter to find a crypto by its ID.
   * @param id The ID of the crypto to find.
   * @returns The Crypto object or undefined.
   */
  function getCryptoById(id: string): Crypto | undefined {
    return cryptos.value.find((crypto) => crypto.id.toLowerCase() === id.toLowerCase())
  }

  /**
   * Getter to get all loaded cryptocurrencies.
   */
  function getAllCryptos(): Crypto[] {
    return cryptos.value
  }

  return {
    cryptos,
    isLoading,
    error,
    fetchCryptocurrencies,
    getCryptoById,
    getAllCryptos,
  }
})
