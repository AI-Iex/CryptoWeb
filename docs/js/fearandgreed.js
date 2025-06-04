// Función para obtener el índice de miedo y codicia
async function fetchFearGreedIndex() {
    try {
        const response = await fetch('https://api.alternative.me/fng/?limit=5');
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
            // Procesar datos
            const current = data.data[0];
            const historical = data.data.slice(1);
            
            // Actualizar UI con datos actuales
            document.getElementById('index-value').textContent = current.value;
            document.getElementById('index-classification').textContent = current.value_classification;
            document.getElementById('last-updated').textContent = formatDate(parseInt(current.timestamp) * 1000);

            // Actualizar la visualización circular
            updateIndexVisual(current.value);
            
            // Actualizar la barra de progreso
            updateProgressBar(current.value);

             // Actualizar el borde de la tarjeta
            updateCardBorder(current.value);
            
            // Aplicar clase según la clasificación
            const classificationElement = document.getElementById('index-classification');
            classificationElement.className = 'index-classification';
            
            if (current.value_classification.includes("Extreme Fear")) {
                classificationElement.classList.add('extreme-fear');
            } else if (current.value_classification.includes("Fear")) {
                classificationElement.classList.add('fear');
            } else if (current.value_classification.includes("Neutral")) {
                classificationElement.classList.add('neutral');
            } else if (current.value_classification.includes("Greed")) {
                classificationElement.classList.add('greed');
            } else if (current.value_classification.includes("Extreme Greed")) {
                classificationElement.classList.add('extreme-greed');
            }
            
            // Generar tarjetas históricas
            const historyContainer = document.getElementById('history-cards');
            historyContainer.innerHTML = '';
            
            historical.forEach(item => {
                const card = document.createElement('div');
                card.className = 'history-card';
                
                // Determinar clase según la clasificación
                let valueClass = '';
                if (item.value_classification.includes("Extreme Fear")) valueClass = 'extreme-fear';
                else if (item.value_classification.includes("Fear")) valueClass = 'fear';
                else if (item.value_classification.includes("Neutral")) valueClass = 'neutral';
                else if (item.value_classification.includes("Greed")) valueClass = 'greed';
                else if (item.value_classification.includes("Extreme Greed")) valueClass = 'extreme-greed';
                
                card.innerHTML = `
                    <p class="date">${formatDate(parseInt(item.timestamp) * 1000)}</p>
                    <div class="value ${valueClass}">${item.value}</div>
                    <p class="classification">${item.value_classification}</p>
                `;
                
                historyContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
        document.getElementById('index-value').textContent = '--';
        document.getElementById('index-classification').textContent = 'Error loading data';
        updateIndexVisual(0);
        updateProgressBar(0);
    }
}

// Función para actualizar la visualización circular
function updateIndexVisual(value) {
    const progressRing = document.querySelector('.progress-ring-fill');
    const indexValue = parseInt(value);
    
    // Se comprueba de que el valor esté entre 0 y 100
    const normalizedValue = Math.min(100, Math.max(0, indexValue));
    
    // Se calcula la circunferencia
    const circumference = 2 * Math.PI * 90;
    
    // Calcular el offset basado en el valor
    const offset = circumference - (normalizedValue / 100) * circumference;
    
    // Aplicar estilos al círculo de progreso
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = offset;
    
    // Establecer color según el valor
    if (normalizedValue <= 20) {
        progressRing.style.stroke = '#ff3a33';
    } else if (normalizedValue <= 40) {
        progressRing.style.stroke = '#ff8c33';
    } else if (normalizedValue <= 60) {
        progressRing.style.stroke = '#f6ff33';
    } else if (normalizedValue <= 80) {
        progressRing.style.stroke = '#5fff33';
    } else {
        progressRing.style.stroke = '#33ff71';
    }
}

// Función para actualizar la barra de progreso
function updateProgressBar(value) {
    const progressBar = document.getElementById('progress-bar');
    const normalizedValue = Math.min(100, Math.max(0, parseInt(value)));
    progressBar.style.width = `${normalizedValue}%`;
}

// Función para formatear fechas
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Función para actualizar el borde de la tarjeta según el índice
function updateCardBorder(value) {
    const card = document.querySelector('.fear-greed-card');
    const indexValue = parseInt(value);
    
    // Asegurarse de que el valor esté entre 0 y 100
    const normalizedValue = Math.min(100, Math.max(0, indexValue));
    
    // Determinar colores del gradiente según el valor del índice
    let color1, color2, color3;
    
    if (normalizedValue <= 20) { // Extreme Fear
        color1 = '#ff3a33';
        color2 = '#ff3a33';
        color3 = '#ff3a33';
    } else if (normalizedValue <= 40) { // Fear
        color1 = '#ff8c33';
        color2 = '#f6ff33';
        color3 = '#ff8c33';
    } else if (normalizedValue <= 60) { // Neutral
        color1 = '#f6ff33';
        color2 = '#f6ff33';
        color3 = '#f6ff33';
    } else if (normalizedValue <= 80) { // Greed
        color1 = '#5fff33';
        color2 = '#33ff71';
        color3 = '#5fff33';
    } else { // Extreme Greed
        color1 = '#33ff71';
        color2 = '#33ffcc';
        color3 = '#33ff71';
    }
    
    // Crear el nuevo gradiente
    const newGradient = `linear-gradient(45deg, ${color1}, ${color2}, ${color3})`;
    
    // Actualizar el gradiente mediante variables CSS
    card.style.setProperty('--border-gradient', newGradient);
}

// Sección del Gráfico
let fearGreedChart;
let chartDataCache = {};

// Obtener el histórico de datos
async function fetchHistoricalData(days) {
    const url = `https://api.alternative.me/fng/?limit=${days}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.reverse(); // Del más antiguo al más reciente
}

// Obtiene el color en función del value
function getColorFromValue(value) {
    if (value <= 20) return '#ff3a33';      // Extreme Fear
    if (value <= 40) return '#ff8c33';      // Fear
    if (value <= 60) return '#f6ff33';      // Neutral
    if (value <= 80) return '#5fff33';      // Greed
    return '#33ff71';                       // Extreme Greed
}

// Crea el gradiente de colores tanto en la linea como por debajo
function createGradient(ctx, chartArea, values, alpha = 1) {
    const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);

    values.forEach((val, idx) => {
        const stop = idx / (values.length - 1);
        const color = hexToRgba(getColorFromValue(val), alpha); // Usa el valor real
        gradient.addColorStop(stop, color);
    });

    return gradient;
}

// Parsea el color de hexadecimal a rgba
function hexToRgba(hex, alpha = 1) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Renderiza la gráfica del historico de fear and greed
async function renderFearGreedChart(days = 30) {
    if (!chartDataCache[days]) {
        chartDataCache[days] = await fetchHistoricalData(days);
    }

    const rawData = chartDataCache[days];
    const labels = rawData.map(d => new Date(d.timestamp * 1000).toLocaleDateString());
    const values = rawData.map(d => parseInt(d.value));

    const canvas = document.getElementById('fearGreedChart');
    const ctx = canvas.getContext('2d');

    if (fearGreedChart) fearGreedChart.destroy();

    fearGreedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fear & Greed Index',
                data: values,
                fill: true,
                tension: 0.3,
                pointBorderColor: '#000',   // Borde negro
                pointBorderWidth: 0.2,      // Grosor del borde
                borderWidth: 2,
                pointRadius: 3,             // Se muestran los puntos
                pointHoverRadius: 6,        // Se agrandan al pasar el ratón
                pointBackgroundColor: values.map(v => getColorFromValue(v)),
                borderColor: context => {
                    const chart = context.chart;
                    const {ctx: canvas, chartArea} = chart;
                    if (!chartArea) return '#888';
                    return createGradient(canvas, chartArea, values, 1);
                },
                backgroundColor: context => {
                    const chart = context.chart;
                    const {ctx: canvas, chartArea} = chart;
                    if (!chartArea) return 'rgba(0,0,0,0)';
                    return createGradient(canvas, chartArea, values, 0.4);
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `Valor: ${context.raw}`
                    }
                }
            },
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}

// Botones para cambiar entre 7, 30 o 90 dias
document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const days = parseInt(btn.getAttribute('data-days'));
        renderFearGreedChart(days);
    });
});


// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    fetchFearGreedIndex();
    renderFearGreedChart(7);
    
    // Actualizar cada 15 minutos
    setInterval(fetchFearGreedIndex, 15 * 60 * 1000);
});
