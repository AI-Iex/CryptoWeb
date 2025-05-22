const tabDataLoaded = {
    tab1: false,
    tabFavorites: false,
    tab2: false,
    tab3: false,
    tab4: false
};

async function openTab(event, tabName) {
    const tabContent = document.querySelectorAll(".tab-content");
    const tabButtons = document.querySelectorAll(".tab-button");
    const token = localStorage.getItem('access_token');
    const loginMsg = document.getElementById('login-message');
    const list = document.getElementById('favorites-list');
    const spinner = document.getElementById('favorites-list-spinner');
    const error = document.getElementById('favorites-list-error');
    const exlogin = document.getElementById('tab2-login-message');
    const catlogin = document.getElementById('tab3-login-message');
    const holdlogin = document.getElementById('tab4-login-message');

    tabContent.forEach(content => content.style.display = "none");
    tabButtons.forEach(button => button.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    if (!tabDataLoaded[tabName]) {
        switch (tabName) {
            case 'tab1':
                await fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true',
                    ['asset-list'], displayAssets, tabName, 'Crypto_Data'
                );
                break;

            case 'tabFavorites':
                // If the user is not loged in, appears the log-in menu
                if (!token) {
                    loginMsg.style.display = 'block';
                    list.style.display = 'none';
                    spinner.style.display = 'none';
                    error.style.display = 'none';
                    break;
                } 
                else
                {
                    loginMsg.style.display = 'none';
                    list.style.display = '';
                }
                
                // Recuperar favoritos del backend
                await fetchFavorites();
                if (userFavorites.length === 0) {
                    document.getElementById('favorites-list').innerHTML = '<p>No tienes criptomonedas favoritas.</p>';
                    tabDataLoaded['tabFavorites'] = true;
                    break;
                }

                // Construir URL con ids
                const ids = userFavorites.join(',');
                const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true`;
                await fetchAndDisplay(url, ['favorites-list'], displayFavoriteAssets, 'tabFavorites', 'Favorites_Data');
                break;

            case 'tab2':
                // If the user is not loged in, appears the log-in menu
                if (!token) {
                    exlogin.style.display = 'block';
                    break;
                } 
                else
                {
                    exlogin.style.display = 'none';
                }

                await fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/exchanges',
                    ['exchange-list'], displayExchanges, tabName, 'Exchanges_Data'
                );
                break;

            case 'tab3':
                 // If the user is not loged in, appears the log-in menu
                if (!token) {
                    catlogin.style.display = 'block';
                    break;
                } 
                else
                {
                    catlogin.style.display = 'none';
                }

                await fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/coins/categories',
                    ['category-list'], displayCategories, tabName, 'Categories_Data'
                );
                break;

            case 'tab4':
                 // If the user is not loged in, appears the log-in menu
                if (!token) {
                    holdlogin.style.display = 'block';
                    break;
                } 
                else
                {
                    holdlogin.style.display = 'none';
                }

                await fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin',
                    ['company-list'], displayCompanies, tabName, 'Companies_Data'
                );
                break;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tab-button").click();
    fetchData();
});

async function fetchData() {
    await Promise.all([
        fetchAndDisplay(
            'https://api.coingecko.com/api/v3/search/trending',
            ['coins-list', 'nfts-list'], displayTrends, null, 'Trending_data'
        ),
        fetchAndDisplay(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true',
            ['asset-list'], displayAssets, null, 'Crypto_Data'
        ),
    ]);
}

async function fetchAndDisplay(url, idsToToggle, displayFunction, tabName = null, localKey) {
    idsToToggle.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        toggleSpinner(id, `${id}-spinner`, true);
    });

    const localStorageKey = localKey;
    const localData = getLocalStorageData(localStorageKey);

    if (localData) {
        idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
        displayFunction(localData);
        if (tabName) tabDataLoaded[tabName] = true;
    } else {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API limit reached');
            const data = await response.json();
            idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
            displayFunction(data);
            setLocalStorageData(localStorageKey, data);
            if (tabName) tabDataLoaded[tabName] = true;
        } catch (error) {
            idsToToggle.forEach(id => {
                toggleSpinner(id, `${id}-spinner`, false);
                document.getElementById(`${id}-error`).style.display = 'block';
            });
            if (tabName) tabDataLoaded[tabName] = false;
        }
    }
}

function displayTrends(data) {
    displayTrendCoins(data.coins.slice(0, 5));
    displayTrendNfts(data.nfts.slice(0, 5));
}

function displayTrendCoins(coins) {
    const coinsList = document.getElementById('coins-list');
    coinsList.innerHTML = '';
    const table = createTable(['Coin', 'Price', 'Market Cap', 'Volume', '24h%','']);

    coins.forEach(coin => {
        const coinData = coin.item;
        const row = document.createElement('tr');
        const token = localStorage.getItem('access_token');
        row.innerHTML = `
            <td class="name-column table-fixed-column">
              <img src="${coinData.thumb}" alt="${coinData.name}"> ${coinData.name}
              <span>(${coinData.symbol.toUpperCase()})</span>
            </td>
            <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
            <td>$${coinData.data.market_cap}</td>
            <td>$${coinData.data.total_volume}</td>
            <td class="${coinData.data.price_change_percentage_24h.usd >= 0 ? 'green' : 'red'}">
              ${coinData.data.price_change_percentage_24h.usd.toFixed(2)}%
            </td>
           <td>
            ${ token
                    ? (() => {
                        const isFav = userFavorites.includes(coinData.id);
                        return `<div class="fav-container">
                                    <button 
                                        class="fav-btn" 
                                        data-coin-id="${coinData.id}" 
                                        onclick="event.stopPropagation();toggleFavorite('${coinData.id}', this)"
                                    >
                                        <i class="${isFav ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
                                    </button>
                                </div>`;
                        })()
                    : ''
                }
            </td>
        `;
        row.onclick = () => window.location.href = `pages/coin.html?coin=${coinData.id}`;
        table.appendChild(row);
    });
    coinsList.appendChild(table);
}

function displayTrendNfts(nfts) {
    const nftsList = document.getElementById('nfts-list');
    nftsList.innerHTML = '';
    const table = createTable(['NFT', 'Market', 'Price', '24h Vol', '24h%']);

    nfts.forEach(nft => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="name-column table-fixed-column"><img src="${nft.thumb}" alt="${nft.name}"> ${nft.name} <span>(${nft.symbol.toUpperCase()})</span></td>
            <td>${nft.native_currency_symbol.toUpperCase()}</td>
            <td>$${nft.data.floor_price}</td>
            <td>$${nft.data.h24_volume}</td>
            <td class="${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0 ? 'green' : 'red'}">${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change).toFixed(2)}%</td>
        `;
        table.appendChild(row);
    });
    nftsList.appendChild(table);
}

function displayAssets(data) {
    const cryptoList = document.getElementById('asset-list');
    cryptoList.innerHTML = '';
    const table = createTable(['Rank', 'Coin', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'], 1);

    const sparklineData = [];
    data.forEach(asset => {
        const row = document.createElement('tr');
        const token = localStorage.getItem('access_token');
        row.innerHTML = `
            <td class="rank">${asset.market_cap_rank}</td>
            <td class="name-column table-fixed-column">
              <img src="${asset.image}" alt="${asset.name}"> ${asset.name}
              <span>(${asset.symbol.toUpperCase()})</span>
            </td>
            <td>$${asset.current_price.toFixed(2)}</td>
            <td class="${asset.price_change_percentage_24h >= 0 ? 'green' : 'red'}">$${asset.price_change_24h.toFixed(2)}</td>
            <td class="${asset.price_change_percentage_24h >= 0 ? 'green' : 'red'}">${asset.price_change_percentage_24h.toFixed(2)}%</td>
            <td>$${asset.total_volume.toLocaleString()}</td>
            <td>$${asset.market_cap.toLocaleString()}</td>
            <td><canvas id="chart-${asset.id}" width="100" height="50"></canvas></td>
            <td>
                ${ token
                    ? (() => {
                        const isFav = userFavorites.includes(asset.id);
                        return `<div class="fav-container">
                                    <button 
                                        class="fav-btn" 
                                        data-coin-id="${asset.id}" 
                                        onclick="event.stopPropagation();toggleFavorite('${asset.id}', this)"
                                    >
                                        <i class="${isFav ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
                                    </button>
                                </div>`;
                        })()
                    : ''
                }
            </td>
        `;
        table.appendChild(row);
        sparklineData.push({
            id: asset.id,
            sparkline: asset.sparkline_in_7d.price,
            color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1] ? 'green' : 'red'
        });
        row.onclick = () => window.location.href = `pages/coin.html?coin=${asset.id}`;
    });
    cryptoList.appendChild(table);

    sparklineData.forEach(({ id, sparkline, color }) => {
        const ctx = document.getElementById(`chart-${id}`).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sparkline.map((_, index) => index),
                datasets: [{ data: sparkline, borderColor: color, fill: false, pointRadius: 0, borderWidth: 1 }]
            },
            options: {
                responsive: false,
                scales: { x: { display: false }, y: { display: false } },
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    });
}

function displayFavoriteAssets(data) {
    const container = document.getElementById('favorites-list');
    container.innerHTML = '';
    const table = createTable(['Rank', 'Coin', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'], 1);

    const sparkData = [];
    data.forEach(asset => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="rank">${asset.market_cap_rank}</td>
            <td class="name-column table-fixed-column">
              <img src="${asset.image}" alt="${asset.name}"> ${asset.name}
              <span>(${asset.symbol.toUpperCase()})</span>
            </td>
            <td>$${asset.current_price.toFixed(2)}</td>
            <td class="${asset.price_change_percentage_24h>=0?'green':'red'}">
              $${asset.price_change_24h.toFixed(2)}
            </td>
            <td class="${asset.price_change_percentage_24h>=0?'green':'red'}">
              ${asset.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${asset.total_volume.toLocaleString()}</td>
            <td>$${asset.market_cap.toLocaleString()}</td>
            <td><canvas id="fav-chart-${asset.id}" width="100" height="50"></canvas></td>
            <td>
              <div class="fav-container">
                <button class="fav-btn" data-coin-id="${asset.id}"
                        onclick="event.stopPropagation();toggleFavorite('${asset.id}', this)">
                  <i class="ri-heart-fill"></i>
                </button>
              </div>
            </td>
        `;
        row.onclick = () => window.location.href = `pages/coin.html?coin=${asset.id}`;
        table.appendChild(row);
        sparkData.push({
            id: asset.id,
            sparkline: asset.sparkline_in_7d.price,
            color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price.at(-1)?'green':'red'
        });
    });

    container.appendChild(table);
    sparkData.forEach(({id,sparkline,color}) => {
        const ctx = document.getElementById(`fav-chart-${id}`).getContext('2d');
        new Chart(ctx, {
            type:'line',
            data: { labels: sparkline.map((_,i)=>i), datasets:[{data:sparkline,borderColor:color,fill:false,pointRadius:0,borderWidth:1}] },
            options:{responsive:false,scales:{x:{display:false},y:{display:false}},plugins:{legend:{display:false},tooltip:{enabled:false}}}
        });
    });
}

function displayExchanges(data) {
    const exchangeList = document.getElementById('exchange-list');
    exchangeList.innerHTML = '';
    const table = createTable(['Rank', 'Exchange', 'Trust Score', '24h Trade', '24h Trade (Normal)', 'Country', 'Website', 'Year'], 1);

    data = data.slice(0, 20);

    data.forEach(exchange => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="rank">${exchange.trust_score_rank}</td>
            <td class="name-column table-fixed-column"><img src="${exchange.image}" alt="${exchange.name}"> ${exchange.name}</td>
            <td>${exchange.trust_score}</td>
            <td>$${exchange.trade_volume_24h_btc.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} BTC</td>
            <td>$${exchange.trade_volume_24h_btc_normalized.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} BTC</td>
            <td class="name-column">${exchange.country || 'N/A'}</td>
            <td class="name-column">${exchange.url}</td>
            <td>${exchange.year_established || 'N/A'}</td>
        `;
        table.appendChild(row);
    });
    exchangeList.appendChild(table);
}

function displayCategories(data) {
    const catagoriesList = document.getElementById('category-list');
    catagoriesList.innerHTML = '';
    const table = createTable(['Top Coins', 'Category', 'Market Cap', '24h Market Cap', '24h Volume'], 1);

    data = data.slice(0, 20);

    data.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.top_3_coins.map(coin => `<img src="${coin}" alt="coin">`).join('')}</td>
            <td class="name-column table-fixed-column">${category.name}</td>
            <td>$${category.market_cap ? category.market_cap.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : 'N/A'}</td>
            <td class="${category.market_cap_change_24h >= 0 ? 'green' : 'red'}">${category.market_cap_change_24h ? category.market_cap_change_24h.toFixed(3) : "0"}%</td>
            <td>$${category.volume_24h ? category.volume_24h.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : "N/A"}</td>
        `;
        table.appendChild(row);
    });
    catagoriesList.appendChild(table);
}

function displayCompanies(data) {
    const companyList = document.getElementById('company-list');
    companyList.innerHTML = '';
    const table = createTable(['Company', 'Total BTC', 'Entry Value', 'Total Current Value', 'Total %']);

    data.companies.forEach(company => {
        const row = document.createElement('tr');
        row.innerHTML = `
           <td class="name-column table-fixed-column">${company.name}</td>
            <td>${company.total_holdings}</td>
            <td>${company.total_entry_value_usd}</td>
            <td>${company.total_current_value_usd}</td>
            <td class="${company.percentage_of_total_supply >= 0 ? 'green' : 'red'}">${company.percentage_of_total_supply}%</td>
        `;
        table.appendChild(row);
    });
    companyList.appendChild(table);
}

// Control de las criptomendas en favoritos

document.addEventListener("DOMContentLoaded", async () => {
    // 1.1) Traer los favoritos del backend y actualizar userFavorites[]
    await fetchFavorites();
    // 1.2) Abrir la primera pestaña (dispara displayAssets con userFavorites ya cargado)
    document.querySelector(".tab-button").click();
    // 1.3) Y luego el resto de fetches
    fetchData();
});

const API_URL = 'http://localhost:8000/favorites/';
let userFavorites = [];

// 1) fetchFavorites: actualiza userFavorites y los iconos
async function fetchFavorites() {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}?_=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const list = await res.json();
        userFavorites = list.map(f => f.coin_id);
        document.querySelectorAll('.fav-btn').forEach(btn => {
            const id = btn.dataset.coinId;
            btn.innerHTML = userFavorites.includes(id)
                ? '<i class="ri-heart-fill"></i>'
                : '<i class="ri-heart-line"></i>';
        });
    } catch {
        console.error('Error cargando favoritos');
    }
}

// 2) toggleFavorite: invalidar cache de favoritos y recargar si estamos en la pestaña
async function toggleFavorite(coinId, button) {
    // Si necesitas stopPropagation en coin.html, lo dejas inline:
    // onclick="event.stopPropagation(); toggleFavorite('…', this)"
    
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Debes iniciar sesión.');
        return;
    }

    const isFav = userFavorites.includes(coinId);
    const method = isFav ? 'DELETE' : 'POST';
    const url = isFav ? `${API_URL}${coinId}` : API_URL;

    let response;
    try {
        response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: !isFav ? JSON.stringify({ coin_id: coinId }) : null
        });
    } catch (networkError) {
        console.error('Fetch error:', networkError);
        alert(isFav ? 'Error eliminando favorito' : 'Error guardando favorito');
        return;
    }

    if (!response.ok) {
        console.error('Server responded with', response.status);
        alert(isFav ? 'Error eliminando favorito' : 'Error guardando favorito');
        return;
    }

    // --- A partir de aquí, la petición fue OK ---
    try {
        // 1) Refrescar lista y cache
        await fetchFavorites();
        localStorage.removeItem('Favorites_Data');
        tabDataLoaded['tabFavorites'] = false;

        // 2) Si estás en la pestaña de favorites, recárgala
        if (document.getElementById('tabFavorites').style.display === 'block') {
            document.querySelector('.tab-button.active').click();
        }

        // 3) Actualizar icono en esta vista
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isFav ? 'ri-heart-line' : 'ri-heart-fill';
        }
    } catch (uiError) {
        // Aquí no mostramos alerta: sólo registro para debug
        console.error('UI update error:', uiError);
    }
}

