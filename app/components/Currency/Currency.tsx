import React, { useState, useEffect } from 'react'
import { X, ArrowRightLeft, DollarSign, RefreshCw } from 'lucide-react'

interface CurrencyProps {
  isOpen: boolean
  onClose: () => void
}

interface CurrencyRate {
  code: string
  name: string
  symbol: string
  rate: number // Rate relative to USD
}

interface ApiResponse {
  result: string
  rates: Record<string, number>
  base_code: string
  time_last_update_utc: string
}

export function Currency({ isOpen, onClose }: CurrencyProps) {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('INR')
  const [convertedAmount, setConvertedAmount] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isUsingLiveRates, setIsUsingLiveRates] = useState(false)

  // Fallback exchange rates as of December 31, 2024 (relative to USD)
  const fallbackCurrencies: CurrencyRate[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.9610 }, // 1 USD = 0.9610 EUR
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7970 }, // 1 USD = 0.7970 GBP
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 85.38 }, // 1 USD = 85.38 INR
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 156.85 }, // 1 USD = 156.85 JPY
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.438 }, // 1 USD = 1.438 CAD
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.612 }, // 1 USD = 1.612 AUD
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.905 }, // 1 USD = 0.905 CHF
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.299 }, // 1 USD = 7.299 CNY
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 11.006 }, // 1 USD = 11.006 SEK
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.781 }, // 1 USD = 1.781 NZD
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 20.704 }, // 1 USD = 20.704 MXN
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.363 }, // 1 USD = 1.363 SGD
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.766 }, // 1 USD = 7.766 HKD
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 11.322 }, // 1 USD = 11.322 NOK
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 7.17 }, // 1 USD = 7.17 DKK
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', rate: 4.108 }, // 1 USD = 4.108 PLN
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 23.538 }, // 1 USD = 23.538 CZK
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 395.32 }, // 1 USD = 395.32 HUF
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 108.0 }, // 1 USD = 108.0 RUB
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 6.184 }, // 1 USD = 6.184 BRL
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.85 }, // 1 USD = 18.85 ZAR
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1473.27 }, // 1 USD = 1473.27 KRW
    { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 34.33 }, // 1 USD = 34.33 THB
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.468 }, // 1 USD = 4.468 MYR
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 58.025 }, // 1 USD = 58.025 PHP
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 16067.13 }, // 1 USD = 16067.13 IDR
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 35.365 }, // 1 USD = 35.365 TRY
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', rate: 3.647 }, // 1 USD = 3.647 ILS
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.673 } // 1 USD = 3.673 AED
  ]

  const [currencies, setCurrencies] = useState<CurrencyRate[]>(fallbackCurrencies)

  // Fetch live exchange rates from free API
  const fetchLiveRates = async () => {
    setIsLoading(true)
    try {
      // Using exchangerate-api.com - completely free, no API key required
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data: ApiResponse = await response.json()
      
      if (data.result === 'success' || data.rates) {
        // Update currencies with live rates while preserving names and symbols from fallback
        const updatedCurrencies = fallbackCurrencies.map(fallbackCurrency => {
          const liveRate = data.rates[fallbackCurrency.code]
          return {
            ...fallbackCurrency,
            rate: liveRate || fallbackCurrency.rate // Use live rate if available, otherwise keep fallback
          }
        })

        setCurrencies(updatedCurrencies)
        setIsUsingLiveRates(true)
        setLastUpdated(new Date().toLocaleString())
        
        console.log('✅ Live exchange rates updated successfully')
      } else {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch live rates, using fallback rates:', error)
      setCurrencies(fallbackCurrencies)
      setIsUsingLiveRates(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch live rates when component opens
  useEffect(() => {
    if (isOpen && currencies === fallbackCurrencies) {
      fetchLiveRates()
    }
  }, [isOpen])

  const getCurrency = (code: string) => currencies.find(c => c.code === code)

  const convertCurrency = () => {
    const fromRate = getCurrency(fromCurrency)?.rate || 1
    const toRate = getCurrency(toCurrency)?.rate || 1
    const numAmount = parseFloat(amount) || 0

    // Convert to USD first, then to target currency
    const usdAmount = numAmount / fromRate
    const converted = usdAmount * toRate

    setConvertedAmount(converted.toFixed(2))
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatCurrencyDisplay = (currencyCode: string, amount: string) => {
    const currency = getCurrency(currencyCode)
    if (!currency) return amount
    
    return `${currency.symbol} ${amount}`
  }

  // Convert whenever amount or currencies change
  useEffect(() => {
    convertCurrency()
  }, [amount, fromCurrency, toCurrency, currencies])

  // Predefined quick amounts
  const quickAmounts = ['1', '10', '100', '1000', '10000']

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-2 sm:p-4 py-4 sm:py-8">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto mt-8 sm:mt-16">
          {/* Header */}
          <div className="bg-gray-800 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white" />
                <h2 className="text-lg font-medium text-white">Currency Converter</h2>
                {isUsingLiveRates && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLiveRates}
                  disabled={isLoading}
                  className="text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                  aria-label="Refresh exchange rates"
                  title="Refresh rates"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Close currency converter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Converter Body */}
          <div className="p-6">
            {/* Rate Status */}
            <div className="mb-4 text-xs text-center">
              {isLoading ? (
                <span className="text-blue-500">🔄 Updating exchange rates...</span>
              ) : isUsingLiveRates ? (
                <span className="text-green-600">
                  ✅ Live rates {lastUpdated && `(Updated: ${lastUpdated})`}
                </span>
              ) : (
                <span className="text-amber-600">⚠️ Using fallback rates (Dec 31, 2024)</span>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="0"
                step="any"
              />
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
              {/* From Currency */}
              <div className="relative">
                <label htmlFor="from-currency" className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <select
                  id="from-currency"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px'
                  }}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapCurrencies}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Swap currencies"
                >
                  <ArrowRightLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* To Currency */}
              <div className="relative">
                <label htmlFor="to-currency" className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <select
                  id="to-currency"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px'
                  }}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  {formatCurrencyDisplay(fromCurrency, amount)}
                </div>
                <div className="text-sm text-gray-400 mb-2">=</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyDisplay(toCurrency, convertedAmount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exchange Rate Info */}
              <div className="text-center text-xs text-gray-500">
                <p>1 {fromCurrency} = {(getCurrency(toCurrency)?.rate! / getCurrency(fromCurrency)?.rate!).toFixed(4)} {toCurrency}</p>
                <p className="mt-1">
                  {isUsingLiveRates 
                    ? 'Live exchange rates from exchangerate-api.com' 
                    : 'Fallback rates for reference only'
                  }
                </p>
              </div>

              {/* Popular Conversions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Conversions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { from: 'USD', to: 'INR' },
                    { from: 'EUR', to: 'USD' },
                    { from: 'GBP', to: 'USD' },
                    { from: 'USD', to: 'JPY' }
                  ].map((conversion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFromCurrency(conversion.from)
                        setToCurrency(conversion.to)
                      }}
                      className="px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      {conversion.from} → {conversion.to}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 