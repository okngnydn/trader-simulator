// DOM Elements
const balanceEl = document.getElementById("balance-value");
const marketSelect = document.getElementById("market");
const symbolInput = document.getElementById("symbol");
const amountInput = document.getElementById("amount");
const buyBtn = document.getElementById("buy-btn");
const sellBtn = document.getElementById("sell-btn");
const messageEl = document.getElementById("message");
const portfolioTable = document.querySelector("#portfolio-table tbody");
const historyEl = document.getElementById("history");

// LocalStorage Keys
const STORAGE_KEYS = {
  BALANCE: "sim_balance",
  PORTFOLIO: "sim_portfolio",
  HISTORY: "sim_history"
};

// App State
let balance = parseFloat(localStorage.getItem(STORAGE_KEYS.BALANCE)) || 10000;
let portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO)) || {};
let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];

// Update balance UI
function updateBalanceUI() {
  balanceEl.textContent = balance.toFixed(2);
}

// Update portfolio UI
function updatePortfolioUI() {
  portfolioTable.innerHTML = "";
  Object.entries(portfolio).forEach(([symbol, amount]) => {
    fetchPrice(symbol, marketSelect.value).then(price => {
      const value = amount * price;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${symbol}</td>
        <td>${amount}</td>
        <td>$${value.toFixed(2)}</td>
      `;
      portfolioTable.appendChild(row);
    });
  });
}

// Update history UI
function updateHistoryUI() {
  historyEl.innerHTML = "";
  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = `[${item.date}] ${item.type.toUpperCase()} ${item.amount} ${item.symbol} @ $${item.price}`;
    historyEl.appendChild(li);
  });
}

// Save to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEYS.BALANCE, balance);
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// Handle Buy
buyBtn.addEventListener("click", () => {
  const symbol = symbolInput.value.trim().toUpperCase();
  const amount = parseFloat(amountInput.value);
  const market = marketSelect.value;

  if (!symbol || isNaN(amount) || amount <= 0) {
    showMessage("Please enter valid symbol and amount.");
    return;
  }

  fetchPrice(symbol, market).then(price => {
    const cost = amount * price;
    if (cost > balance) {
      showMessage("Insufficient balance.");
      return;
    }

    // Update state
    balance -= cost;
    portfolio[symbol] = (portfolio[symbol] || 0) + amount;
    history.push({
      date: new Date().toLocaleString(),
      type: "buy",
      symbol,
      amount,
      price
    });

    saveState();
    refreshUI();
    showMessage(`Bought ${amount} ${symbol} for $${cost.toFixed(2)}.`);
  }).catch(() => showMessage("Price fetch failed. Check the symbol."));
});

// Handle Sell
sellBtn.addEventListener("click", () => {
  const symbol = symbolInput.value.trim().toUpperCase();
  const amount = parseFloat(amountInput.value);
  const market = marketSelect.value;

  if (!symbol || isNaN(amount) || amount <= 0) {
    showMessage("Please enter valid symbol and amount.");
    return;
  }

  if (!portfolio[symbol] || portfolio[symbol] < amount) {
    showMessage("Not enough assets to sell.");
    return;
  }

  fetchPrice(symbol, market).then(price => {
    const income = amount * price;

    // Update state
    portfolio[symbol] -= amount;
    if (portfolio[symbol] <= 0) delete portfolio[symbol];
    balance += income;
    history.push({
      date: new Date().toLocaleString(),
      type: "sell",
      symbol,
      amount,
      price
    });

    saveState();
    refreshUI();
    showMessage(`Sold ${amount} ${symbol} for $${income.toFixed(2)}.`);
  }).catch(() => showMessage("Price fetch failed. Check the symbol."));
});

// Show message
function showMessage(msg) {
  messageEl.textContent = msg;
  setTimeout(() => {
    messageEl.textContent = "";
  }, 3000);
}

// Refresh UI
function refreshUI() {
  updateBalanceUI();
  updatePortfolioUI();
  updateHistoryUI();
}

// Init
refreshUI();
