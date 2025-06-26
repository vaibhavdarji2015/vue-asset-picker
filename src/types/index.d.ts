/**
 * Interface for a Cryptocurrency object.
 */
export interface Crypto {
  id: string
  name: string
  ticker: string
  icon: string
  combinedBalance: number
  sourceChains: string[]
}

/**
 * Interface for a Currency Conversion Rate.
 */
export interface ConversionRate {
  from: string
  to: string
  rate: number
  timestamp: number
}

/**
 * Interfaces for CoinGecko API responses
 */
export interface CoinGeckoMarketData {
  id: string
  symbol: string // Ticker
  name: string
  image: string // URL to the image
  current_price: number
  // ... other fields from the API you might not use but exist
  [key: string]: unknown // Allows for additional properties not explicitly defined
}

export interface CoinGeckoSimplePrice {
  [coinId: string]: {
    // e.g., { "bitcoin": { "usd": 65000 } }
    [currency: string]: number
  }
}

/**
 * Interface for the props of CryptoSelector component.
 */
export interface CryptoSelectorProps {
  showConversion?: boolean
  availableFiatCurrencies?: string[]
  initialSelectedCryptoId?: string
}
