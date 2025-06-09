// ================================
// Variables del DOM
// ================================
const modeSelect     = document.getElementById('mode');
const groupHL        = document.getElementById('group-headlines');
const groupCat       = document.getElementById('group-category');
const groupTopic     = document.getElementById('group-topic');
const countrySelect  = document.getElementById('country');
const categorySelect = document.getElementById('category');
const topicSelect    = document.getElementById('topic');
const loadBtn        = document.getElementById('loadBtn');
const articles       = document.getElementById('articles');

// ================================
// Configuración de caché
// ================================
const CACHE_PREFIX    = 'news_cache_';
const CACHE_DURATION  = 70 * 60 * 1000; // 70 minutos

function getCache(key) {
  const entry = localStorage.getItem(key);
  if (!entry) return null;
  try {
    const { timestamp, data } = JSON.parse(entry);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    localStorage.removeItem(key);
  }
  return null;
}

function setCache(key, data) {
  const entry = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(key, JSON.stringify(entry));
}

// ================================
// Listeners
// ================================
modeSelect.addEventListener('change', () => {
  if (modeSelect.value === 'topic') {
    groupHL.style.display   = 'none';
    groupCat.style.display  = 'none';
    groupTopic.style.display= 'flex';
  } else {
    groupHL.style.display   = 'flex';
    groupCat.style.display  = 'flex';
    groupTopic.style.display= 'none';
  }
});

loadBtn.addEventListener('click', fetchHeadlines);

// ================================
// Inicialización al cargar la página
// ================================
document.addEventListener('DOMContentLoaded', () => {
    const token = checkAccessTokenValidity();
    const loginContainer = document.getElementById('news-login-message');
    const newsContainer  = document.querySelector('.news-container');

    if (!token) {
    // No hay token: ocultar noticias y mostrar mensaje de login
    loginContainer.style.display = 'flex';
    newsContainer.style.display  = 'none';
    return; // salimos antes de cargar noticias
    }

    // Hay token: ocultar mensaje de login y mostrar noticias
    loginContainer.style.display = 'none';
    newsContainer.style.display  = 'block';


  // 1) Por defecto en Modo "Temática"
  modeSelect.value = 'topic';
  modeSelect.dispatchEvent(new Event('change'));

  // 2) Por defecto Topic = "Criptomonedas"
  topicSelect.value = 'crypto';

  // 3) Cargar noticias con esos valores
  fetchHeadlines();
});

// ================================
// Función: Noticias (desde backend FastAPI)
// ================================
async function fetchHeadlines() {
  const mode     = modeSelect.value;      
  const country  = countrySelect.value;   
  const category = categorySelect.value;  
  const topic    = topicSelect.value;     

  const params = new URLSearchParams({ mode, country, category, topic });
  const url    = `${API_BASE_URL}/news?${params.toString()}`;

  articles.innerHTML = '<p>Cargando noticias…</p>';

  const cacheKey = CACHE_PREFIX + params.toString();

  // 1) Intentar obtener del cache
  const cached = getCache(cacheKey);
  if (cached) {
    renderArticles(cached);
    return;
  }

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Servidor respondió ${res.status}`);
    const list = await res.json();
    renderArticles(list);
  } catch (err) {
    console.error('Error al cargar noticias:', err);
    articles.innerHTML = `<p class="error">Error al cargar noticias: ${err.message}</p>`;
  }
}

// ================================
// Función: Renderizar noticias
// ================================
function renderArticles(list) {
  articles.innerHTML = '';
  if (!list.length) {
    articles.innerHTML = '<p>No articles were found.</p>';
    return;
  }

  list
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .forEach(a => {
      const card = document.createElement('div');
      card.className = 'news-card';

      if (a.urlToImage) {
        const img = document.createElement('img');
        img.src = a.urlToImage;
        img.alt = a.title;
        img.onerror = () => img.replaceWith(createPlaceholder());
        card.appendChild(img);
      } else {
        card.appendChild(createPlaceholder());
      }

      const c = document.createElement('div');
      c.className = 'news-content';
      c.innerHTML = `
        <h3>${a.title}</h3>
        <p class="news-meta">
          ${a.source.name} · ${new Date(a.publishedAt).toLocaleDateString()}
        </p>
        <p>${a.description || ''}</p>
        <a href="${a.url}" target="_blank">Leer más</a>
      `;
      card.appendChild(c);

      articles.appendChild(card);
    });
}

// ================================
// Función: Placeholder de imagen
// ================================
function createPlaceholder() {
  const ph = document.createElement('div');
  ph.className = 'placeholder';
  ph.textContent = 'Image not available';
  return ph;
}
