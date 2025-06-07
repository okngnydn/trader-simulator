// --- COINGECKO: Load crypto symbol-to-ID mapping ---
let coinMap = {};

fetch("coins.json")
  .then(res => res.json())
  .then(data => {
    coinMap = data;
  })
  .catch(() => {
    console.error("Failed to load coins.json");
  });

// --- Fetch crypto price using CoinGecko ---
async function fetchCryptoPrice(symbol) {
  const id = coinMap[symbol.toUpperCase()];
  if (!id) {
    throw new Error(`Unknown crypto symbol: ${symbol}`);
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data[id] || !data[id].usd) {
    throw new Error("Price fetch failed");
  }

  return data[id].usd;
}

// --- Fetch stock price using Yahoo Finance ---
async function fetchStockPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
  const res = await fetch(url);
  const data = await res.json();

  const result = data?.quoteResponse?.result?.[0];
  if (!result || !result.regularMarketPrice) {
    throw new Error("Invalid stock symbol or price unavailable");
  }

  return result.regularMarketPrice;
}

// --- Unified price fetcher ---
async function fetchPrice(symbol, market) {
  if (market === "crypto") {
    return await fetchCryptoPrice(symbol);
  } else {
    return await fetchStockPrice(symbol);
  }
}
