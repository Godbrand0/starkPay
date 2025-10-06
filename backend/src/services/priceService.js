const axios = require('axios');

// Pragma API Configuration
const PRAGMA_API_KEY = process.env.PRAGMA_API_KEY || 'fVgkdq4oYA6FfN5megaTs1Iwu8YusvRH';
const PRAGMA_BASE_URL = 'https://api.production.pragma.build/node/v1';

// Cache for price data (prevent too many API calls)
const priceCache = {
  data: null,
  timestamp: null,
  cacheDuration: 60000, // 1 minute cache
};

/**
 * Fetch STRK/USD price from Pragma API
 */
async function fetchStrkUsdFromPragma() {
  try {
    const response = await axios.get(`${PRAGMA_BASE_URL}/prices/latest`, {
      params: {
        pair: 'STRK-USD',
      },
      headers: {
        'X-API-KEY': PRAGMA_API_KEY,
      },
    });

    if (response.data && response.data.price) {
      return parseFloat(response.data.price);
    }

    throw new Error('Invalid response from Pragma API');
  } catch (error) {
    console.error('Error fetching STRK/USD from Pragma:', error.message);
    throw error;
  }
}

/**
 * Fetch USD/NGN rate from a forex API (using exchangerate-api.com as fallback)
 */
async function fetchUsdNgnRate() {
  try {
    // Using free forex API (you can replace with a paid service for production)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');

    if (response.data && response.data.rates && response.data.rates.NGN) {
      return parseFloat(response.data.rates.NGN);
    }

    // Fallback static rate if API fails (approximate)
    console.warn('Using fallback USD/NGN rate');
    return 1550; // Approximate NGN per USD
  } catch (error) {
    console.error('Error fetching USD/NGN rate:', error.message);
    // Return approximate fallback rate
    return 1550;
  }
}

/**
 * Get all price rates with caching
 */
async function getPriceRates() {
  const now = Date.now();

  // Return cached data if still valid
  if (priceCache.data && priceCache.timestamp && (now - priceCache.timestamp < priceCache.cacheDuration)) {
    return priceCache.data;
  }

  try {
    // Fetch both rates in parallel
    const [strkUsd, usdNgn] = await Promise.all([
      fetchStrkUsdFromPragma(),
      fetchUsdNgnRate(),
    ]);

    // Calculate derived rates
    const strkNgn = strkUsd * usdNgn;

    const rates = {
      STRK_USD: strkUsd,
      USD_NGN: usdNgn,
      STRK_NGN: strkNgn,
      timestamp: new Date().toISOString(),
    };

    // Update cache
    priceCache.data = rates;
    priceCache.timestamp = now;

    return rates;
  } catch (error) {
    console.error('Error fetching price rates:', error);

    // Return cached data if available, even if expired
    if (priceCache.data) {
      console.warn('Returning stale cached price data');
      return priceCache.data;
    }

    // Last resort: return approximate fallback rates
    return {
      STRK_USD: 0.45, // Approximate
      USD_NGN: 1550,
      STRK_NGN: 697.5,
      timestamp: new Date().toISOString(),
      fallback: true,
    };
  }
}

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency (STRK, USD, NGN)
 * @param {string} toCurrency - Target currency (STRK, USD, NGN)
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getPriceRates();

  // Convert to USD first (as intermediate)
  let amountInUsd;

  switch (fromCurrency.toUpperCase()) {
    case 'USD':
      amountInUsd = amount;
      break;
    case 'STRK':
      amountInUsd = amount * rates.STRK_USD;
      break;
    case 'NGN':
      amountInUsd = amount / rates.USD_NGN;
      break;
    default:
      throw new Error(`Unsupported currency: ${fromCurrency}`);
  }

  // Convert from USD to target currency
  let result;

  switch (toCurrency.toUpperCase()) {
    case 'USD':
      result = amountInUsd;
      break;
    case 'STRK':
      result = amountInUsd / rates.STRK_USD;
      break;
    case 'NGN':
      result = amountInUsd * rates.USD_NGN;
      break;
    default:
      throw new Error(`Unsupported currency: ${toCurrency}`);
  }

  return result;
}

/**
 * Get conversion for all currencies from a given amount
 */
async function getAllConversions(amount, fromCurrency) {
  const rates = await getPriceRates();

  const conversions = {
    rates,
    conversions: {},
  };

  const currencies = ['STRK', 'USD', 'NGN'];

  for (const currency of currencies) {
    if (currency !== fromCurrency.toUpperCase()) {
      conversions.conversions[currency] = await convertCurrency(amount, fromCurrency, currency);
    }
  }

  conversions.conversions[fromCurrency.toUpperCase()] = amount;

  return conversions;
}

module.exports = {
  getPriceRates,
  convertCurrency,
  getAllConversions,
  fetchStrkUsdFromPragma,
  fetchUsdNgnRate,
};
