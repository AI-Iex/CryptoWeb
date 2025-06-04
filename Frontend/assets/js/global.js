// Elementos globales para mostrar datos de mercado
const coinsCount = document.getElementById('coins-count');
const exchangesCount = document.getElementById('exchanges-count');
const marketCap = document.getElementById('marketCap');
const marketCapChangeElement = document.getElementById('marketCapChange');
const volume = document.getElementById('volume');
const dominance = document.getElementById('dominance');


// Evento window.load: ocultar preloader y mostrar contenido principal
window.addEventListener('load', () => {
  const main_content = document.getElementById('main-content');
  document.getElementById('preloader').style.display = 'none';
  if(main_content){main_content.style.display = 'block';}
});

// DOMContentLoaded: inicialización de UI y lógica
document.addEventListener('DOMContentLoaded', () => {

  // 1 Tema (claro/oscuro) y toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Recuperar tema guardado en localStorage (si existe)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.id = savedTheme;
    updateIcon(savedTheme);
  }

  // Al hacer clic en el botón de tema, alternar entre light-theme y dark-theme
  themeToggle.addEventListener('click', () => {
    if (body.id === 'light-theme') {
      body.id = 'dark-theme';
      localStorage.setItem('theme', 'dark-theme');
      updateIcon('dark-theme');
    } else {
      body.id = 'light-theme';
      localStorage.setItem('theme', 'light-theme');
      updateIcon('light-theme');
    }
    // Si hay alguna función initializeWidget definida (por ejemplo, para gráficos), volverla a inicializar
    if (typeof initializeWidget === 'function') {
      initializeWidget();
    }
  });

  // Función para actualizar el icono del botón según el tema actual
  function updateIcon(currentTheme) {
    if (currentTheme === 'light-theme') {
      themeToggle.classList.remove('ri-moon-line');
      themeToggle.classList.add('ri-sun-line');
    } else {
      themeToggle.classList.remove('ri-sun-line');
      themeToggle.classList.add('ri-moon-line');
    }
  }

  // 2 Formulario de búsqueda
  const form = document.getElementById('searchForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    // Redirigir a search.html con el parámetro query
    window.location.href = `search.html?query=${query}`;
  });

  // 3 Menú móvil (abrir/cerrar)
  const openMenuBtn = document.getElementById('openMenu');
  const overlay = document.querySelector('.overlay');
  const closeMenuBtn = document.getElementById('closeMenu');

  openMenuBtn.addEventListener('click', () => {
    overlay.classList.add('show');
  });
  closeMenuBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
  });
  // Si se hace clic fuera del menú (en el overlay), cerrarlo
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('show');
    }
  });

  // 4 Obtener y mostrar datos globales de mercado
  fetchGlobal();

  // 5 Redirección al login desde el menú de usuario
  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
    userMenu.addEventListener('click', () => {
      // Si estamos en index.html o en la raíz, ir a pages/login.html; si no, a login.html en un nivel arriba
      if (
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname === '/index'
      ) {
        window.location.href = 'pages/login.html';
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  // 6 Menú perfil de usuario (autenticación y logout)
  const authDropdown = document.getElementById('authDropdown');
  const logoutBtn = document.getElementById('logout-btn');
  const userAvatar = document.querySelector('.user-avatar');
  const userLeftSections = document.querySelectorAll('.user-leftsection');

  // Verificar si el usuario está autenticado para mostrar/ocultar secciones
  function checkAuth() {
    const token = checkAccessTokenValidity();
    if (token) {
      userMenu?.classList.add('hidden');
      authDropdown?.classList.add('visible');
      userLeftSections.forEach(el => el.classList.remove('hidden'));
    } else {
      userMenu?.classList.remove('hidden');
      authDropdown?.classList.remove('visible');
      userLeftSections.forEach(el => el.classList.add('hidden'));
    }
  }

  // Función para cerrar sesión y redirigir al index
  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('chat_history');
    checkAuth();
    const isIndexPage =
      window.location.pathname.endsWith('/index.html') ||
      window.location.pathname.endsWith('/');
    window.location.href = isIndexPage ? 'index.html' : '../index.html';
  }

  // Al hacer clic en el avatar, alternar la visibilidad del dropdown
  userAvatar?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.dropdown-menu')?.classList.toggle('active');
  });

  // Si se hace clic fuera del dropdown, cerrarlo
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.auth-dropdown')) {
      document.querySelector('.dropdown-menu')?.classList.remove('active');
    }
  });

  // Evento para el botón de Logout
  logoutBtn?.addEventListener('click', handleLogout);

  // Verificar estado inicial de autenticación
  checkAuth();

  // 7 Toggle de chatbot flotante
  const toggleButton = document.querySelector('.floating-sparkles');
  const chatbot = document.getElementById('floating-chatbot');

  if(toggleButton && chatbot)
  {
    // Mostrar/ocultar chatbot al hacer clic o presionar tecla Enter/Espacio en el botón
    toggleButton?.addEventListener('click', () => {
      chatbot.classList.toggle('active');
    });
    toggleButton?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        chatbot.classList.toggle('active');
      }
    });

    // Botón para cerrar el chatbot
    const closeChatbotBtn = document.getElementById('close-chatbot');
    closeChatbotBtn?.addEventListener('click', () => {
      chatbot.classList.remove('active');
    });

    // Según si hay token de usuario, mostrar u ocultar el botón del chatbot
    const token = checkAccessTokenValidity();
    if (token) {
      toggleButton.style.display = 'flex';
    } else {
      toggleButton.style.display = 'none';
    }
  }


});

// Funciones auxiliares independientes del DOMContentLoaded

/**
 * getLocalStorageData:
 * - Obtiene datos de localStorage guardados bajo 'key'
 * - Valida que no hayan pasado más de 5 minutos (300000 ms)
 * - Si han pasado > 5 minutos, borra la entrada y devuelve null
 * - Si no, devuelve el campo .data almacenado
 */
function getLocalStorageData(key) {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null;

  const parsedData = JSON.parse(storedData);
  const currentTime = Date.now();
  if (currentTime - parsedData.timestamp > 300000) {
    localStorage.removeItem(key);
    return null;
  }
  return parsedData.data;
}

/**
 * setLocalStorageData:
 * - Guarda en localStorage bajo 'key' un objeto con:
 *     { timestamp: <tiempo actual>, data: <data> }
 */
function setLocalStorageData(key, data) {
  const storedData = {
    timestamp: Date.now(),
    data: data
  };
  localStorage.setItem(key, JSON.stringify(storedData));
}

/**
 * fetchGlobal:
 * - Intenta obtener datos globales del mercado desde localStorage
 * - Si no hay datos o expiraron, hace fetch a la API de CoinGecko
 * - Al obtener datos, llama a displayGlobalData y guarda en localStorage
 * - En caso de error, muestra 'N/A' en todos los elementos
 */
function fetchGlobal() {
  const localStorageKey = 'Global_Data';
  const localData = getLocalStorageData(localStorageKey);

  if (localData) {
    displayGlobalData(localData);
  } else {
    const options = { method: 'GET', headers: { accept: 'application/json' } };

    fetch('https://api.coingecko.com/api/v3/global', options)
      .then(response => response.json())
      .then(data => {
        const globalData = data.data;
        displayGlobalData(globalData);
        setLocalStorageData(localStorageKey, globalData);
      })
      .catch(error => {
        // En caso de error, mostrar N/A
        coinsCount.textContent = 'N/A';
        exchangesCount.textContent = 'N/A';
        marketCap.textContent = 'N/A';
        marketCapChangeElement.textContent = 'N/A';
        volume.textContent = 'N/A';
        dominance.textContent = 'BTC N/A% - ETH N/A%';
        console.error(error);
      });
  }
}

/**
 * displayGlobalData:
 * - Recibe objeto globalData con datos de CoinGecko
 * - Muestra en el DOM:
 *     • Cantidad de criptomonedas activas
 *     • Número de exchanges
 *     • Market Cap total (en trillones)
 *     • Cambio porcentual del Market Cap en 24h (con icono y color)
 *     • Volumen total en USD (en miles de millones)
 *     • Dominancia de BTC y ETH (porcentaje)
 */
function displayGlobalData(globalData) {
  coinsCount.textContent = globalData.active_cryptocurrencies || 'N/A';
  exchangesCount.textContent = globalData.markets || 'N/A';

  marketCap.textContent = globalData.total_market_cap?.usd
    ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T`
    : 'N/A';

  const marketCapChange = globalData.market_cap_change_percentage_24h_usd;
  if (marketCapChange !== undefined) {
    const changeText = `${marketCapChange.toFixed(1)}%`;
    marketCapChangeElement.innerHTML = `
      ${changeText}
      <i class="${marketCapChange < 0 ? 'red' : 'green'} ri-arrow-${marketCapChange < 0 ? 'down' : 'up'}-s-fill"></i>
    `;
    marketCapChangeElement.style.color = marketCapChange < 0 ? 'red' : 'green';
  } else {
    marketCapChangeElement.textContent = 'N/A';
  }

  volume.textContent = globalData.total_volume?.usd
    ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B`
    : 'N/A';

  const btcDominance = globalData.market_cap_percentage?.btc
    ? `${globalData.market_cap_percentage.btc.toFixed(1)}%`
    : 'N/A';
  const ethDominance = globalData.market_cap_percentage?.eth
    ? `${globalData.market_cap_percentage.eth.toFixed(1)}%`
    : 'N/A';
  dominance.textContent = `BTC ${btcDominance} - ETH ${ethDominance}`;
}

/**
 * toggleSpinner:
 * - Muestra u oculta un spinner y una lista en función de 'show'
 * - listId: ID del elemento lista
 * - spinnerId: ID del elemento spinner
 * - show: booleano. Si true, muestra spinner y oculta lista; si false, al revés.
 */
function toggleSpinner(listId, spinnerId, show) {
  const listElement = document.getElementById(listId);
  const spinnerElement = document.getElementById(spinnerId);

  if (spinnerElement) {
    spinnerElement.style.display = show ? 'block' : 'none';
  }
  if (listElement) {
    listElement.style.display = show ? 'none' : 'block';
  }
}

/**
 * createTable:
 * - Crea dinámicamente una tabla HTML con encabezados dados
 * - headers: array de strings para cada <th>
 * - fixedIndex: índice (opcional) para añadir clase 'table-fixed-column' a esa columna
 * - Devuelve el elemento <table> creado, con el <thead> y fila de encabezados.
 */
function createTable(headers, fixedIndex = 0) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  table.appendChild(thead);

  const headerRow = document.createElement('tr');
  headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.textContent = header;
    if (index === fixedIndex) {
      th.classList.add('table-fixed-column');
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  return table;
}

/**
 * createWidget:
 * - Inserta un widget de TradingView en el contenedor especificado
 * - containerId: ID del <div> contenedor en el HTML
 * - widgetConfig: objeto de configuración para el script de TradingView
 * - widgetSrc: URL del script de TradingView a cargar
 */
function createWidget(containerId, widgetConfig, widgetSrc) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpiar contenido previo

  // Crear DIV que usará el script de TradingView
  const widgetDiv = document.createElement('div');
  widgetDiv.classList.add('tradingview-widget-container__widget');
  container.appendChild(widgetDiv);

  // Crear y configurar etiqueta <script> con JSON de configuración
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = widgetSrc;
  script.async = true;
  script.innerHTML = JSON.stringify(widgetConfig);
  container.appendChild(script);

  // Después de 5 segundos, mostrar copyright si está oculto
  setTimeout(() => {
    const copyright = document.querySelector('.tradingview-widget-copyright');
    if (copyright) {
      copyright.classList.remove('hidden');
    }
  }, 5000);
}

// Funciones para manejo de scroll-to-top

// Botón de “ir arriba”
const scrollTopBtn = document.getElementById('scrollTop');

// Cuando el usuario hace scroll, comprobar si mostrar el botón
window.onscroll = () => {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTopBtn.style.display = 'flex';
  } else {
    scrollTopBtn.style.display = 'none';
  }
}

// Función para hacer scroll hasta arriba
function scrollToTop() {
  document.body.scrollTop = 0; // Para Safari
  document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE y Opera
}

// Función para comprobar la validez del token del usuario
function checkAccessTokenValidity() {
  const tokenRaw = localStorage.getItem('access_token');
  if (!tokenRaw) return false;

  try {
    const tokenObj = JSON.parse(tokenRaw);
    const timestamp = tokenObj.timestamp;
    const now = Date.now();
    const hoursPassed = (now - timestamp) / (1000 * 3600); // ms → horas

    if (hoursPassed > 23) {
      localStorage.removeItem('access_token');
      alert("Session expired. Log in again.");
      window.location.href = '../Frontend/Pages/login.html';
      return false;
    }

    // Token válido, devolver token (por ejemplo, el access_token guardado en data)
    return tokenObj.data || tokenObj.access_token || tokenRaw;
  } catch (err) {
    // Token corrupto o malformado
    localStorage.removeItem('access_token');
    window.location.href = '../Frontend/Pages/login.html';
    return false;
  }
}