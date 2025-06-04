document.addEventListener('DOMContentLoaded', () => {
  const tabs           = document.querySelectorAll('.tab-btn');
  const tabContents    = document.querySelectorAll('.tab-content');
  const cryptoInput    = document.getElementById('crypto-name');
  const portfolioForm  = document.getElementById('portfolio-form');
  const portfolioTable = document.querySelector('.portfolio-table tbody');
  const modeButtons    = document.querySelectorAll('.mode-btn');
  const investmentGrp  = document.querySelector('.investment-mode');
  const quantityGrp    = document.querySelector('.quantity-mode');
  const token          = checkAccessTokenValidity();
  let currentMode      = 'investment';
  let portfolioData    = [];
  let topCoins         = JSON.parse(localStorage.getItem('topCoins')) || [];
  let apiLimitReached  = false;
  let cachedPrices     = {};


  // Función para cambiar de pestaña
  function switchTab(selectedTab) {
      // Remover clase active de todos los tabs y contenidos
      tabs.forEach(tab => tab.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Añadir clase active al tab seleccionado y su contenido
      selectedTab.classList.add('active');
      const targetContent = document.getElementById(selectedTab.dataset.tab);
      targetContent.classList.add('active');
  }

  // Event listeners para los tabs
  tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab));
  });

  // Autocomplete container
  const suggestionsBox = document.createElement('div');
  suggestionsBox.className = 'autocomplete-suggestions';
  cryptoInput.parentNode.insertBefore(suggestionsBox, cryptoInput.nextSibling);

  // Mode switching (investment / quantity)
  function switchMode(mode) {
    currentMode = mode;
    modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    investmentGrp.classList.toggle('hidden', mode !== 'investment');
    quantityGrp.classList.toggle('hidden', mode !== 'quantity');
    investmentGrp.querySelectorAll('input').forEach(i => {
      i.required = mode === 'investment';
      i.disabled = mode !== 'investment';
    });
    quantityGrp.querySelectorAll('input').forEach(i => {
      i.required = mode === 'quantity';
      i.disabled = mode !== 'quantity';
    });
  }
  modeButtons.forEach(btn => {
    btn.type = 'button';
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });
  
  switchMode(currentMode);

  // Autocomplete suggestions
  function showSuggestions(coins) {
    suggestionsBox.innerHTML = '';
    if (!coins || coins.length === 0) {
      suggestionsBox.innerHTML = '<div class="suggestion-item">No results found</div>';
    } else {
        coins.slice(0, 5).forEach(coin => {
          const div = document.createElement('div');
          div.className = 'suggestion-item';
          div.innerHTML = `
            <img src="${coin.thumb}" alt="${coin.name}">
            <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
          `;
          div.addEventListener('click', () => {
            cryptoInput.value = coin.id;
            suggestionsBox.classList.remove('visible');
          });
        suggestionsBox.appendChild(div);
      });
    }
    suggestionsBox.classList.add('visible');
  }
  cryptoInput.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 1 || !topCoins.length) {
      suggestionsBox.classList.remove('visible');
      return;
    }
    const filtered = topCoins.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
    showSuggestions(filtered);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-suggestions') && e.target !== cryptoInput) {
      suggestionsBox.classList.remove('visible');
    }
  });

  // Fetch prices helper
  async function fetchPrices(ids) {
    if (apiLimitReached) return {};
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`
      );
      if (res.status === 429) throw new Error('API_LIMIT');
      return await res.json();
    } catch (err) {
      if (err.message === 'API_LIMIT') {
        alert('API limit reached. Please try again later.');
        apiLimitReached = true;
      } else {
        console.error('Error fetching prices:', err);
      }
      return {};
    }
  }

  // Update table display
  async function updatePortfolioDisplay(fetchPricesFlag = true) {
    portfolioTable.innerHTML = '';
    let totalProfit = 0;

    if (!portfolioData.length) {
      document.getElementById('portfolio-total').textContent = '0.00 €';
      return;
    }

    if (fetchPricesFlag) {
      const ids = portfolioData.map(e => e.coin_id).join(',');
      cachedPrices = await fetchPrices(ids);
    }

    const priceError = (!Object.keys(cachedPrices).length && !apiLimitReached);

    portfolioData.forEach((entry, idx) => {
      const price = priceError ? 0 : (cachedPrices[entry.coin_id]?.eur || 0);
      const qty = entry.mode === 'investment'
        ? entry.investment / entry.purchase_price
        : entry.quantity;
      const currentValue = price * qty;
      const profit = currentValue - entry.investment;
      const profitPercent = entry.investment ? (profit / entry.investment) * 100 : 0;
      totalProfit += profit;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <img
            src="${entry.thumb || ''}"
            alt="${entry.name}"
            class="crypto-logo"
          >
          <span class="crypto-name">${entry.name}</span>
        </td>
        <td>${entry.purchase_price.toFixed(5)} €</td>
        <td>${entry.investment.toFixed(2)} €</td>
        <td>${priceError ? 'N/A' : price.toFixed(5) + ' €'}</td>
        <td>${priceError ? 'N/A' : currentValue.toFixed(2) + ' €'}</td>
        <td class="${profit >= 0 ? 'performance-positive' : 'performance-negative'}">
          ${priceError ? 'N/A' : `${profit.toFixed(2)} € (${profitPercent.toFixed(2)}%)`}
        </td>
        <td>
          <button class="delete-btn" data-coin="${entry.coin_id}" type="button">
            <i class="ri-delete-bin-line"></i>
          </button>
        </td>
      `;
      portfolioTable.appendChild(row);
    });

    const totalEl = document.getElementById('portfolio-total');
    totalEl.textContent = `${totalProfit.toFixed(2)} €`;
    totalEl.classList.toggle('performance-negative', totalProfit < 0);
    totalEl.classList.toggle('performance-positive', totalProfit >= 0);
  }

  // Load initial portfolios from backend
  async function loadPortfolios() {
    try {
      const res = await fetch(`${API_BASE_URL}/portfolios/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load portfolios');
      const data = await res.json();
      // enrich with meta from topCoins
      portfolioData = data.map(p => {
        const meta = topCoins.find(c => c.id === p.coin_id) || {};
        return {
          ...p,
          name: meta.name || p.coin_id,
          thumb: meta.thumb || '',
          mode: 'investment',
          quantity: p.investment / p.purchase_price
        };
      });
      await updatePortfolioDisplay(true);
    } catch (err) {
      console.error(err);
    }
  }

  // Form submit: add a coin
  portfolioForm.addEventListener('submit', async e => {
    e.preventDefault();
    const cryptoId = cryptoInput.value.trim().toLowerCase();
    if (!cryptoId) {
      alert('You must select a cryptocurrency.');
      return;
    }

    // Retrieve or search coin meta
    let coin = topCoins.find(c => c.id === cryptoId);
    if (!coin) {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(cryptoId)}`);
        const { coins } = await res.json();
        coin = coins[0] && { id: coins[0].id, name: coins[0].name, symbol: coins[0].symbol, thumb: coins[0].thumb };
        if (!coin) return alert('Cryptocurrency not found.');
        topCoins.push(coin);
        localStorage.setItem('topCoins', JSON.stringify(topCoins));
      } catch { return alert('Error searching for cryptocurrency.'); }
    }

    // Read inputs
    let price, investment, quantity;
    if (currentMode === 'investment') {
      price      = parseFloat(document.getElementById('purchase-price').value);
      investment = parseFloat(document.getElementById('investment').value);
      quantity   = investment / price;
    } else {
      price      = parseFloat(document.getElementById('average-price').value);
      quantity   = parseFloat(document.getElementById('crypto-amount').value);
      investment = price * quantity;
    }
    if (isNaN(price) || isNaN(investment) || isNaN(quantity)) {
      return alert('Correctly fill the numerical fields.');
    }

    // Persist to backend
    try {
      const res = await fetch(`${API_BASE_URL}/portfolios/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({coin_id: coin.id, purchase_price: price, investment })
      });
      if (!res.ok) throw new Error('Error saving portfolio');
      const saved = await res.json();
      // enrich and add
      portfolioData.push({
        ...saved,
        name: coin.name,
        thumb: coin.thumb,
        mode: currentMode,
        quantity
      });
      await updatePortfolioDisplay(true);
      portfolioForm.reset();
      switchMode(currentMode);
    } catch (err) {
      console.error(err);
      alert('Investment could not be saved');
    }
  });

  // Delete handler
  portfolioTable.addEventListener('click', async e => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    const coinId = btn.dataset.coin;
    try {
      const res = await fetch(`${API_BASE_URL}/portfolios/${coinId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      portfolioData = portfolioData.filter(p => p.coin_id !== coinId);
      await updatePortfolioDisplay(false);
    } catch (err) {
      console.error(err);
      alert('Investment could not be eliminated');
    }
  });

  // Initial load of coins and portfolios
  (async function init() {
    if (!topCoins.length) {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?' +
          'vs_currency=eur&order=market_cap_desc&per_page=100&page=1'
        );
        const data = await res.json();
        topCoins = data.map(c => ({ id: c.id, name: c.name, symbol: c.symbol, thumb: c.image }));
        localStorage.setItem('topCoins', JSON.stringify(topCoins));
      } catch (err) {
        console.error('Error fetching top coins:', err);
        apiLimitReached = true;
      }
    }
    await loadPortfolios();
  })();
});
