import axios from 'axios'
import type {
  Crypto,
  ConversionRate,
  CoinGeckoMarketData,
  CoinGeckoSimplePrice,
} from '../src/types'

// --- CoinGecko API Constants ---
const COINGECKO_API_BASE = '/coingecko-api'

// CoinGecko uses a few different domains for their assets (icons).
// We need to list them all here so we can rewrite them to go through our proxy.
const COINGECKO_ASSET_DOMAINS = [
  'https://assets.coingecko.com',
  'https://coin-images.coingecko.com',
  'https://www.coingecko.com/coins/images', // Sometimes older or specific images
  // Add more here if you observe other asset domains in your console for failed images
]

const PROXY_LOGO_PREFIX = '/coingecko-assets'

/**
 * Fetches a list of cryptocurrencies with their market data from CoinGecko.
 * @returns A promise that resolves with an array of Crypto objects.
 */
export const fetchCryptocurrencies = async (): Promise<Crypto[]> => {
  try {
    const response = await axios.get<CoinGeckoMarketData[]>(`${COINGECKO_API_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    })
    return response.data.map((item) => {
      let iconUrl = item.image
      for (const domain of COINGECKO_ASSET_DOMAINS) {
        if (iconUrl && iconUrl.startsWith(domain)) {
          iconUrl = iconUrl.replace(domain, PROXY_LOGO_PREFIX)
          break // Stop after the first match and replacement
        }
      }
      return {
        id: item.id,
        name: item.name,
        ticker: item.symbol.toUpperCase(),
        icon: iconUrl,
        combinedBalance: item.current_price || 0,
        sourceChains: ['Various'],
      }
    })
  } catch (error) {
    console.error('Error fetching cryptocurrencies from CoinGecko:', error)
    throw new Error('Failed to fetch cryptocurrencies data from API.')
  }
}

/**
 * Fetches a conversion rate between a cryptocurrency and a fiat currency from CoinGecko.
 * @param fromCoinId The CoinGecko ID of the source cryptocurrency (e.g., 'bitcoin', 'ethereum').
 * @param toCurrency The ticker of the target fiat currency (e.g., 'usd', 'eur', 'inr').
 * @returns A promise that resolves with a ConversionRate object or null if not found.
 */
export const fetchConversionRate = async (
  fromCoinId: string,
  toCurrency: string,
): Promise<ConversionRate | null> => {
  try {
    const response = await axios.get<CoinGeckoSimplePrice>(`${COINGECKO_API_BASE}/simple/price`, {
      params: {
        ids: fromCoinId.toLowerCase(),
        vs_currencies: toCurrency.toLowerCase(),
      },
    })

    const data = response.data
    const rate = data?.[fromCoinId.toLowerCase()]?.[toCurrency.toLowerCase()]

    if (rate !== undefined && rate !== null) {
      return {
        from: fromCoinId,
        to: toCurrency.toUpperCase(),
        rate: rate,
        timestamp: Date.now(),
      }
    } else {
      console.warn(`No conversion rate found for ${fromCoinId} to ${toCurrency}.`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching conversion rate for ${fromCoinId} to ${toCurrency}:`, error)
    return null
  }
}

/**
 * Fetches a list of supported fiat currencies from CoinGecko.
 * These are currencies against which crypto prices can be quoted.
 * @returns A promise that resolves with an array of string (currency tickers).
 */
export const fetchSupportedFiatCurrencies = async (): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(
      `${COINGECKO_API_BASE}/simple/supported_vs_currencies`,
    )
    return response.data.map((currency) => currency.toUpperCase())
  } catch (error) {
    console.error('Error fetching supported fiat currencies from CoinGecko:', error)
    return ['USD', 'EUR', 'INR'] // Fallback to a sensible default
  }
}
